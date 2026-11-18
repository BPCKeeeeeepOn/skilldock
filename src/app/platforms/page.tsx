import type { Metadata } from "next";
import { PlatformsWorkbench } from "@/components/platforms-workbench";

export const metadata: Metadata = {
  title: "本机 Agent CLI 连接与安装中心 · SKILLDOCK",
  description:
    "自动扫描本机 Claude Code、Codex、Cursor、Antigravity、Gemini CLI 等智能体工具与目录，一键建立连接并直装 SKILL.md。",
};

export default function PlatformsPage() {
  return (
    <div className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10">
      <section className="border-b border-[#111216]/15 pb-8">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-[#ff3b1d] uppercase">
          <span className="h-2 w-2 bg-[#ff3b1d]" />
          <span>LOCAL CLI CONNECTOR // 8 SUPPORTED AGENTS</span>
        </div>
        <h1 className="flex flex-wrap items-baseline gap-4">
          <span className="font-display text-3xl font-extrabold tracking-tight text-[#111216] sm:text-4xl">
            本机 Agent CLI 连接中心
          </span>
          <span className="font-editorial text-3xl text-[#4e5361] italic sm:text-4xl">
            Connect &amp; install
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4e5361]">
          自动探测你电脑上已安装的{" "}
          <code className="rounded-[2px] border border-[#111216]/20 bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-[#0052ff]">
            Claude Code
          </code>
          、
          <code className="rounded-[2px] border border-[#111216]/20 bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-[#0052ff]">
            Codex CLI
          </code>
          、Cursor、Antigravity、Gemini CLI 等智能体命令行与技能目录。连接后可在任意技能页一键拉取 GitHub 完整{" "}
          <code className="rounded-[2px] border border-[#111216]/20 bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-[#111216]">
            SKILL.md
          </code>{" "}
          包写入本机目录。
        </p>
      </section>

      <div className="mt-8">
        <PlatformsWorkbench />
      </div>
    </div>
  );
}
