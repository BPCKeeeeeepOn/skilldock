import type { PlatformId } from "@/types/skill";

export type AgentDetectMode = "cli-ready" | "dir-ready" | "not-found";

export type InstallScope = "global" | "project";

export interface LocalAgentStatus {
  id: PlatformId;
  name: string;
  vendor: string;
  detectMode: AgentDetectMode;
  detected: boolean;
  connected: boolean;
  cliCommand: string;
  binaryPath: string | null;
  binaryVersion: string | null;
  appBundlePath: string | null;
  homeDirPath: string;
  globalSkillsDir: string;
  projectSkillTemplate: string;
  writable: boolean;
  installedSkills: string[];
  projectInstalledSkills: string[];
  notes: string;
}

export interface LocalAgentsSnapshot {
  scannedAt: string;
  hostname: string;
  platform: string;
  homeDir: string;
  defaultProjectPath: string;
  projectPath: string;
  sharedAgentsDir: string;
  sharedInstalledSkills: string[];
  agents: LocalAgentStatus[];
  connectedIds: PlatformId[];
  connectionsConfigured: boolean;
}

export interface HandshakeCheckItem {
  agentId: PlatformId;
  name: string;
  ok: boolean;
  detectMode: AgentDetectMode;
  binaryPath: string | null;
  binaryVersion: string | null;
  skillsDir: string;
  writable: boolean;
  latencyMs: number;
  message: string;
}

export interface InstalledFileSummary {
  path: string;
  bytes: number;
}

export interface AgentInstallResult {
  agentId: PlatformId;
  agentName: string;
  ok: boolean;
  targetDir: string;
  skillMdPath: string;
  fileCount: number;
  totalBytes: number;
  error?: string;
}

export interface InstallSkillResponse {
  ok: boolean;
  slug: string;
  repo: string;
  branch: string;
  sourceMethod: "github-tree" | "github-raw-fallback";
  files: InstalledFileSummary[];
  results: AgentInstallResult[];
  snapshot: LocalAgentsSnapshot;
}

export interface UninstallSkillResponse {
  ok: boolean;
  slug: string;
  removedAgents: PlatformId[];
  skippedAgents: { agentId: PlatformId; reason: string }[];
  snapshot: LocalAgentsSnapshot;
}
