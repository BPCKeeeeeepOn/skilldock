import { execFile } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { getSkillBySlug } from "@/data/catalog";
import { PLATFORMS } from "@/data/platforms";
import type {
  AgentDetectMode,
  AgentInstallResult,
  HandshakeCheckItem,
  InstalledFileSummary,
  InstallScope,
  InstallSkillResponse,
  LocalAgentsSnapshot,
  LocalAgentStatus,
  UninstallSkillResponse,
} from "@/types/local-agent";
import type { PlatformId, SkillItem } from "@/types/skill";

const execFileAsync = promisify(execFile);

interface AgentSpec {
  id: PlatformId;
  cliBinaries: string[];
  versionArgs: string[];
  appBundles: string[];
  homeDirRelative: string;
  globalSkillsRelative: string;
  extraBinDirs: string[];
}

const AGENT_SPECS: Record<PlatformId, AgentSpec> = {
  "claude-code": {
    id: "claude-code",
    cliBinaries: ["claude"],
    versionArgs: ["--version"],
    appBundles: ["/Applications/Claude.app"],
    homeDirRelative: ".claude",
    globalSkillsRelative: path.join(".claude", "skills"),
    extraBinDirs: [],
  },
  codex: {
    id: "codex",
    cliBinaries: ["codex"],
    versionArgs: ["--version"],
    appBundles: [],
    homeDirRelative: ".codex",
    globalSkillsRelative: path.join(".codex", "skills"),
    extraBinDirs: [],
  },
  cursor: {
    id: "cursor",
    cliBinaries: ["cursor"],
    versionArgs: ["--version"],
    appBundles: ["/Applications/Cursor.app"],
    homeDirRelative: ".cursor",
    globalSkillsRelative: path.join(".cursor", "skills"),
    extraBinDirs: ["/Applications/Cursor.app/Contents/Resources/app/bin"],
  },
  antigravity: {
    id: "antigravity",
    cliBinaries: ["agy"],
    versionArgs: ["--version"],
    appBundles: ["/Applications/Antigravity.app"],
    homeDirRelative: path.join(".gemini", "antigravity"),
    globalSkillsRelative: path.join(".gemini", "antigravity", "skills"),
    extraBinDirs: ["/Applications/Antigravity.app/Contents/Resources/app/bin"],
  },
  "gemini-cli": {
    id: "gemini-cli",
    cliBinaries: ["gemini"],
    versionArgs: ["--version"],
    appBundles: [],
    homeDirRelative: ".gemini",
    globalSkillsRelative: path.join(".gemini", "skills"),
    extraBinDirs: [],
  },
  copilot: {
    id: "copilot",
    cliBinaries: ["copilot"],
    versionArgs: ["--version"],
    appBundles: ["/Applications/Visual Studio Code.app"],
    homeDirRelative: ".copilot",
    globalSkillsRelative: path.join(".copilot", "skills"),
    extraBinDirs: [
      "/Applications/Visual Studio Code.app/Contents/Resources/app/bin",
    ],
  },
  windsurf: {
    id: "windsurf",
    cliBinaries: ["windsurf"],
    versionArgs: ["--version"],
    appBundles: ["/Applications/Windsurf.app"],
    homeDirRelative: path.join(".codeium", "windsurf"),
    globalSkillsRelative: path.join(".codeium", "windsurf", "skills"),
    extraBinDirs: ["/Applications/Windsurf.app/Contents/Resources/app/bin"],
  },
  opencode: {
    id: "opencode",
    cliBinaries: ["opencode"],
    versionArgs: ["--version"],
    appBundles: [],
    homeDirRelative: ".opencode",
    globalSkillsRelative: path.join(".opencode", "skills"),
    extraBinDirs: [],
  },
};

interface StoredConnectionState {
  connectedIds: PlatformId[];
  updatedAt: string;
}

const VALID_PLATFORM_IDS = new Set<PlatformId>(PLATFORMS.map((p) => p.id));

const ALLOWED_TEXT_EXTS = new Set([
  ".md",
  ".mdx",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".py",
  ".sh",
  ".bash",
  ".zsh",
  ".css",
  ".html",
  ".glsl",
  ".wgsl",
  ".svg",
  ".gd",
  ".lua",
  ".luau",
]);

