"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FolderCheck,
  HardDrive,
  Layers,
  Loader2,
  Plug,
  PlugZap,
  RefreshCw,
  Terminal,
  Unplug,
} from "lucide-react";
import { useState } from "react";
import { PLATFORMS } from "@/data/platforms";
import { CopyButton } from "@/components/copy-button";
import { useLocalAgents } from "@/components/local-agents-provider";

export function PlatformsWorkbench() {
  const {
    snapshot,
    loading,
    error,
    scope,
    setScope,
    handshakes,
    busyAction,
    refresh,
    runConnectAction,
    openDrawer,
  } = useLocalAgents();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const agentsById = new Map(
    (snapshot?.agents ?? []).map((agent) => [agent.id, agent])
  );
  const orderedPlatforms = snapshot?.agents.length
    ? snapshot.agents.map(
        (a) => PLATFORMS.find((p) => p.id === a.id) ?? PLATFORMS[0]
      )
    : PLATFORMS;

  const cliReadyCount =
    snapshot?.agents.filter((a) => a.detectMode === "cli-ready").length ?? 0;
  const detectedCount =
    snapshot?.agents.filter((a) => a.detected).length ?? 0;
  const connectedCount = snapshot?.connectedIds.length ?? 0;
  const totalLocalSkills =
    snapshot?.agents.reduce((sum, a) => sum + a.installedSkills.length, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Live Machine Radar Bar */}
      <section className="rounded-[3px] border border-[#111216] bg-white p-5 shadow-[5px_5px_0_#111216]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4d0c5] pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.18em] text-[#0052ff] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#059669]" />
              <span>LOCAL CLI RADAR // 本机扫描与实时桥接</span>
            </div>
            <p className="mt-1.5 font-mono text-xs text-[#4e5361]">
              {snapshot
                ? `主机 ${snapshot.hostname} · 检测到 ${cliReadyCount} 个终端 CLI、${detectedCount} 个 Agent 环境 · 已建立连接 ${connectedCount} 个 · 本机已有 ${totalLocalSkills} 个技能目录`
                : "正在扫描本机可执行 CLI 与全局智能体技能目录..."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busyAction !== null || cliReadyCount === 0}
              onClick={() => runConnectAction("connect-all-cli")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-3.5 py-2 font-mono text-xs font-extrabold text-[#111216] shadow-[2px_2px_0_#111216] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
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
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#111216] bg-[#0052ff] px-3.5 py-2 font-mono text-xs font-bold text-white shadow-[2px_2px_0_#111216] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Plug className="h-3.5 w-3.5" />
              <span>连接全部环境 ({detectedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#111216]/30 bg-[#f4f3ee] px-3 py-2 font-mono text-xs font-bold text-[#111216] hover:border-[#111216]"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>重新扫描</span>
            </button>

            {connectedCount > 0 && (
              <button
                type="button"
                onClick={() => runConnectAction("disconnect-all")}
                className="inline-flex cursor-pointer items-center gap-1 rounded-[2px] border border-[#ff3b1d]/40 bg-[#fff5f2] px-3 py-2 font-mono text-xs font-bold text-[#ff3b1d] hover:border-[#ff3b1d]"
              >
                <Unplug className="h-3.5 w-3.5" />
                <span>全部断开</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#7a808f]">默认安装作用域:</span>
            <div className="inline-flex overflow-hidden rounded-[2px] border border-[#111216]">
              <button
                type="button"
                onClick={() => setScope("global")}
                className={`cursor-pointer px-3 py-1 font-bold ${
                  scope === "global"
                    ? "bg-[#111216] text-[#c8ff29]"
                    : "bg-white text-[#4e5361]"
                }`}
              >
                全局 ~/.agent/skills
              </button>
              <button
                type="button"
                onClick={() => setScope("project")}
                className={`cursor-pointer border-l border-[#111216] px-3 py-1 font-bold ${
                  scope === "project"
                    ? "bg-[#111216] text-[#c8ff29]"
                    : "bg-white text-[#4e5361]"
                }`}
              >
                项目工作区
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={openDrawer}
            className="cursor-pointer font-bold text-[#0052ff] underline-offset-2 hover:text-[#ff3b1d] hover:underline"
          >
            打开侧滑连接面板 ({connectedCount} 已连接) →
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-[2px] border border-[#ff3b1d] bg-[#fff0eb] p-3 font-mono text-xs font-bold text-[#ff3b1d]">
            {error}
          </div>
        )}
      </section>

      {/* Platform Matrix Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {orderedPlatforms.map((platform, idx) => {
          const live = agentsById.get(platform.id);
          const handshake = handshakes[platform.id];
          const installedList = live
            ? scope === "project"
              ? live.projectInstalledSkills
              : live.installedSkills
            : [];
          const isExpanded = expandedId === platform.id;

          return (
            <div
              key={platform.id}
              className={`flex min-w-0 flex-col rounded-[3px] border bg-white p-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-5 ${
                live?.connected
                  ? "border-[#111216] shadow-[5px_5px_0_#111216]"
                  : "border-[#111216]/35 shadow-[4px_4px_0_#eae8e0] hover:border-[#111216] hover:shadow-[4px_4px_0_#111216]"
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#eae8e0] pb-3">
                <div>
                  <div className="font-mono text-[10px] font-bold text-[#0052ff]">
                    {`${String(idx + 1).padStart(2, "0")} // ${platform.vendor}`}
                  </div>
                  <h2 className="mt-1 text-base font-extrabold text-[#111216]">
                    {platform.name}
                  </h2>
                </div>

                {live?.detectMode === "cli-ready" ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-2 py-0.5 font-mono text-[10px] font-bold text-[#111216]">
                    <Terminal className="h-2.5 w-2.5" />
                    <span>CLI 就绪</span>
                  </span>
                ) : live?.detectMode === "dir-ready" ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-[2px] border border-[#0052ff]/35 bg-[#eef3ff] px-2 py-0.5 font-mono text-[10px] font-bold text-[#0052ff]">
                    <FolderCheck className="h-2.5 w-2.5" />
                    <span>目录就绪</span>
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-2 py-0.5 font-mono text-[10px] font-medium text-[#7a808f]">
                    <span>{platform.supportLevel}</span>
                  </span>
                )}
              </div>

              {/* Real Binary & Directory Probe Info */}
              <div className="mt-3 space-y-2.5 text-xs">
                {live?.binaryPath && (
                  <div className="rounded-[2px] border border-[#059669]/35 bg-[#ecfdf5] p-2 font-mono text-[10px] text-[#047857]">
                    <div className="font-bold">
                      {live.binaryVersion ?? "CLI Executable"}
                    </div>
                    <div className="mt-0.5 truncate opacity-85">
                      {live.binaryPath}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-1 flex items-center justify-between font-mono text-[10px] font-bold text-[#7a808f]">
                    <span>GLOBAL SKILLS DIR</span>
                    <CopyButton
                      text={live?.globalSkillsDir ?? platform.skillPathTemplate}
                      label="复制"
                    />
                  </div>
                  <div className="overflow-x-auto rounded-[2px] border border-[#d4d0c5] bg-[#faf9f5] px-2.5 py-1.5 font-mono text-[10px] font-semibold text-[#111216]">
                    {live?.globalSkillsDir ?? platform.skillPathTemplate}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <div className="rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] p-2">
                    <div className="font-bold text-[#7a808f]">MCP CONFIG</div>
                    <div className="mt-0.5 truncate font-semibold text-[#111216]">
                      {platform.mcpConfigPath}
                    </div>
                  </div>
                  <div className="rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] p-2">
                    <div className="font-bold text-[#7a808f]">LOCAL SKILLS</div>
                    <div className="mt-0.5 font-bold text-[#0052ff]">
                      {installedList.length} 个已装
                    </div>
                  </div>
                </div>

                {installedList.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : platform.id)
                      }
                      className="inline-flex cursor-pointer items-center gap-1 font-mono text-[10px] font-bold text-[#0052ff] hover:text-[#ff3b1d]"
                    >
                      <HardDrive className="h-3 w-3" />
                      <span>
                        {isExpanded
                          ? "收起本地已装列表"
                          : `展开 ${installedList.length} 个已装技能`}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="mt-1.5 flex max-h-24 flex-wrap gap-1 overflow-y-auto rounded-[2px] border border-[#d4d0c5] bg-[#faf9f5] p-2">
                        {installedList.map((name) => (
                          <span
                            key={name}
                            className="rounded-[2px] border border-[#d4d0c5] bg-white px-1.5 py-0.5 font-mono text-[9px] text-[#111216]"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {handshake && (
                  <div
                    className={`rounded-[2px] border px-2 py-1.5 font-mono text-[10px] ${
                      handshake.ok
                        ? "border-[#059669]/35 bg-[#ecfdf5] text-[#047857]"
                        : "border-[#ff3b1d]/40 bg-[#fff0eb] text-[#ff3b1d]"
                    }`}
                  >
                    [{handshake.latencyMs}ms] {handshake.message}
                  </div>
                )}

                <p className="text-[11px] leading-relaxed text-[#4e5361]">
                  {platform.notes}
                </p>
              </div>

              {/* Card Connect / Handshake Footer */}
              <div className="mt-auto space-y-2 border-t border-[#eae8e0] pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={busyAction !== null}
                    onClick={() =>
                      runConnectAction(
                        live?.connected ? "disconnect" : "connect",
                        { agentId: platform.id }
                      )
                    }
                    className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[2px] border px-3 py-1.5 font-mono text-[11px] font-extrabold transition-colors ${
                      live?.connected
                        ? "border-[#111216] bg-[#111216] text-[#c8ff29] hover:bg-[#ff3b1d] hover:text-white"
                        : "border-[#111216] bg-[#c8ff29] text-[#111216] hover:bg-[#0052ff] hover:text-white"
                    }`}
                  >
                    {live?.connected ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>已连接 · 断开</span>
                      </>
                    ) : (
                      <>
                        <Plug className="h-3.5 w-3.5" />
                        <span>连接此 CLI</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={busyAction !== null}
                    onClick={() =>
                      runConnectAction("verify", { agentId: platform.id })
                    }
                    className="cursor-pointer rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-2.5 py-1.5 font-mono text-[10px] font-bold text-[#111216] hover:border-[#111216]"
                  >
                    探测
                  </button>
                </div>

                <Link
                  href={`/skills?platform=${platform.id}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0052ff] hover:text-[#ff3b1d]"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>筛选适配技能</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
