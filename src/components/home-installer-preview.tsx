"use client";

import Link from "next/link";
import { ArrowRight, Check, PlugZap, Terminal } from "lucide-react";
import { useState } from "react";
import { PLATFORMS } from "@/data/platforms";
import { CopyButton } from "@/components/copy-button";
import { useLocalAgents } from "@/components/local-agents-provider";

export function HomeInstallerPreview() {
  const { snapshot, runConnectAction, openDrawer } = useLocalAgents();
  const [selectedId, setSelectedId] = useState(PLATFORMS[0].id);
  const current = PLATFORMS.find((p) => p.id === selectedId) ?? PLATFORMS[0];
  const live = snapshot?.agents.find((a) => a.id === selectedId);
  const connectedCount = snapshot?.connectedIds.length ?? 0;
  const cliReadyCount =
    snapshot?.agents.filter((a) => a.detectMode === "cli-ready").length ?? 0;

  const sampleCmd = `npx skills add mromidev/claude-animated-shorts --skill cartoon-3d-short --agent ${current.id}`;
  const samplePath =
    live?.globalSkillsDir
      ? `${live.globalSkillsDir}/cartoon-3d-short/`
      : current.skillPathTemplate.replace("<slug>", "cartoon-3d-short");

  return (
    <div className="overflow-hidden rounded-[3px] border border-[#111216] bg-white shadow-[5px_5px_0_#111216]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#111216] bg-[#eae8e0] px-5 py-3">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#111216]">
          <Terminal className="h-4 w-4 text-[#ff3b1d]" />
          <span>MULTI-AGENT BRIDGE // 自动扫描本机 CLI 并一键直装 SKILL</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {cliReadyCount > 0 && connectedCount === 0 && (
            <button
              type="button"
              onClick={() => runConnectAction("connect-all-cli")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-2.5 py-1 font-mono text-[11px] font-extrabold text-[#111216] shadow-[2px_2px_0_#111216] hover:bg-[#0052ff] hover:text-white"
            >
              <PlugZap className="h-3 w-3" />
              <span>连接检测到的 {cliReadyCount} 个 CLI</span>
            </button>
          )}
          <button
            type="button"
            onClick={openDrawer}
            className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] font-bold text-[#0052ff] hover:text-[#ff3b1d]"
          >
            <span>
              {connectedCount > 0
                ? `管理已连接 CLI (${connectedCount})`
                : "打开本机 CLI 连接台"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        {/* Platform Switcher */}
        <div className="grid grid-cols-2 gap-1.5 border-b border-[#d4d0c5] bg-[#f4f3ee] p-4 sm:grid-cols-4 lg:col-span-5 lg:grid-cols-2 lg:border-r lg:border-b-0">
          {PLATFORMS.map((p) => {
            const active = p.id === selectedId;
            const agentLive = snapshot?.agents.find((a) => a.id === p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`flex cursor-pointer items-center justify-between gap-1.5 rounded-[2px] border px-3 py-2 text-left font-mono text-[11px] font-semibold transition-all ${
                  active
                    ? "border-[#111216] bg-[#c8ff29] text-[#111216] shadow-[2px_2px_0_#111216]"
                    : "border-[#d4d0c5] bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  {agentLive?.connected ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#059669]" />
                  ) : agentLive?.detected ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#0052ff]" />
                  ) : null}
                  <span className="truncate">{p.name}</span>
                </span>
                {active && <Check className="h-3 w-3 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Live Output Command & Path Spec */}
        <div className="flex flex-col justify-between space-y-4 p-5 lg:col-span-7">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#7a808f]">
              <span>
                {live?.binaryVersion
                  ? `DETECTED: ${live.binaryVersion}`
                  : `INSTALL COMMAND (${current.vendor.toUpperCase()})`}
              </span>
              <CopyButton text={sampleCmd} label="复制安装命令" />
            </div>
            <div className="mt-2 overflow-x-auto rounded-[2px] border border-[#111216] bg-[#faf9f5] px-3.5 py-2.5 font-mono text-xs font-medium text-[#0052ff]">
              $ {sampleCmd}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] p-3">
              <div className="font-mono text-[10px] font-bold text-[#7a808f]">
                LIVE TARGET DIR ({live?.installedSkills.length ?? 0} INSTALLED)
              </div>
              <div className="mt-1 truncate font-mono text-xs font-bold text-[#111216]">
                {samplePath}
              </div>
            </div>
            <div className="rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] p-3">
              <div className="font-mono text-[10px] font-bold text-[#7a808f]">
                RULE &amp; MCP CONFIG
              </div>
              <div className="mt-1 font-mono text-xs font-bold text-[#111216]">
                {current.rulePath} · {current.mcpConfigPath}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs leading-relaxed text-[#4e5361]">
              {current.notes}
            </p>
            <Link
              href="/platforms"
              className="shrink-0 font-mono text-[11px] font-bold text-[#0052ff] hover:text-[#ff3b1d]"
            >
              进入完整 CLI 连接中心 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