const ROOT_ALLOWED_TOP_DIRS = new Set([
  "scripts",
  "references",
  "templates",
  "rules",
  "examples",
  "prompts",
  "schemas",
  "src",
  "agents",
]);

function getConnectionStorePath(): string {
  return path.join(os.homedir(), ".skilldock", "connected-agents.json");
}

function getSearchBinDirs(): string[] {
  const home = os.homedir();
  const rawEnvPath = process.env.PATH ?? "";
  const envDirs = rawEnvPath.split(path.delimiter).filter(Boolean);
  const common = [
    "/opt/homebrew/bin",
    "/opt/homebrew/sbin",
    "/usr/local/bin",
    "/usr/bin",
    path.join(home, ".local", "bin"),
    path.join(home, ".bun", "bin"),
    path.join(home, ".npm-global", "bin"),
  ];

  const nvmDirs: string[] = [];
  const nvmRoot = path.join(home, ".nvm", "versions", "node");
  try {
    if (fs.existsSync(nvmRoot)) {
      const versions = fs
        .readdirSync(nvmRoot)
        .filter((v) => v.startsWith("v"))
        .sort()
        .reverse();
      for (const ver of versions) {
        nvmDirs.push(path.join(nvmRoot, ver, "bin"));
      }
    }
  } catch {
    // ignore nvm lookup failure
  }

  return Array.from(new Set([...envDirs, ...nvmDirs, ...common]));
}

async function resolveExecutable(
  names: string[],
  extraDirs: string[],
  binDirs: string[]
): Promise<string | null> {
  const dirs = Array.from(new Set([...extraDirs, ...binDirs]));
  const isWin = process.platform === "win32";
  const exts = isWin ? ["", ".cmd", ".exe", ".bat"] : [""];

  for (const name of names) {
    for (const dir of dirs) {
      for (const ext of exts) {
        const candidate = path.join(dir, `${name}${ext}`);
        try {
          const stat = await fsp.stat(candidate);
          if (!stat.isFile()) continue;
          if (!isWin) {
            await fsp.access(candidate, fs.constants.X_OK);
          }
          return candidate;
        } catch {
          // continue searching
        }
      }
    }
  }
  return null;
}

async function readBinaryVersion(
  binaryPath: string,
  args: string[]
): Promise<string | null> {
  try {
    const { stdout, stderr } = await execFileAsync(binaryPath, args, {
      timeout: 2500,
    });
    const combined = `${stdout ?? ""}\n${stderr ?? ""}`
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return combined[0]?.slice(0, 80) ?? "ready";
  } catch {
    return null;
  }
}

