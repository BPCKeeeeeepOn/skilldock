import type { Metadata } from "next";
import { Suspense } from "react";
import { SkillsExplorer } from "@/components/skills-explorer";

export const metadata: Metadata = {
  title: "探索技能索引 · SKILLDOCK",
  description:
    "按专题合集、技能形态、产出类型、任务工具与 16 个细分主题筛选开源 Agent Skills。",
};

function ExplorerSkeleton() {
  return (
    <div className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="h-9 w-72 animate-pulse rounded-[2px] bg-[#eae8e0]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <div
            key={idx}
            className="h-80 animate-pulse rounded-[3px] border border-[#d4d0c5] bg-white"
          />
        ))}
      </div>
    </div>
  );
}

export default function SkillsPage() {
  return (
    <Suspense fallback={<ExplorerSkeleton />}>
      <SkillsExplorer />
    </Suspense>
  );
}
