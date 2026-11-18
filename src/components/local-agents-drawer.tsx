"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FolderCheck,
  HardDrive,
  Loader2,
  Plug,
  PlugZap,
  RefreshCw,
  Terminal,
  Unplug,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocalAgents } from "@/components/local-agents-provider";
import type { LocalAgentStatus } from "@/types/local-agent";

function AgentDetectBadge({ agent }: { agent: LocalAgentStatus }) {
  if (agent.detectMode === "cli-ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#111216]">
        <Terminal className="h-2.5 w-2.5" />
        <span>CLI {agent.binaryVersion ?? "就绪"}</span>
      </span>
    );
  }
  if (agent.detectMode === "dir-ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#0052ff]/35 bg-[#eef3ff] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0052ff]">
        <FolderCheck className="h-2.5 w-2.5" />
        <span>本机环境就绪</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#7a808f]">
      <span>未检测到 CLI</span>
    </span>
  );
}

export function LocalAgentsDrawer() {
  const {
    snapshot,
    loading,
    error,
    scope,
    setScope,
    projectPath,
    setProjectPath,
    drawerOpen,
    closeDrawer,
    handshakes,
    busyAction,
    refresh,
    runConnectAction,
  } = useLocalAgents();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftProjectPath, setDraftProjectPath] = useState<string | null>(null);

  if (!drawerOpen) return null;

  const agents = snapshot?.agents ?? [];
  const cliReadyCount = agents.filter(
    (a) => a.detectMode === "cli-ready"
  ).length;
  const detectedCount = agents.filter((a) => a.detected).length;
  const connectedCount = snapshot?.connectedIds.length ?? 0;
  const effectiveProject = draftProjectPath ?? projectPath;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="关闭本地 Agent CLI 连接管理器"
        onClick={closeDrawer}
        className="fixed inset-0 bg-[#111216]/45 backdrop-blur-[2px]"
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col border-l-2 border-[#111216] bg-[#f4f3ee] shadow-[-8px_0_0_#111216]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#111216] bg-white px-5 py-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.18em] text-[#ff3b1d] uppercase">
              <PlugZap className="h-3.5 w-3.5" />
              <span>LOCAL AGENT BRIDGE // 本机 CLI 连接管理器</span>
            </div>
            <h2 className="mt-1 font-display text-lg font-extrabold text-[#111216]">
              自动发现并连接本机 Coding Agent
            </h2>
            {snapshot && (
              <p className="mt-1 font-mono text-[11px] text-[#4e5361]">
                主机 {snapshot.hostname} ({snapshot.platform}) · 发现{" "}
                <strong className="text-[#111216]">{cliReadyCount}</strong>{" "}
                个终端 CLI ·{" "}
                <strong className="text-[#111216]">{detectedCount}</strong>{" "}
                个运行环境 · 已连接{" "}
                <strong className="text-[#059669]">{connectedCount}</strong>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[2px] border border-[#111216] bg-[#f4f3ee] text-[#111216] hover:bg-[#111216] hover:text-white"
            aria-label="关闭弹窗"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="space-y-3 border-b border-[#111216]/15 bg-[#eae8e0] px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busyAction !== null || cliReadyCount === 0}
              onClick={() => runConnectAction("connect-all-cli")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-3 py-1.5 font-mono text-[11px] font-extrabold text-[#111216] shadow-[2px_2px_0_#111216] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {busyAction === "connect-all-cli" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PlugZap className="h-3.5 w-3.5" />
              )}
              <span>一键连接终端 CLI ({cliReadyCount})</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null || detectedCount === 0}
              onClick={() => runConnectAction("connect-all-detected")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#111216] bg-[#0052ff] px-3 py-1.5 font-mono text-[11px] font-bold text-white shadow-[2px_2px_0_#111216] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {busyAction === "connect-all-detected" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plug className="h-3.5 w-3.5" />
              )}
              <span>连接全部已检测环境 ({detectedCount})</span>
            </button>

            <button
              type="button"
              disabled={loading || busyAction !== null}
              onClick={() => refresh()}
              className="inline-flex cursor-pointer items-center gap-1 rounded-[2px] border border-[#111216]/30 bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#111216] hover:border-[#111216]"
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              <span>重扫</span>
            </button>

            {connectedCount > 0 && (
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => runConnectAction("disconnect-all")}
                className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-[2px] border border-[#111216]/25 bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#ff3b1d] hover:border-[#ff3b1d]"
              >
                <Unplug className="h-3 w-3" />
                <span>全部断开</span>
              </button>
            )}
          </div>

          {/* Install Scope Switch */}
          <div className="rounded-[2px] border border-[#111216]/20 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold tracking-wider text-[#7a808f] uppercase">
                DEFAULT INSTALL SCOPE // 默认安装作用域
              </span>
              <div className="inline-flex overflow-hidden rounded-[2px] border border-[#111216]">
                <button
                  type="button"
                  onClick={() => setScope("global")}
                  className={`cursor-pointer px-2.5 py-1 font-mono text-[10px] font-bold ${
                    scope === "global"
                      ? "bg-[#111216] text-[#c8ff29]"
                      : "bg-white text-[#4e5361] hover:bg-[#f4f3ee]"
                  }`}
                >
                  全局 ~/.agent/skills
                </button>
                <button
                  type="button"
                  onClick={() => setScope("project")}
                  className={`cursor-pointer border-l border-[#111216] px-2.5 py-1 font-mono text-[10px] font-bold ${
                    scope === "project"
                      ? "bg-[#111216] text-[#c8ff29]"
                      : "bg-white text-[#4e5361] hover:bg-[#f4f3ee]"
                  }`}
                >
                  项目工作区
                </button>
              </div>
            </div>

            {scope === "project" && (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={effectiveProject}
                  onChange={(e) => setDraftProjectPath(e.target.value)}
                  placeholder="输入本地项目路径，如 /path/to/repo"
                  className="h-8 flex-1 rounded-[2px] border border-[#111216]/30 bg-[#faf9f5] px-2.5 font-mono text-[11px] text-[#111216] focus:border-[#0052ff] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = effectiveProject.trim();
                    if (next) {
                      setProjectPath(next);
                      setDraftProjectPath(null);
                      void refresh(next);
                    }
                  }}
                  className="h-8 cursor-pointer rounded-[2px] border border-[#111216] bg-[#f4f3ee] px-3 font-mono text-[10px] font-bold text-[#111216] hover:bg-[#c8ff29]"
                >
                  应用目录
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {error && (
            <div className="rounded-[2px] border border-[#ff3b1d] bg-[#fff0eb] p-3 font-mono text-xs font-semibold text-[#ff3b1d]">
              {error}
            </div>
          )}

          {agents.map((agent) => {
            const handshake = handshakes[agent.id];
            const isExpanded = expandedId === agent.id;
            const installedList =
              scope === "project"
                ? agent.projectInstalledSkills
                : agent.installedSkills;

            return (
              <div
                key={agent.id}
                className={`rounded-[3px] border bg-white p-4 transition-all ${
                  agent.connected
                    ? "border-[#111216] shadow-[3px_3px_0_#111216]"
                    : "border-[#111216]/25"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#111216]">
                        {agent.name}
                      </h3>
                      <AgentDetectBadge agent={agent} />
                      {agent.connected && (
                        <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#059669]/40 bg-[#ecfdf5] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#047857]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                          已连接
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 space-y-0.5 font-mono text-[10px] text-[#4e5361]">
                      {agent.binaryPath && (
                        <div className="truncate">
                          <span className="text-[#7a808f]">BIN: </span>
                          <span className="font-semibold text-[#111216]">
                            {agent.binaryPath}
                          </span>
                        </div>
                      )}
                      {!agent.binaryPath && agent.appBundlePath && (
                        <div className="truncate">
                          <span className="text-[#7a808f]">APP: </span>
                          <span className="font-semibold text-[#111216]">
                            {agent.appBundlePath}
                          </span>
                        </div>
                      )}
                      <div className="truncate">
                        <span className="text-[#7a808f]">SKILLS DIR: </span>
                        <span className="font-semibold text-[#0052ff]">
                          {agent.globalSkillsDir}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() =>
                        runConnectAction("verify", { agentId: agent.id })
                      }
                      className="cursor-pointer rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-2 py-1 font-mono text-[10px] font-bold text-[#111216] hover:border-[#111216]"
                    >
                      握手探测
                    </button>

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() =>
                        runConnectAction(
                          agent.connected ? "disconnect" : "connect",
                          { agentId: agent.id }
                        )
                      }
                      className={`inline-flex cursor-pointer items-center gap-1 rounded-[2px] border px-2.5 py-1 font-mono text-[10px] font-extrabold transition-colors ${
                        agent.connected
                          ? "border-[#111216] bg-[#111216] text-[#c8ff29] hover:bg-[#ff3b1d] hover:text-white"
                          : "border-[#111216] bg-[#c8ff29] text-[#111216] hover:bg-[#0052ff] hover:text-white"
                      }`}
                    >
                      {busyAction === `connect:${agent.id}` ||
                      busyAction === `disconnect:${agent.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : agent.connected ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Plug className="h-3 w-3" />
                      )}
                      <span>{agent.connected ? "已连接" : "连接"}</span>
                    </button>
                  </div>
                </div>

                {handshake && (
                  <div
                    className={`mt-2.5 rounded-[2px] border px-2.5 py-1.5 font-mono text-[10px] ${
                      handshake.ok
                        ? "border-[#059669]/35 bg-[#ecfdf5] text-[#047857]"
                        : "border-[#ff3b1d]/40 bg-[#fff0eb] text-[#ff3b1d]"
                    }`}
                  >
                    [{handshake.latencyMs}ms] {handshake.message}
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between border-t border-[#eae8e0] pt-2 font-mono text-[10px]">
                  <span className="inline-flex items-center gap-1.5 text-[#4e5361]">
                    <HardDrive className="h-3 w-3 text-[#7a808f]" />
                    <span>
                      本机已扫描到{" "}
                      <strong className="text-[#111216]">
                        {installedList.length}
                      </strong>{" "}
                      个技能 ({scope === "global" ? "全局" : "项目"})
                    </span>
                  </span>

                  {installedList.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : agent.id)
                      }
                      className="inline-flex cursor-pointer items-center gap-1 font-bold text-[#0052ff] hover:text-[#ff3b1d]"
                    >
                      <span>{isExpanded ? "收起列表" : "查看已装"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                {isExpanded && installedList.length > 0 && (
                  <div className="mt-2 flex max-h-28 flex-wrap gap-1 overflow-y-auto rounded-[2px] border border-[#d4d0c5] bg-[#faf9f5] p-2">
                    {installedList.map((skillName) => (
                      <span
                        key={skillName}
                        className="rounded-[2px] border border-[#d4d0c5] bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#111216]"
                      >
                        {skillName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#111216] bg-white px-5 py-3 font-mono text-[11px]">
          <span className="text-[#4e5361]">
            共享标准目录: ~/.agents/skills ({snapshot?.sharedInstalledSkills.length ?? 0})
          </span>
          <Link
            href="/platforms"
            onClick={closeDrawer}
            className="inline-flex items-center gap-1 font-bold text-[#0052ff] hover:text-[#ff3b1d]"
          >
            <span>打开完整平台中心</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