async function listSkillDirs(dirPath: string): Promise<string[]> {
  try {
    const entries = await fsp.readdir(dirPath, { withFileTypes: true });
    const names: string[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      if (entry.isDirectory()) {
        names.push(entry.name);
        continue;
      }
      if (entry.isSymbolicLink()) {
        try {
          const targetStat = await fsp.stat(path.join(dirPath, entry.name));
          if (targetStat.isDirectory()) {
            names.push(entry.name);
          }
        } catch {
          // broken symlink ignored
        }
      }
    }
    return names.sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function isPathWritable(targetDir: string): Promise<boolean> {
  let cursor = path.resolve(targetDir);
  for (let depth = 0; depth < 6; depth += 1) {
    try {
      await fsp.access(cursor, fs.constants.F_OK);
      await fsp.access(cursor, fs.constants.W_OK);
      return true;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === "ENOENT") {
        const parent = path.dirname(cursor);
        if (parent === cursor) return false;
        cursor = parent;
        continue;
      }
      return false;
    }
  }
  return false;
}

export async function readConnectionState(): Promise<{
  configured: boolean;
  connectedIds: PlatformId[];
}> {
  try {
    const raw = await fsp.readFile(getConnectionStorePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<StoredConnectionState>;
    const ids = Array.isArray(parsed.connectedIds)
      ? parsed.connectedIds.filter((id): id is PlatformId =>
          VALID_PLATFORM_IDS.has(id)
        )
      : [];
    return { configured: true, connectedIds: Array.from(new Set(ids)) };
  } catch {
    return { configured: false, connectedIds: [] };
  }
}

export async function writeConnectionState(
  connectedIds: PlatformId[]
): Promise<PlatformId[]> {
  const normalized = Array.from(
    new Set(connectedIds.filter((id) => VALID_PLATFORM_IDS.has(id)))
  );
  const storePath = getConnectionStorePath();
  await fsp.mkdir(path.dirname(storePath), { recursive: true });
  const payload: StoredConnectionState = {
    connectedIds: normalized,
    updatedAt: new Date().toISOString(),
  };
  await fsp.writeFile(storePath, JSON.stringify(payload, null, 2), "utf8");
  return normalized;
}

export function resolveSafeProjectPath(rawProjectPath?: string): string {
  const defaultPath = process.cwd();
  if (!rawProjectPath || !rawProjectPath.trim()) {
    return defaultPath;
  }
  const expanded = rawProjectPath.trim().startsWith("~/")
    ? path.join(os.homedir(), rawProjectPath.trim().slice(2))
    : rawProjectPath.trim();
  const resolved = path.resolve(expanded);
  try {
    if (fs.statSync(resolved).isDirectory()) {
      return resolved;
    }
  } catch {
    // fallback if invalid path
  }
  return defaultPath;
}

export function resolveAgentTargetDir(
  agentId: PlatformId,
  skillSlug: string,
  scope: InstallScope,
  projectPath?: string
): { baseSkillsDir: string; targetDir: string } {
  if (!/^[a-z0-9][a-z0-9._-]{0,79}$/i.test(skillSlug)) {
    throw new Error(`非法的 Skill 目录名: ${skillSlug}`);
  }
  const platform = PLATFORMS.find((p) => p.id === agentId);
  const spec = AGENT_SPECS[agentId];
  if (!platform || !spec) {
    throw new Error(`不支持的智能体平台: ${agentId}`);
  }

  let baseSkillsDir: string;
  if (scope === "global") {
    baseSkillsDir = path.join(os.homedir(), spec.globalSkillsRelative);
  } else {
    const safeProject = resolveSafeProjectPath(projectPath);
    const cleanRel = platform.skillPathTemplate
      .replace("<slug>/", "")
      .replace("<slug>", "")
      .replace(/\/+$/, "");
    baseSkillsDir = path.resolve(/*turbopackIgnore: true*/ safeProject, cleanRel);
  }

  const resolvedBase = path.resolve(/*turbopackIgnore: true*/ baseSkillsDir);
  const targetDir = path.resolve(
    /*turbopackIgnore: true*/ resolvedBase,
    skillSlug
  );
  if (!targetDir.startsWith(resolvedBase + path.sep)) {
    throw new Error("目标安装路径越界保护触发");
  }
  return { baseSkillsDir: resolvedBase, targetDir };
}

export async function scanLocalAgents(
  rawProjectPath?: string
): Promise<LocalAgentsSnapshot> {
  const home = os.homedir();
  const projectPath = resolveSafeProjectPath(rawProjectPath);
  const binDirs = getSearchBinDirs();
  const { configured, connectedIds } = await readConnectionState();
  const connectedSet = new Set<PlatformId>(connectedIds);

  const sharedAgentsDir = path.join(home, ".agents", "skills");
  const sharedInstalledSkills = await listSkillDirs(sharedAgentsDir);

  const agents: LocalAgentStatus[] = await Promise.all(
    PLATFORMS.map(async (platform) => {
      const spec = AGENT_SPECS[platform.id];
      const homeDirPath = path.join(home, spec.homeDirRelative);
      const globalSkillsDir = path.join(home, spec.globalSkillsRelative);

      const [binaryPath, installedSkills, writable] = await Promise.all([
        resolveExecutable(spec.cliBinaries, spec.extraBinDirs, binDirs),
        listSkillDirs(globalSkillsDir),
        isPathWritable(globalSkillsDir),
      ]);

      const binaryVersion = binaryPath
        ? await readBinaryVersion(binaryPath, spec.versionArgs)
        : null;

      let appBundlePath: string | null = null;
      for (const appPath of spec.appBundles) {
        if (fs.existsSync(appPath)) {
          appBundlePath = appPath;
          break;
        }
      }

      const homeExists = fs.existsSync(homeDirPath);
      const detectMode: AgentDetectMode = binaryPath
        ? "cli-ready"
        : homeExists || appBundlePath
          ? "dir-ready"
          : "not-found";

      const { baseSkillsDir: projectSkillsDir } = resolveAgentTargetDir(
        platform.id,
        "probe-check",
        "project",
        projectPath
      );
      const projectInstalledSkills = await listSkillDirs(projectSkillsDir);

      return {
        id: platform.id,
        name: platform.name,
        vendor: platform.vendor,
        detectMode,
        detected: detectMode !== "not-found",
        connected: connectedSet.has(platform.id),
        cliCommand: spec.cliBinaries[0],
        binaryPath,
        binaryVersion,
        appBundlePath,
        homeDirPath,
        globalSkillsDir,
        projectSkillTemplate: platform.skillPathTemplate,
        writable,
        installedSkills,
        projectInstalledSkills,
        notes: platform.notes,
      };
    })
  );

  // Sort detected CLIs first cleanly while preserving deterministic sub-order
  const orderWeight: Record<AgentDetectMode, number> = {
    "cli-ready": 0,
    "dir-ready": 1,
    "not-found": 2,
  };
  agents.sort((a, b) => orderWeight[a.detectMode] - orderWeight[b.detectMode]);

  return {
    scannedAt: new Date().toISOString(),
    hostname: os.hostname(),
    platform: process.platform,
    homeDir: home,
    defaultProjectPath: process.cwd(),
    projectPath,
    sharedAgentsDir,
    sharedInstalledSkills,
    agents,
    connectedIds: agents.filter((a) => a.connected).map((a) => a.id),
    connectionsConfigured: configured,
  };
}

export async function runAgentHandshakes(
  agentIds: PlatformId[],
  rawProjectPath?: string
): Promise<{
  checks: HandshakeCheckItem[];
  snapshot: LocalAgentsSnapshot;
}> {
  const snapshot = await scanLocalAgents(rawProjectPath);
  const byId = new Map(snapshot.agents.map((a) => [a.id, a]));
  const binDirs = getSearchBinDirs();
  const checks: HandshakeCheckItem[] = [];

  for (const agentId of agentIds) {
    const t0 = Date.now();
    const spec = AGENT_SPECS[agentId];
    const current = byId.get(agentId);
    if (!spec || !current) continue;

    let versionOut = current.binaryVersion;
    if (current.binaryPath) {
      versionOut = await readBinaryVersion(
        current.binaryPath,
        spec.versionArgs
      );
    }

    let ghCheck = "";
    const writable = await isPathWritable(current.globalSkillsDir);
    if (current.binaryPath) {
      ghCheck = `CLI ${versionOut ?? "ready"} 可执行`;
    } else if (current.detected) {
      ghCheck = `本地环境目录存在 (${current.appBundlePath ?? current.homeDirPath})`;
    } else {
      const ghPath = await resolveExecutable(["gh"], [], binDirs);
      ghCheck = ghPath
        ? "未发现对应 CLI（已配置目录挂载模式，安装时将自动创建目标技能目录）"
        : "未在本机检测到二进制（安装时将创建对应技能目录）";
    }

    checks.push({
      agentId,
      name: current.name,
      ok: writable,
      detectMode: current.detectMode,
      binaryPath: current.binaryPath,
      binaryVersion: versionOut,
      skillsDir: current.globalSkillsDir,
      writable,
      latencyMs: Math.max(1, Date.now() - t0),
      message: writable
        ? `${ghCheck} · 目标目录可写入`
        : `${ghCheck} · 目标目录不可写，请检查权限`,
    });
  }

  return { checks, snapshot };
}

interface ParsedRepoSource {
  owner: string;
  repoName: string;
  repo: string;
  branch: string;
  skillDir: string;
  promptBlobPath?: string;
  skillMeta?: {
    slug: string;
    title: string;
    englishName: string;
    summary: string;
  };
}

function parseRepoSourceFromSkill(skill: SkillItem): ParsedRepoSource {
  if (skill.skillBlobUrl) {
    const skillMatch = skill.skillBlobUrl.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.*)SKILL\.md$/i
    );
    if (skillMatch) {
      const [, owner, repoName, branch, rawPrefix] = skillMatch;
      const skillDir = rawPrefix.replace(/\/+$/, "");
      return {
        owner,
        repoName,
        repo: `${owner}/${repoName}`,
        branch,
        skillDir,
      };
    }

    const promptMatch = skill.skillBlobUrl.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+\.md)$/i
    );
    if (promptMatch) {
      const [, owner, repoName, branch, promptBlobPath] = promptMatch;
      return {
        owner,
        repoName,
        repo: `${owner}/${repoName}`,
        branch,
        skillDir:
          skill.subpath === "." ? "" : skill.subpath.replace(/^\/+|\/+$/g, ""),
        promptBlobPath,
        skillMeta: {
          slug: skill.slug,
          title: skill.title,
          englishName: skill.englishName,
          summary: skill.summary,
        },
      };
    }
  }
  const [owner, repoName] = skill.repo.split("/");
  return {
    owner,
    repoName,
    repo: skill.repo,
    branch: "main",
    skillDir: skill.subpath === "." ? "" : skill.subpath.replace(/^\/+|\/+$/g, ""),
  };
}

