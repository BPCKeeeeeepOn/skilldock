import type { Metadata } from "next";
import { Suspense } from "react";
import { GitHubDiscoverClient } from "@/components/github-discover-client";

export const metadata: Metadata = {
  title: "GitHub 开源 Skill 采集 · SKILLDOCK",
  description:
    "实时搜索 GitHub 上的 Agent Skills 与 SKILL.md 开源仓库，支持一键复制安装命令。",
};

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10">
      <section className="mb-8 border-b border-[#111216]/15 pb-7">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-[#ff3b1d] uppercase">
          <span className="h-2 w-2 bg-[#ff3b1d]" />
          <span>GITHUB RADAR // LIVE OPEN-SOURCE DISCOVERY</span>
        </div>
        <h1 className="flex flex-wrap items-baseline gap-4">
          <span className="font-display text-3xl font-extrabold tracking-tight text-[#111216] sm:text-4xl">
            GitHub 开源 Skill 探测台
          </span>
          <span className="font-editorial text-3xl text-[#4e5361] italic sm:text-4xl">
            Open-source radar
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4e5361]">
          直接检索 GitHub 公共仓库中的{" "}
          <code className="rounded-[2px] border border-[#111216]/20 bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-[#0052ff]">
            SKILL.md
          </code>{" "}
          技能项目与创意工具包，也可通过仓库内置 CLI 脚本批量采集整理到本地{" "}
          <code className="font-mono text-xs font-bold text-[#111216]">
            data/discovered-skills.json
          </code>
          。
        </p>
      </section>

      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-[3px] border border-[#d4d0c5] bg-white" />
        }
      >
        <GitHubDiscoverClient />
      </Suspense>
    </div>
  );
}
