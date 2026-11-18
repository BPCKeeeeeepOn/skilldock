"use client";

import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  FolderOpen,
  Heart,
  Images,
  Loader2,
  Plug,
  PlugZap,
  RefreshCw,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PLATFORMS } from "@/data/platforms";
import { useFavorites } from "@/lib/favorites";
import {
  formatBytes,
  getSkillAliasNames,
  isSkillInstalledOnAgent,
} from "@/lib/agent-skill-match";
import { CopyButton } from "@/components/copy-button";
import { useLocalAgents } from "@/components/local-agents-provider";
import { SkillVisualBanner } from "@/components/skill-visual-banner";
import type { InstallSkillResponse } from "@/types/local-agent";
import type { PlatformId, SkillFileNode, SkillItem } from "@/types/skill";

export function SkillDetailGallery({ skill }: { skill: SkillItem }) {
  const images =
    skill.galleryImages && skill.galleryImages.length > 0
      ? skill.galleryImages
      : skill.coverImage
        ? [
            {
              src: skill.coverImage,
              alt: skill.title,
              caption: skill.deliverable,
              sourceUrl: skill.coverSourceUrl ?? skill.repoUrl,
            },
          ]
        : [];
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return <SkillVisualBanner skill={skill} tall />;
  }

  const current = images[activeIdx] ?? images[0];

  return (
    <div className="bg-[#f4f3ee]">
      {/* Main Full-Resolution Showcase Stage (no forced aspect crop) */}
      <div className="relative flex h-[320px] items-center justify-center overflow-hidden bg-[#14161b] sm:h-[460px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.alt}
          className="max-h-full max-w-full object-contain"
        />

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/20 bg-[#111216]/85 px-2.5 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
            <Images className="h-3 w-3 text-[#c8ff29]" />
            <span>
              GITHUB 实拍预览 {String(activeIdx + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
          </span>

          <a
            href={current.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto inline-flex items-center gap-1 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-2.5 py-1 font-mono text-[10px] font-bold text-[#111216] shadow-[2px_2px_0_#111216] transition-transform hover:-translate-y-0.5"
          >
            <span>查看 GitHub 原图</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Caption Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#111216]/15 bg-white px-4 py-2.5">
        <p className="text-xs font-medium text-[#111216]">{current.caption}</p>
        <span className="font-mono text-[10px] text-[#7a808f]">
          来源：{skill.repo}
        </span>
      </div>

      {/* Multi-Image Thumbnail Selector */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto border-t border-[#d4d0c5] bg-[#eae8e0] p-3">
          {images.map((img, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={img.src}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`group relative h-16 w-28 shrink-0 cursor-pointer overflow-hidden rounded-[2px] border transition-all ${
                  active
                    ? "border-[#111216] ring-2 ring-[#0052ff] ring-offset-1"
                    : "border-[#111216]/25 opacity-75 hover:border-[#111216] hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-1 bottom-1 rounded-[1px] bg-[#111216]/85 px-1 font-mono text-[9px] font-bold text-white">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FavoriteToggleButton({ slug }: { slug: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border px-3 py-1.5 font-mono text-xs font-bold transition-all ${
        fav
          ? "border-[#111216] bg-[#ff3b1d] text-white shadow-[2px_2px_0_#111216]"
          : "border-[#111216]/30 bg-white text-[#111216] hover:border-[#111216] hover:shadow-[2px_2px_0_#111216]"
      }`}
    >
      <Heart className={`h-3.5 w-3.5 ${fav ? "fill-white" : ""}`} />
      <span>{fav ? "已收藏 // SAVED" : "加入收藏 // SAVE"}</span>
    </button>
  );
}

export function PackageFileExplorer({ files }: { files: SkillFileNode[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = files[selectedIndex] ?? files[0];

  return (
    <div className="overflow-hidden rounded-[3px] border border-[#111216] bg-white shadow-[4px_4px_0_#111216]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#111216] bg-[#eae8e0] px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {files.map((file, idx) => {
            const active = idx === selectedIndex;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-[#111216] bg-[#c8ff29] text-[#111216]"
                    : "border-transparent text-[#4e5361] hover:border-[#111216]/30 hover:bg-white hover:text-[#111216]"
                }`}
              >
                <FolderOpen className="h-3 w-3 text-[#0052ff]" />
                <span>{file.path}</span>
              </button>
            );
          })}
        </div>

        {current && (
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] font-medium text-[#4e5361]">
              {current.size}
            </span>
            <CopyButton text={current.preview} label="复制片段" />
          </div>
        )}
      </div>

      {current && (
        <pre className="max-h-80 overflow-x-auto bg-[#faf9f5] p-4 font-mono text-[12px] leading-relaxed text-[#111216]">
          <code>{current.preview}</code>
        </pre>
      )}
    </div>
  );
}

export function AgentInstallerPanel({ skill }: { skill: SkillItem }) {
  const {
    snapshot,
    loading,
    scope,
    setScope,
    projectPath,
    openDrawer,
    refresh,
    runConnectAction,
    installSkill,
    uninstallSkill,
  } = useLocalAgents();

  const [manualTargets, setManualTargets] = useState<PlatformId[] | null>(null);
  const [installing, setInstalling] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<InstallSkillResponse | null>(
    null
  );

  const aliases = useMemo(() => getSkillAliasNames(skill), [skill]);

  const compatibleAgents = useMemo(() => {
    const allowed = new Set<PlatformId>(skill.platforms);
    if (snapshot?.agents) {
      return snapshot.agents.filter((a) => allowed.has(a.id));
    }
    return PLATFORMS.filter((p) => allowed.has(p.id)).map((p) => ({
      id: p.id,
      name: p.name,
      vendor: p.vendor,
      detectMode: "not-found" as const,
      detected: false,
      connected: false,
      cliCommand: p.id,
      binaryPath: null,
      binaryVersion: null,
      appBundlePath: null,
      homeDirPath: "",
      globalSkillsDir: p.skillPathTemplate.replace("<slug>", skill.slug),
      projectSkillTemplate: p.skillPathTemplate,
      writable: true,
      installedSkills: [] as string[],
      projectInstalledSkills: [] as string[],
      notes: p.notes,
    }));
  }, [skill.platforms, skill.slug, snapshot]);

  // Default targets: connected compatible agents, fallback to detected CLI binaries, fallback to first compatible agent
  const defaultTargets = useMemo<PlatformId[]>(() => {
    const connected = compatibleAgents
      .filter((a) => a.connected)
      .map((a) => a.id);
    if (connected.length > 0) return connected;

    const cliReady = compatibleAgents
      .filter((a) => a.detectMode === "cli-ready")
      .map((a) => a.id);
    if (cliReady.length > 0) return cliReady;

    const detected = compatibleAgents
      .filter((a) => a.detected)
      .map((a) => a.id);
    if (detected.length > 0) return detected.slice(0, 2);

    return compatibleAgents[0] ? [compatibleAgents[0].id] : ["claude-code"];
  }, [compatibleAgents]);

  const selectedTargets = manualTargets ?? defaultTargets;
  const primaryAgent =
    compatibleAgents.find((a) => a.id === selectedTargets[0]) ??
    compatibleAgents[0];

  const installedAgents = useMemo(
    () =>
      compatibleAgents.filter((a) =>
        isSkillInstalledOnAgent(a, aliases, scope)
      ),
    [aliases, compatibleAgents, scope]
  );

  const removableTargetIds = useMemo(
    () =>
      installedAgents
        .filter((a) => selectedTargets.includes(a.id))
        .map((a) => a.id),
    [installedAgents, selectedTargets]
  );

  const detectedCliCount = compatibleAgents.filter(
    (a) => a.detectMode === "cli-ready"
  ).length;
  const detectedEnvCount = compatibleAgents.filter((a) => a.detected).length;

  function toggleTarget(agentId: PlatformId) {
    setInstallError(null);
    const current = new Set(selectedTargets);
    if (current.has(agentId)) {
      current.delete(agentId);
    } else {
      current.add(agentId);
    }
    setManualTargets(Array.from(current));
  }

  async function handleOneClickInstall() {
    if (selectedTargets.length === 0) return;
    setInstalling(true);
    setInstallError(null);
    try {
      const res = await installSkill({
        skillSlug: skill.slug,
        agentIds: selectedTargets,
        scopeOverride: scope,
      });
      setLastResult(res);
    } catch (err) {
      setInstallError(err instanceof Error ? err.message : "一键安装失败");
    } finally {
      setInstalling(false);
    }
  }

  async function handleUninstall() {
    const idsToRemove =
      removableTargetIds.length > 0
        ? removableTargetIds
        : installedAgents.map((a) => a.id);
    if (idsToRemove.length === 0) return;
    setUninstalling(true);
    setInstallError(null);
    try {
      await uninstallSkill({
        skillSlug: skill.slug,
        agentIds: idsToRemove,
        scopeOverride: scope,
      });
      setLastResult(null);
    } catch (err) {
      setInstallError(err instanceof Error ? err.message : "卸载失败");
    } finally {
      setUninstalling(false);
    }
  }

  const targetDirPreview = primaryAgent
    ? scope === "global"
      ? `${primaryAgent.globalSkillsDir}/${skill.slug}/`
      : primaryAgent.projectSkillTemplate.replace("<slug>", skill.slug)
    : `.claude/skills/${skill.slug}/`;

  const promptWakeupText = `请加载本地已安装的 "${skill.slug}" Skill（参考 SKILL.md 工作流），帮我开始执行这个任务：`;

  return (
    <div className="rounded-[3px] border border-[#111216] bg-white p-5 shadow-[5px_5px_0_#111216]">
      {/* Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4d0c5] pb-3">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider text-[#111216] uppercase">
          <Terminal className="h-3.5 w-3.5 text-[#ff3b1d]" />
          <span>LOCAL CLI INSTALLER // 一键直装</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => refresh()}
            className="inline-flex cursor-pointer items-center gap-1 rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#111216] hover:border-[#111216]"
            title="重新扫描本机 Agent CLI"
          >
            <RefreshCw
              className={`h-2.5 w-2.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>重扫</span>
          </button>
          <button
            type="button"
            onClick={openDrawer}
            className="inline-flex cursor-pointer items-center gap-1 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-2 py-0.5 font-mono text-[10px] font-bold text-[#111216] hover:bg-[#0052ff] hover:text-white"
          >
            <PlugZap className="h-2.5 w-2.5" />
            <span>CLI 管理</span>
          </button>
        </div>
      </div>

      {/* Discovery Banner */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[2px] border border-[#111216]/20 bg-[#faf9f5] px-3 py-2 font-mono text-[10px]">
        <span className="text-[#4e5361]">
          {loading && !snapshot ? (
            "正在扫描本机已安装的 CLI 与 Agent 目录..."
          ) : (
            <>
              发现 <strong className="text-[#111216]">{detectedCliCount}</strong>{" "}
              终端 CLI ·{" "}
              <strong className="text-[#0052ff]">{detectedEnvCount}</strong>{" "}
              本机环境
            </>
          )}
        </span>
        {detectedEnvCount > 0 &&
          compatibleAgents.some((a) => a.detected && !a.connected) && (
            <button
              type="button"
              onClick={() => runConnectAction("connect-all-detected")}
              className="cursor-pointer font-bold text-[#0052ff] underline-offset-2 hover:text-[#ff3b1d] hover:underline"
            >
              一键连接全部已发现
            </button>
          )}
      </div>

      {/* Installed Status Highlight */}
      {installedAgents.length > 0 && (
        <div className="mt-3 rounded-[2px] border border-[#059669]/45 bg-[#ecfdf5] p-3">
          <div className="flex items-center justify-between gap-2 font-mono text-[11px] font-bold text-[#047857]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>
                已在 {installedAgents.length} 个本地 CLI 就绪 (
                {scope === "global" ? "全局" : "项目"})
              </span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {installedAgents.map((a) => (
              <span
                key={a.id}
                className="rounded-[2px] border border-[#059669]/35 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-[#047857]"
              >
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Local Agent Targets Checklist */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label className="font-mono text-[10px] font-bold tracking-wider text-[#7a808f] uppercase">
            选择目标本地 CLI ({selectedTargets.length} 已选)
          </label>
          <div className="inline-flex overflow-hidden rounded-[2px] border border-[#111216]/30">
            <button
              type="button"
              onClick={() => setScope("global")}
              className={`cursor-pointer px-2 py-0.5 font-mono text-[10px] font-bold ${
                scope === "global"
                  ? "bg-[#111216] text-[#c8ff29]"
                  : "bg-[#f4f3ee] text-[#4e5361]"
              }`}
            >
              全局目录
            </button>
            <button
              type="button"
              onClick={() => setScope("project")}
              className={`cursor-pointer border-l border-[#111216]/30 px-2 py-0.5 font-mono text-[10px] font-bold ${
                scope === "project"
                  ? "bg-[#111216] text-[#c8ff29]"
                  : "bg-[#f4f3ee] text-[#4e5361]"
              }`}
            >
              项目目录
            </button>
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          {compatibleAgents.map((agent) => {
            const checked = selectedTargets.includes(agent.id);
            const installedHere = isSkillInstalledOnAgent(agent, aliases, scope);

            return (
              <div
                key={agent.id}
                className={`flex items-center justify-between gap-2 rounded-[2px] border px-2.5 py-2 transition-all ${
                  checked
                    ? "border-[#111216] bg-[#eef3ff] shadow-[2px_2px_0_#111216]"
                    : "border-[#d4d0c5] bg-[#f4f3ee] hover:border-[#111216]/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTarget(agent.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border ${
                      checked
                        ? "border-[#111216] bg-[#0052ff] text-white"
                        : "border-[#111216]/35 bg-white"
                    }`}
                  >
                    {checked && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#111216]">
                        {agent.name}
                      </span>
                      {agent.detectMode === "cli-ready" && (
                        <span className="rounded-[2px] border border-[#111216]/30 bg-[#c8ff29] px-1 py-0.2 font-mono text-[9px] font-bold text-[#111216]">
                          CLI
                        </span>
                      )}
                      {agent.detectMode === "dir-ready" && (
                        <span className="rounded-[2px] border border-[#0052ff]/30 bg-white px-1 py-0.2 font-mono text-[9px] font-bold text-[#0052ff]">
                          目录就绪
                        </span>
                      )}
                      {installedHere && (
                        <span className="rounded-[2px] bg-[#059669] px-1 py-0.2 font-mono text-[9px] font-bold text-white">
                          已安装
                        </span>
                      )}
                    </div>
                    {agent.binaryVersion && (
                      <div className="truncate font-mono text-[9px] text-[#4e5361]">
                        {agent.binaryVersion}
                      </div>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    runConnectAction(agent.connected ? "disconnect" : "connect", {
                      agentId: agent.id,
                    })
                  }
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-[2px] border px-2 py-0.5 font-mono text-[9px] font-bold ${
                    agent.connected
                      ? "border-[#059669]/40 bg-[#ecfdf5] text-[#047857]"
                      : "border-[#111216]/25 bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                  }`}
                >
                  <Plug className="h-2.5 w-2.5" />
                  <span>{agent.connected ? "已连接" : "连接"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary One-Click Install CTA */}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled={installing || selectedTargets.length === 0}
          onClick={handleOneClickInstall}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[2px] border-2 border-[#111216] bg-[#c8ff29] px-4 py-2.5 font-mono text-xs font-extrabold text-[#111216] shadow-[3px_3px_0_#111216] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#0052ff] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {installing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>正在从 GitHub 拉取并写入本机 CLI 目录...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 fill-current" />
              <span>
                {installedAgents.length > 0 &&
                removableTargetIds.length === selectedTargets.length
                  ? `重新同步并覆盖安装 (${selectedTargets.length} 个 CLI)`
                  : `一键连接并安装到所选 CLI (${selectedTargets.length})`}
              </span>
            </>
          )}
        </button>

        {installedAgents.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <CopyButton
              text={promptWakeupText}
              label="复制唤醒词"
              copiedLabel="✓ 已复制"
              className="justify-center py-1.5"
            />
            <button
              type="button"
              disabled={uninstalling}
              onClick={handleUninstall}
              className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-[2px] border border-[#ff3b1d]/50 bg-[#fff5f2] px-2.5 py-1.5 font-mono text-[11px] font-bold text-[#ff3b1d] hover:border-[#ff3b1d] hover:bg-[#ff3b1d] hover:text-white disabled:opacity-50"
            >
              {uninstalling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              <span>移除本地安装</span>
            </button>
          </div>
        )}
      </div>

      {/* Real Install Error */}
      {installError && (
        <div className="mt-3 rounded-[2px] border border-[#ff3b1d] bg-[#fff0eb] p-2.5 font-mono text-[11px] font-semibold text-[#ff3b1d]">
          {installError}
        </div>
      )}

      {/* Real Live Execution Result */}
      {lastResult && (
        <div className="mt-3 space-y-2 rounded-[2px] border border-[#111216] bg-[#111216] p-3 font-mono text-[10px] text-[#f4f3ee]">
          <div className="flex items-center justify-between text-[#c8ff29]">
            <span className="font-bold">
              ✓ SYNCED FROM {lastResult.repo} ({lastResult.branch})
            </span>
            <span>{lastResult.files.length} FILES</span>
          </div>
          <div className="space-y-1 text-[#d4d0c5]">
            {lastResult.results.map((r) => (
              <div key={r.agentId} className="truncate">
                {r.ok ? "✓" : "✕"} [{r.agentName}]{" "}
                {r.ok
                  ? `${r.targetDir} (${formatBytes(r.totalBytes)})`
                  : r.error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Path & Fallback Reference */}
      <div className="mt-4 space-y-2 border-t border-[#d4d0c5] pt-3">
        <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#7a808f]">
          <span>
            TARGET PATH ({scope === "global" ? "GLOBAL" : "PROJECT"})
          </span>
          <CopyButton text={targetDirPreview} label="复制路径" />
        </div>
        <div className="overflow-x-auto rounded-[2px] border border-[#d4d0c5] bg-[#faf9f5] px-2.5 py-2 font-mono text-[11px] font-medium text-[#111216]">
          {targetDirPreview}
        </div>
        {scope === "project" && projectPath && (
          <div className="truncate font-mono text-[10px] text-[#4e5361]">
            当前工作区: {projectPath}
          </div>
        )}
        <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-[#7a808f]">
          <span>上游命令参考:</span>
          <CopyButton text={skill.installCommand} label="复制命令" />
        </div>
        <div className="overflow-x-auto rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-2.5 py-1.5 font-mono text-[10px] text-[#0052ff]">
          $ {skill.installCommand}
        </div>
      </div>
    </div>
  );
}