interface GitHubTreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

async function fetchRepoTreeEntries(
  owner: string,
  repoName: string,
  branch: string
): Promise<GitHubTreeEntry[] | null> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/${encodeURIComponent(
    branch
  )}?recursive=1`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "SkillDock-Local-Installer",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(apiUrl, { headers });
    if (res.ok) {
      const json = (await res.json()) as { tree?: GitHubTreeEntry[] };
      if (Array.isArray(json.tree)) {
        return json.tree;
      }
    }
  } catch {
    // fallback to gh CLI if installed
  }

  try {
    const ghPath = await resolveExecutable(["gh"], [], getSearchBinDirs());
    if (ghPath) {
      const { stdout } = await execFileAsync(
        ghPath,
        ["api", `repos/${owner}/${repoName}/git/trees/${branch}?recursive=1`],
        { timeout: 10000, maxBuffer: 12 * 1024 * 1024 }
      );
      const parsed = JSON.parse(stdout) as { tree?: GitHubTreeEntry[] };
      if (Array.isArray(parsed.tree)) {
        return parsed.tree;
      }
    }
  } catch {
    // fallback to raw single SKILL.md fetch
  }

  return null;
}

function shouldIncludeTreeBlob(
  entry: GitHubTreeEntry,
  skillDir: string
): string | null {
  if (entry.type !== "blob") return null;
  if ((entry.size ?? 0) > 512 * 1024) return null;

  let relPath: string;
  if (!skillDir) {
    relPath = entry.path;
  } else {
    const prefix = `${skillDir}/`;
    if (!entry.path.startsWith(prefix)) return null;
    relPath = entry.path.slice(prefix.length);
  }

  if (!relPath || relPath.startsWith(".") || relPath.includes("node_modules/")) {
    return null;
  }

  const base = path.posix.basename(relPath);
  if (base === "SKILL.md") return relPath;

  const ext = path.posix.extname(base).toLowerCase();
  const isLicenseOrReadme =
    base === "README.md" || base.toUpperCase().startsWith("LICENSE");
  if (!ALLOWED_TEXT_EXTS.has(ext) && !isLicenseOrReadme) {
    return null;
  }

  if (!skillDir) {
    // For root-level repos, skip arbitrary demo image/repo root clutter
    const topSeg = relPath.split("/")[0];
    if (relPath.includes("/")) {
      if (!ROOT_ALLOWED_TOP_DIRS.has(topSeg)) return null;
    } else if (!isLicenseOrReadme && !ALLOWED_TEXT_EXTS.has(ext)) {
      return null;
    }
  }

  return relPath;
}

async function fetchRawGitHubText(
  owner: string,
  repoName: string,
  branch: string,
  repoFilePath: string
): Promise<Buffer | null> {
  const encodedPath = repoFilePath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${encodeURIComponent(
    branch
  )}/${encodedPath}`;
  try {
    const res = await fetch(rawUrl, {
      headers: { "User-Agent": "SkillDock-Local-Installer" },
    });
    if (!res.ok) return null;
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  } catch {
    return null;
  }
}

async function discoverRepoSkillSource(
  repo: string,
  preferredSlug?: string
): Promise<ParsedRepoSource> {
  const cleanMatch = repo.trim().match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!cleanMatch) {
    throw new Error(`非法的 GitHub 仓库格式: ${repo}`);
  }
  const [, owner, repoName] = cleanMatch;

  let branch = "main";
  try {
    const metaRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "SkillDock-Local-Installer",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      }
    );
    if (metaRes.ok) {
      const meta = (await metaRes.json()) as { default_branch?: string };
      if (meta.default_branch) branch = meta.default_branch;
    } else {
      const ghPath = await resolveExecutable(["gh"], [], getSearchBinDirs());
      if (ghPath) {
        const { stdout } = await execFileAsync(
          ghPath,
          ["api", `repos/${owner}/${repoName}`, "--jq", ".default_branch"],
          { timeout: 5000 }
        );
        if (stdout.trim()) branch = stdout.trim();
      }
    }
  } catch {
    // keep main default branch
  }

  const tree = await fetchRepoTreeEntries(owner, repoName, branch);
  if (tree) {
    const skillMds = tree
      .filter(
        (e) =>
          e.type === "blob" && path.posix.basename(e.path) === "SKILL.md"
      )
      .sort((a, b) => a.path.length - b.path.length);

    if (skillMds.length > 0) {
      const matched =
        (preferredSlug &&
          skillMds.find((s) =>
            s.path.toLowerCase().includes(preferredSlug.toLowerCase())
          )) ||
        skillMds[0];
      const skillDir = path.posix.dirname(matched.path);
      return {
        owner,
        repoName,
        repo: `${owner}/${repoName}`,
        branch,
        skillDir: skillDir === "." ? "" : skillDir,
      };
    }
  }

  return {
    owner,
    repoName,
    repo: `${owner}/${repoName}`,
    branch,
    skillDir: "",
  };
}

interface DownloadedSkillFile {
  relPath: string;
  content: Buffer;
}

function buildSkillMdFromPrompt(
  rawPrompt: string,
  source: ParsedRepoSource
): Buffer {
  const trimmed = rawPrompt.trimStart();
  if (trimmed.startsWith("---\n") || trimmed.startsWith("---\r\n")) {
    return Buffer.from(rawPrompt, "utf8");
  }
  const name = source.skillMeta?.slug || source.repoName.toLowerCase();
  const description =
    source.skillMeta?.summary ||
    `${source.skillMeta?.englishName || name} from ${source.repo}`;
  const header = [
    "---",
    `name: ${name}`,
    `description: ${JSON.stringify(description)}`,
    `source: ${source.repo} (${source.promptBlobPath || source.skillDir || "."})`,
    "---",
    "",
  ].join("\n");
  return Buffer.from(header + rawPrompt, "utf8");
}

async function fetchPackagePayload(source: ParsedRepoSource): Promise<{
  files: DownloadedSkillFile[];
  method: "github-tree" | "github-raw-fallback";
}> {
  const tree = await fetchRepoTreeEntries(
    source.owner,
    source.repoName,
    source.branch
  );

  const selected: { repoPath: string; relPath: string }[] = [];
  let method: "github-tree" | "github-raw-fallback" = "github-raw-fallback";

  if (tree) {
    for (const entry of tree) {
      if (source.promptBlobPath && entry.path === source.promptBlobPath) {
        continue;
      }
      const relPath = shouldIncludeTreeBlob(entry, source.skillDir);
      if (relPath) {
        selected.push({ repoPath: entry.path, relPath });
      }
    }
    if (
      source.promptBlobPath &&
      tree.some((e) => e.type === "blob" && e.path === "rubric.md")
    ) {
      selected.push({ repoPath: "rubric.md", relPath: "references/rubric.md" });
    }
    if (
      source.repo === "lemomo-ai/lemo-opuscar" &&
      source.promptBlobPath
    ) {
      for (const extra of [
        ["DIRECTOR.md", "references/DIRECTOR.md"],
        ["TECHNIQUE.md", "references/TECHNIQUE.md"],
        ["plugin/skills/lemo-opuscar/SKILL.md", "references/lemo-opuscar-master-SKILL.md"],
      ]) {
        if (tree.some((e) => e.type === "blob" && e.path === extra[0])) {
          selected.push({ repoPath: extra[0], relPath: extra[1] });
        }
      }
    }
    if (selected.length > 0) {
      method = "github-tree";
    }
  }

  const skillMdRepoPath = source.skillDir
    ? `${source.skillDir}/SKILL.md`
    : "SKILL.md";
  if (
    !source.promptBlobPath &&
    !selected.some((item) => item.relPath === "SKILL.md")
  ) {
    selected.unshift({ repoPath: skillMdRepoPath, relPath: "SKILL.md" });
  }

  // Prioritize SKILL.md first, cap at 45 files & 4MB total
  selected.sort((a, b) => {
    if (a.relPath === "SKILL.md") return -1;
    if (b.relPath === "SKILL.md") return 1;
    return a.relPath.localeCompare(b.relPath);
  });
  const capped = selected.slice(0, source.promptBlobPath ? 44 : 45);

  const files: DownloadedSkillFile[] = [];
  let totalBytes = 0;

  if (source.promptBlobPath) {
    const promptBuf =
      (await fetchRawGitHubText(
        source.owner,
        source.repoName,
        source.branch,
        source.promptBlobPath
      )) ??
      (source.branch === "main"
        ? await fetchRawGitHubText(
            source.owner,
            source.repoName,
            "master",
            source.promptBlobPath
          )
        : null);
    if (promptBuf) {
      const skillBuf = buildSkillMdFromPrompt(
        promptBuf.toString("utf8"),
        source
      );
      totalBytes += skillBuf.length;
      files.push({ relPath: "SKILL.md", content: skillBuf });
    }
  }

  const BATCH_SIZE = 6;

  for (let i = 0; i < capped.length; i += BATCH_SIZE) {
    const chunk = capped.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      chunk.map(async (item) => {
        const buf = await fetchRawGitHubText(
          source.owner,
          source.repoName,
          source.branch,
          item.repoPath
        );
        return { relPath: item.relPath, buf };
      })
    );
    for (const res of results) {
      if (!res.buf) continue;
      if (totalBytes + res.buf.length > 4 * 1024 * 1024) continue;
      totalBytes += res.buf.length;
      files.push({ relPath: res.relPath, content: res.buf });
    }
  }

  if (!source.promptBlobPath && !files.some((f) => f.relPath === "SKILL.md")) {
    // Retry fallback branch "master" if default guess "main" failed
    if (source.branch === "main") {
      const masterBuf = await fetchRawGitHubText(
        source.owner,
        source.repoName,
        "master",
        skillMdRepoPath
      );
      if (masterBuf) {
        files.push({ relPath: "SKILL.md", content: masterBuf });
      }
    }
  }

  if (files.length === 0 || !files.some((f) => f.relPath === "SKILL.md")) {
    throw new Error(
      `未能从 GitHub 仓库 ${source.repo} 拉取到 SKILL.md，请确认该仓库包含标准 SKILL.md`
    );
  }

  return { files, method };
}

export async function installSkillToLocalAgents(params: {
  skillSlug?: string;
  customRepo?: { repo: string; dirName?: string };
  agentIds: PlatformId[];
  scope: InstallScope;
  projectPath?: string;
}): Promise<InstallSkillResponse> {
  const validAgentIds = Array.from(
    new Set(params.agentIds.filter((id) => VALID_PLATFORM_IDS.has(id)))
  );
  if (validAgentIds.length === 0) {
    throw new Error("请至少选择或连接 1 个本地 Agent CLI 目标");
  }

  let installSlug: string;
  let source: ParsedRepoSource;

  if (params.skillSlug) {
    const skill = getSkillBySlug(params.skillSlug);
    if (!skill) {
      throw new Error(`目录中未找到技能: ${params.skillSlug}`);
    }
    installSlug = skill.slug;
    source = parseRepoSourceFromSkill(skill);
  } else if (params.customRepo?.repo) {
    const rawName =
      params.customRepo.dirName ||
      params.customRepo.repo.split("/")[1] ||
      "custom-skill";
    installSlug = rawName
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
    if (!installSlug) {
      throw new Error("无法生成有效的 Skill 安装目录名");
    }
    source = await discoverRepoSkillSource(params.customRepo.repo, installSlug);
  } else {
    throw new Error("缺少 skillSlug 或 customRepo 安装参数");
  }

  const { files, method } = await fetchPackagePayload(source);
  const fileSummaries: InstalledFileSummary[] = files.map((f) => ({
    path: f.relPath,
    bytes: f.content.length,
  }));

  const manifestJson = JSON.stringify(
    {
      installedBy: "SKILLDOCK",
      slug: installSlug,
      repo: source.repo,
      branch: source.branch,
      skillDir: source.skillDir || ".",
      installedAt: new Date().toISOString(),
      files: fileSummaries,
    },
    null,
    2
  );

  const results: AgentInstallResult[] = [];
  for (const agentId of validAgentIds) {
    const platform = PLATFORMS.find((p) => p.id === agentId)!;
    try {
      const { baseSkillsDir, targetDir } = resolveAgentTargetDir(
        agentId,
        installSlug,
        params.scope,
        params.projectPath
      );
      await fsp.mkdir(baseSkillsDir, { recursive: true });
      await fsp.mkdir(targetDir, { recursive: true });

      const resolvedTarget = path.resolve(targetDir);
      let writtenBytes = 0;

      for (const file of files) {
        const cleanSegments = file.relPath
          .split("/")
          .filter((seg) => seg && seg !== "." && seg !== "..");
        if (cleanSegments.length === 0) continue;
        const destFile = path.resolve(resolvedTarget, ...cleanSegments);
        if (!destFile.startsWith(resolvedTarget + path.sep)) {
          continue;
        }
        await fsp.mkdir(path.dirname(destFile), { recursive: true });
        await fsp.writeFile(destFile, file.content);
        writtenBytes += file.content.length;
      }

      await fsp.writeFile(
        path.join(resolvedTarget, ".skilldock.json"),
        manifestJson,
        "utf8"
      );

      results.push({
        agentId,
        agentName: platform.name,
        ok: true,
        targetDir: resolvedTarget,
        skillMdPath: path.join(resolvedTarget, "SKILL.md"),
        fileCount: files.length,
        totalBytes: writtenBytes,
      });
    } catch (err) {
      results.push({
        agentId,
        agentName: platform.name,
        ok: false,
        targetDir: "",
        skillMdPath: "",
        fileCount: 0,
        totalBytes: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Ensure selected installed agents are persisted as connected
  const currentState = await readConnectionState();
  const mergedConnected = Array.from(
    new Set([
      ...currentState.connectedIds,
      ...results.filter((r) => r.ok).map((r) => r.agentId),
    ])
  );
  await writeConnectionState(mergedConnected);

  const snapshot = await scanLocalAgents(params.projectPath);
  const anyOk = results.some((r) => r.ok);

  return {
    ok: anyOk,
    slug: installSlug,
    repo: source.repo,
    branch: source.branch,
    sourceMethod: method,
    files: fileSummaries,
    results,
    snapshot,
  };
}

export async function uninstallSkillFromLocalAgents(params: {
  skillSlug: string;
  agentIds: PlatformId[];
  scope: InstallScope;
  projectPath?: string;
}): Promise<UninstallSkillResponse> {
  const validAgentIds = Array.from(
    new Set(params.agentIds.filter((id) => VALID_PLATFORM_IDS.has(id)))
  );
  const removedAgents: PlatformId[] = [];
  const skippedAgents: { agentId: PlatformId; reason: string }[] = [];

  for (const agentId of validAgentIds) {
    try {
      const { targetDir } = resolveAgentTargetDir(
        agentId,
        params.skillSlug,
        params.scope,
        params.projectPath
      );
      if (!fs.existsSync(targetDir)) {
        skippedAgents.push({ agentId, reason: "目录不存在" });
        continue;
      }
      await fsp.rm(targetDir, { recursive: true, force: true });
      removedAgents.push(agentId);
    } catch (err) {
      skippedAgents.push({
        agentId,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const snapshot = await scanLocalAgents(params.projectPath);
  return {
    ok: removedAgents.length > 0,
    slug: params.skillSlug,
    removedAgents,
    skippedAgents,
    snapshot,
  };
}
