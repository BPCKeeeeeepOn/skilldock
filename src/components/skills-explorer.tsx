"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutGrid,
  Layers,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Terminal,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  COLLECTION_ITEMS,
  getKindTabCounts,
  getOutputCounts,
  getTaskCounts,
  KIND_LABELS,
  OUTPUT_LABELS,
  querySkills,
  TASK_TOOL_LABELS,
  TOPIC_ITEMS,
} from "@/data/catalog";
import { useFavorites } from "@/lib/favorites";
import type {
  CollectionSlug,
  OutputType,
  SkillKind,
  SortMode,
  TaskToolType,
  TopicSlug,
} from "@/types/skill";
import { SkillCard } from "@/components/skill-card";

const OUTPUT_OPTIONS: { value: OutputType | "all"; label: string }[] = [
  { value: "all", label: "全部产出 All outputs" },
  { value: "images", label: OUTPUT_LABELS.images },
  { value: "video", label: OUTPUT_LABELS.video },
  { value: "slides", label: OUTPUT_LABELS.slides },
  { value: "web", label: OUTPUT_LABELS.web },
  { value: "games", label: OUTPUT_LABELS.games },
];

const TASK_OPTIONS: { value: TaskToolType; label: string }[] = [
  { value: "data", label: TASK_TOOL_LABELS.data },
  { value: "developer", label: TASK_TOOL_LABELS.developer },
  { value: "writing", label: TASK_TOOL_LABELS.writing },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "newest", label: "最新优先 Newest" },
  { value: "popular", label: "最热优先 Popular" },
  { value: "oldest", label: "最早发布 Oldest" },
  { value: "type", label: "按类型 Type" },
  { value: "name-asc", label: "名称 A → Z" },
  { value: "name-desc", label: "名称 Z → A" },
];

const REDUNDANT_PARENT_TOPICS: Record<string, Set<TopicSlug>> = {
  "output:video": new Set(["video-production"]),
  "output:slides": new Set(["talks-events"]),
  "output:games": new Set(["games-toys"]),
  "task:developer": new Set(["for-developers"]),
  "task:writing": new Set(["productivity-tools"]),
};

const PAGE_SIZE_OPTIONS = [24, 48, 96] as const;

function buildPageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push("ellipsis");
  for (let p = left; p <= right; p++) {
    pages.push(p);
  }
  if (right < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function SkillsExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { favorites } = useFavorites();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const stageTopRef = useRef<HTMLDivElement>(null);

  const q = searchParams.get("q") ?? "";
  const kind =
    (searchParams.get("kind") as SkillKind | "all" | "featured" | null) ?? "all";
  const collection =
    (searchParams.get("collection") as CollectionSlug | "all" | null) ?? "all";
  const output =
    (searchParams.get("output") as OutputType | "all" | null) ?? "all";
  const task =
    (searchParams.get("task") as TaskToolType | "all" | null) ?? "all";
  const topic =
    (searchParams.get("topic") as TopicSlug | "all" | null) ?? "all";
  const freeOnly = searchParams.get("free") === "1";
  const testedOnly = searchParams.get("tested") === "1";
  const favoritesOnly = searchParams.get("favorites") === "1";
  const sort = (searchParams.get("sort") as SortMode | null) ?? "newest";
  const rawLimit = Number(searchParams.get("limit") ?? "24");
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawLimit as 24 | 48 | 96)
    ? rawLimit
    : 24;
  const rawPage = Number(searchParams.get("page") ?? "1");

  const kindCounts = useMemo(() => getKindTabCounts(), []);
  const totalOutputCounts = useMemo(() => getOutputCounts(), []);
  const totalTaskCounts = useMemo(() => getTaskCounts(), []);

  const hasLeftSelection = output !== "all" || task !== "all";
  const activeParentLabel =
    output !== "all"
      ? OUTPUT_LABELS[output]
      : task !== "all"
        ? TASK_TOOL_LABELS[task]
        : "全部产出";

  const contextMatches = useMemo(() => {
    const base = querySkills({
      q,
      kind,
      collection,
      freeOnly,
      testedOnly,
    });
    if (!favoritesOnly) return base;
    return base.filter((item) => favorites.includes(item.slug));
  }, [
    q,
    kind,
    collection,
    freeOnly,
    testedOnly,
    favoritesOnly,
    favorites,
  ]);

  const contextOutputCounts = useMemo(() => {
    const counts: Record<OutputType | "all", number> = {
      all: contextMatches.length,
      images: 0,
      video: 0,
      slides: 0,
      web: 0,
      games: 0,
    };
    for (const item of contextMatches) {
      if (item.output) {
        counts[item.output] = (counts[item.output] ?? 0) + 1;
      }
    }
    return counts;
  }, [contextMatches]);

  const contextTaskCounts = useMemo(() => {
    const counts: Record<TaskToolType, number> = {
      data: 0,
      developer: 0,
      writing: 0,
    };
    for (const item of contextMatches) {
      if (item.taskTool) {
        counts[item.taskTool] = (counts[item.taskTool] ?? 0) + 1;
      }
    }
    return counts;
  }, [contextMatches]);

  const parentPool = useMemo(() => {
    if (!hasLeftSelection) return [];
    const base = querySkills({
      q,
      kind,
      collection,
      output,
      task,
      freeOnly,
      testedOnly,
    });
    if (!favoritesOnly) return base;
    return base.filter((item) => favorites.includes(item.slug));
  }, [
    hasLeftSelection,
    q,
    kind,
    collection,
    output,
    task,
    freeOnly,
    testedOnly,
    favoritesOnly,
    favorites,
  ]);

  const visibleSubcategories = useMemo(() => {
    if (!hasLeftSelection) return [];
    const counts = new Map<TopicSlug, number>();
    for (const item of parentPool) {
      for (const t of item.topics) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    const parentKey =
      output !== "all" ? `output:${output}` : task !== "all" ? `task:${task}` : "";
    const redundant = REDUNDANT_PARENT_TOPICS[parentKey];
    return TOPIC_ITEMS.map((item) => ({
      ...item,
      count: counts.get(item.slug) ?? 0,
    }))
      .filter((item) => item.count > 0 && !redundant?.has(item.slug))
      .sort((a, b) => b.count - a.count);
  }, [hasLeftSelection, parentPool, output, task]);

  const hasNonSidebarFilter =
    Boolean(q) ||
    kind !== "all" ||
    collection !== "all" ||
    freeOnly ||
    testedOnly ||
    favoritesOnly;

  function updateParams(patch: Record<string, string | null | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    const isPageOnly = Object.keys(patch).every((k) => k === "page");
    if (!isPageOnly) {
      next.delete("page");
    }
    for (const [key, val] of Object.entries(patch)) {
      if (
        !val ||
        val === "all" ||
        val === "0" ||
        (key === "page" && val === "1") ||
        (key === "limit" && val === "24")
      ) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    const qs = next.toString();
    router.replace(qs ? `/skills?${qs}` : "/skills", { scroll: false });
  }

  function clearAll() {
    router.replace("/skills", { scroll: false });
  }

  const results = useMemo(() => {
    const base = querySkills({
      q,
      kind,
      collection,
      output,
      task,
      topic,
      freeOnly,
      testedOnly,
      sort,
    });
    if (!favoritesOnly) return base;
    return base.filter((item) => favorites.includes(item.slug));
  }, [
    q,
    kind,
    collection,
    output,
    task,
    topic,
    freeOnly,
    testedOnly,
    sort,
    favoritesOnly,
    favorites,
  ]);

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage =
    Number.isFinite(rawPage) && rawPage >= 1
      ? Math.min(Math.floor(rawPage), totalPages)
      : 1;
  const pageStartIdx = (currentPage - 1) * pageSize;
  const pagedResults = useMemo(
    () => results.slice(pageStartIdx, pageStartIdx + pageSize),
    [results, pageStartIdx, pageSize]
  );

  function goToPage(nextPage: number) {
    const safePage = Math.max(1, Math.min(nextPage, totalPages));
    updateParams({ page: safePage === 1 ? null : String(safePage) });
    stageTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const hasActiveFilter =
    Boolean(q) ||
    kind !== "all" ||
    collection !== "all" ||
    output !== "all" ||
    task !== "all" ||
    topic !== "all" ||
    freeOnly ||
    testedOnly ||
    favoritesOnly;

  const PRIMARY_TABS: {
    id: SkillKind | "all" | "featured";
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: "all",
      label: "全部技能",
      count: kindCounts.all,
      icon: <LayoutGrid className="h-3.5 w-3.5" />,
    },
    {
      id: "featured",
      label: "精选推荐",
      count: kindCounts.featured,
      icon: <Star className="h-3.5 w-3.5" />,
    },
    {
      id: "visual-skill",
      label: "视觉技能",
      count: kindCounts["visual-skill"],
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
    {
      id: "agent-workflow",
      label: "Agent 工作流",
      count: kindCounts["agent-workflow"],
      icon: <Layers className="h-3.5 w-3.5" />,
    },
    {
      id: "browser-tool",
      label: "浏览器工具",
      count: kindCounts["browser-tool"],
      icon: <Wrench className="h-3.5 w-3.5" />,
    },
    {
      id: "text-workflow",
      label: "文本工作流",
      count: kindCounts["text-workflow"],
      icon: <FileText className="h-3.5 w-3.5" />,
    },
  ];

  const activeCollectionMeta = useMemo(
    () => COLLECTION_ITEMS.find((c) => c.slug === collection),
    [collection]
  );

  const activeChips = useMemo(() => {
    const chips: {
      key: string;
      label: string;
      patch: Record<string, null>;
    }[] = [];
    if (kind !== "all") {
      chips.push({
        key: "kind",
        label: `分类: ${kind === "featured" ? "精选推荐" : KIND_LABELS[kind]}`,
        patch: { kind: null },
      });
    }
    if (collection !== "all") {
      chips.push({
        key: "collection",
        label: `合集: ${activeCollectionMeta?.label ?? collection.toUpperCase()}`,
        patch: { collection: null },
      });
    }
    if (output !== "all") {
      chips.push({
        key: "output",
        label: `产出: ${OUTPUT_LABELS[output]}`,
        patch: { output: null },
      });
    }
    if (task !== "all") {
      chips.push({
        key: "task",
        label: `工具: ${TASK_TOOL_LABELS[task]}`,
        patch: { task: null },
      });
    }
    if (topic !== "all") {
      chips.push({
        key: "topic",
        label: `主题: ${TOPIC_ITEMS.find((t) => t.slug === topic)?.label ?? topic}`,
        patch: { topic: null },
      });
    }
    if (freeOnly) {
      chips.push({
        key: "free",
        label: "仅看免费",
        patch: { free: null },
      });
    }
    if (testedOnly) {
      chips.push({
        key: "tested",
        label: "已实测",
        patch: { tested: null },
      });
    }
    if (favoritesOnly) {
      chips.push({
        key: "favorites",
        label: "我的收藏",
        patch: { favorites: null },
      });
    }
    if (q) {
      chips.push({
        key: "q",
        label: `关键词: ${q}`,
        patch: { q: null },
      });
    }
    return chips;
  }, [
    kind,
    collection,
    activeCollectionMeta,
    output,
    task,
    topic,
    freeOnly,
    testedOnly,
    favoritesOnly,
    q,
  ]);

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      {/* Compact Page Masthead & Single Primary Workflow Tab Strip */}
      <section className="border-b border-[#111216]/15 pb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-[#ff3b1d] uppercase">
              <span className="h-2 w-2 bg-[#ff3b1d]" />
              <span>CREATIVE SKILL DIRECTORY // 开源技能索引</span>
            </div>
            <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-2xl font-extrabold tracking-tight text-[#111216] sm:text-4xl sm:leading-none">
                探索技能索引库
              </span>
              <span className="font-editorial text-2xl text-[#4e5361] italic sm:text-3xl sm:leading-none">
                Explore skills
              </span>
            </h1>
          </div>

          <p className="max-w-md border-l-2 border-[#0052ff] pl-3.5 text-xs leading-relaxed text-[#4e5361]">
            每一项都是原创开源 Agent Skill：支持自动连接本机{" "}
            <strong className="font-semibold text-[#111216]">
              Claude Code、Codex、Cursor、Antigravity
            </strong>{" "}
            并一键直装{" "}
            <code className="rounded-[2px] border border-[#111216]/20 bg-white px-1 py-0.5 font-mono text-[11px] font-semibold text-[#0052ff]">
              SKILL.md
            </code>
            。
          </p>
        </div>

        {/* Single Clean Mode Switcher (Kind Tabs — No Duplicate Upper Collection Cards) */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PRIMARY_TABS.map((tab) => {
            const active = kind === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  updateParams({ kind: tab.id === "all" ? null : tab.id })
                }
                className={`inline-flex cursor-pointer items-center gap-2 rounded-[2px] border px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "border-[#111216] bg-[#111216] text-white shadow-[2px_2px_0_#ff3b1d]"
                    : "border-[#111216]/20 bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                }`}
              >
                <span className={active ? "text-[#c8ff29]" : "text-[#0052ff]"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                <span
                  className={`font-mono text-[10px] ${
                    active ? "text-[#c8ff29]" : "text-[#7a808f]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main 2-Column Studio Workspace (Side-by-side from md:768px up) */}
      <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-start">
        {/* Mobile Filter Toggle Button (< 768px only) */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="flex w-full cursor-pointer items-center justify-between rounded-[2px] border border-[#111216] bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-[#111216] shadow-[2px_2px_0_#111216]"
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#0052ff]" />
              <span>产出类型 / 任务工具 / 筛选条件</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                mobileFiltersOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Left Sidebar */}
        <aside
          className={`${
            mobileFiltersOpen ? "block" : "hidden"
          } w-full shrink-0 md:block md:w-[204px] lg:w-[228px]`}
        >
          <div className="space-y-6 border-b border-[#d4d0c5] pb-5 md:border-r md:border-b-0 md:pr-5 md:pb-0">
            {/* Group 1: OUTPUT */}
            <div>
              <h3 className="mb-2.5 font-mono text-[10px] font-bold tracking-[0.14em] text-[#7a808f] uppercase">
                ┌ 产出类型 // OUTPUT
              </h3>
              <ul className="space-y-1">
                {OUTPUT_OPTIONS.map((item) => {
                  const active =
                    item.value === "all"
                      ? output === "all" && task === "all"
                      : output === item.value;
                  const total =
                    item.value === "all"
                      ? kindCounts.all
                      : totalOutputCounts[item.value];
                  const matched = contextOutputCounts[item.value];
                  const countLabel =
                    hasNonSidebarFilter && matched !== total
                      ? `${matched}/${total}`
                      : `${total}`;
                  return (
                    <li key={item.value}>
                      <button
                        type="button"
                        onClick={() =>
                          updateParams({
                            output:
                              item.value === "all"
                                ? null
                                : active
                                  ? null
                                  : item.value,
                            task: null,
                            topic: null,
                          })
                        }
                        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-[2px] border px-2.5 py-2 text-left text-xs transition-all ${
                          active
                            ? "border-[#111216] bg-[#0052ff] font-bold text-white shadow-[2px_2px_0_#111216]"
                            : matched === 0
                              ? "border-transparent text-[#9ca3af] hover:border-[#d4d0c5] hover:bg-white hover:text-[#4e5361]"
                              : "border-transparent text-[#4e5361] hover:border-[#d4d0c5] hover:bg-white hover:text-[#111216]"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        <span
                          className={`shrink-0 font-mono text-[10px] font-bold ${
                            active
                              ? "text-[#c8ff29]"
                              : matched === 0
                                ? "text-[#9ca3af]"
                                : "text-[#7a808f]"
                          }`}
                        >
                          {active ? `► ${countLabel}` : countLabel}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Group 2: TOOLS BY TASK */}
            <div>
              <h3 className="mb-2.5 font-mono text-[10px] font-bold tracking-[0.14em] text-[#7a808f] uppercase">
                ┌ 按任务工具 // TOOLS BY TASK
              </h3>
              <ul className="space-y-1">
                {TASK_OPTIONS.map((item) => {
                  const active = task === item.value;
                  const total = totalTaskCounts[item.value];
                  const matched = contextTaskCounts[item.value];
                  const countLabel =
                    hasNonSidebarFilter && matched !== total
                      ? `${matched}/${total}`
                      : `${total}`;
                  return (
                    <li key={item.value}>
                      <button
                        type="button"
                        onClick={() =>
                          updateParams({
                            task: active ? null : item.value,
                            output: null,
                            topic: null,
                          })
                        }
                        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-[2px] border px-2.5 py-2 text-left text-xs transition-all ${
                          active
                            ? "border-[#111216] bg-[#0052ff] font-bold text-white shadow-[2px_2px_0_#111216]"
                            : matched === 0
                              ? "border-transparent text-[#9ca3af] hover:border-[#d4d0c5] hover:bg-white hover:text-[#4e5361]"
                              : "border-transparent text-[#4e5361] hover:border-[#d4d0c5] hover:bg-white hover:text-[#111216]"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        <span
                          className={`shrink-0 font-mono text-[10px] font-bold ${
                            active
                              ? "text-[#c8ff29]"
                              : matched === 0
                                ? "text-[#9ca3af]"
                                : "text-[#7a808f]"
                          }`}
                        >
                          {active ? `► ${countLabel}` : countLabel}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Group 3: ACCESS & EVIDENCE */}
            <div>
              <h3 className="mb-2.5 font-mono text-[10px] font-bold tracking-[0.14em] text-[#7a808f] uppercase">
                ┌ 权限与验证 // ACCESS & EVIDENCE
              </h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() =>
                    updateParams({ free: freeOnly ? null : "1" })
                  }
                  className={`flex w-full cursor-pointer items-center justify-between rounded-[2px] border px-2.5 py-2 text-xs font-medium transition-all ${
                    freeOnly
                      ? "border-[#111216] bg-[#c8ff29] font-bold text-[#111216] shadow-[2px_2px_0_#111216]"
                      : "border-[#d4d0c5] bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                  }`}
                >
                  <span>仅看免费 Free only</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-[1px] border border-[#111216] ${
                      freeOnly ? "bg-[#111216]" : "bg-[#f4f3ee]"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateParams({ tested: testedOnly ? null : "1" })
                  }
                  className={`flex w-full cursor-pointer items-center justify-between rounded-[2px] border px-2.5 py-2 text-xs font-medium transition-all ${
                    testedOnly
                      ? "border-[#111216] bg-[#c8ff29] font-bold text-[#111216] shadow-[2px_2px_0_#111216]"
                      : "border-[#d4d0c5] bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                  }`}
                >
                  <span>已实测 Function-tested</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-[1px] border border-[#111216] ${
                      testedOnly ? "bg-[#111216]" : "bg-[#f4f3ee]"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateParams({ favorites: favoritesOnly ? null : "1" })
                  }
                  className={`flex w-full cursor-pointer items-center justify-between rounded-[2px] border px-2.5 py-2 text-xs font-medium transition-all ${
                    favoritesOnly
                      ? "border-[#111216] bg-[#ff3b1d] font-bold text-white shadow-[2px_2px_0_#111216]"
                      : "border-[#d4d0c5] bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>我的收藏</span>
                    <span className="font-mono text-[10px]">
                      [{favorites.length}]
                    </span>
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-[1px] border border-[#111216] ${
                      favoritesOnly ? "bg-white" : "bg-[#f4f3ee]"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Evidence Protocol */}
            <div className="border-t border-[#d4d0c5] pt-5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-[#059669]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>QA // EVIDENCE PROTOCOL</span>
              </div>
              <p className="mt-2 text-[12px] font-bold text-[#111216]">
                重证据，而非空口承诺。
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#4e5361]">
                本地脚本校验结果与 Agent 平台兼容性单独实测报告。
              </p>
              <Link
                href="/platforms"
                className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#0052ff] hover:text-[#ff3b1d]"
              >
                <span>READ VERIFICATION SPEC ↗</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Stage */}
        <div
          ref={stageTopRef}
          className="min-w-0 flex-1 scroll-mt-20 space-y-5"
        >
          {/* Search & Sort Bar */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex flex-1 items-center rounded-[2px] border border-[#111216]/30 bg-white transition-colors focus-within:border-[#111216] focus-within:shadow-[3px_3px_0_#111216]">
              <Search className="ml-3 h-4 w-4 shrink-0 text-[#4e5361]" />
              <span className="ml-2 hidden font-mono text-xs font-bold text-[#0052ff] sm:inline">
                /
              </span>
              <input
                type="text"
                value={q}
                onChange={(e) => updateParams({ q: e.target.value || null })}
                placeholder="按任务、产出类型或关键词搜索 (Search by task, output, or keyword...)"
                className="h-10 w-full bg-transparent px-2.5 text-xs font-medium text-[#111216] placeholder:text-[#7a808f] focus:outline-none sm:text-[13px]"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => updateParams({ q: null })}
                  className="mr-2.5 cursor-pointer text-[#7a808f] hover:text-[#111216]"
                  aria-label="清空搜索"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 items-center rounded-[2px] border border-[#111216]/30 bg-white focus-within:border-[#111216]">
                <ArrowUpDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#4e5361]" />
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  aria-label="排序方式"
                  className="h-full w-full cursor-pointer appearance-none bg-transparent pr-3.5 pl-8 font-mono text-xs leading-10 font-semibold text-[#111216] focus:outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex h-10 shrink-0 items-center rounded-[2px] border border-[#111216] bg-[#c8ff29] px-3 font-mono text-xs font-bold text-[#111216]">
                <span>{results.length}</span>
                <span className="ml-1.5 font-medium">skills</span>
              </div>

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-10 cursor-pointer items-center gap-1 rounded-[2px] border border-[#111216] bg-white px-2.5 font-mono text-[11px] font-bold text-[#ff3b1d] hover:bg-[#ff3b1d] hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>重置</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Subcategories for Active Left Category (Hidden when on All outputs) */}
          {hasLeftSelection && visibleSubcategories.length > 0 && (
            <div className="space-y-2 border-b border-[#d4d0c5] pb-4">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold tracking-[0.12em] text-[#7a808f] uppercase">
                <span>
                  └ {activeParentLabel} · 子分类 // SUBCATEGORIES (
                  {visibleSubcategories.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => updateParams({ topic: null })}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border px-2.5 py-1 font-mono text-[11px] font-bold transition-all ${
                    topic === "all"
                      ? "border-[#111216] bg-[#111216] text-white shadow-[2px_2px_0_#ff3b1d]"
                      : "border-[#d4d0c5] bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                  }`}
                >
                  <span>全部 {activeParentLabel.split(" ")[0]}</span>
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      topic === "all" ? "text-[#c8ff29]" : "text-[#7a808f]"
                    }`}
                  >
                    {parentPool.length}
                  </span>
                </button>

                {visibleSubcategories.map((item) => {
                  const active = topic === item.slug;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() =>
                        updateParams({ topic: active ? null : item.slug })
                      }
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border px-2.5 py-1 text-[11px] font-medium transition-all ${
                        active
                          ? "border-[#111216] bg-[#0052ff] font-bold text-white shadow-[2px_2px_0_#111216]"
                          : "border-[#d4d0c5] bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`font-mono text-[10px] font-bold ${
                          active ? "text-[#c8ff29]" : "text-[#7a808f]"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Calibration Sub-header & Active Filters Strip */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#4e5361]">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-[#0052ff]" />
                <span>
                  全部原创视觉技能、浏览器工具、文本工作流与 Agent 工作流，访问权限与实测状态均清晰标注。
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#111216]">
                当前匹配 {results.length} / {kindCounts.all} 项
                {results.length > 0 && ` · 第 ${currentPage}/${totalPages} 页`}
              </span>
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-[2px] border border-[#111216]/15 bg-white px-3 py-2">
                <span className="mr-1 font-mono text-[10px] font-bold text-[#4e5361]">
                  ACTIVE FILTERS ({activeChips.length}):
                </span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => updateParams(chip.patch)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-2 py-0.5 font-mono text-[10px] font-bold text-[#111216] transition-colors hover:bg-[#ff3b1d] hover:text-white"
                  >
                    <span>{chip.label}</span>
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {activeChips.length > 1 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="ml-auto inline-flex cursor-pointer items-center gap-1 font-mono text-[10px] font-bold text-[#ff3b1d] hover:underline"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>清除全部叠加</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results Grid */}
          {results.length === 0 ? (
            <div className="rounded-[3px] border border-dashed border-[#111216]/40 bg-white p-14 text-center">
              <p className="font-mono text-sm font-bold text-[#111216]">
                NO MATCHING SPECIMENS // 暂无匹配技能
              </p>
              <p className="mt-2 text-xs text-[#4e5361]">
                当前组合筛选条件下暂无匹配结果，可尝试重置筛选条件或前往 GitHub 雷达全网检索。
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer rounded-[2px] border border-[#111216] bg-[#eae8e0] px-4 py-2 font-mono text-xs font-bold text-[#111216] hover:bg-[#c8ff29]"
                >
                  重置全部筛选
                </button>
                <Link
                  href={`/discover${q ? `?q=${encodeURIComponent(q)}` : ""}`}
                  className="rounded-[2px] border border-[#111216] bg-[#ff3b1d] px-4 py-2 font-mono text-xs font-bold text-white shadow-[2px_2px_0_#111216]"
                >
                  去 GitHub 采集 →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pagedResults.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>

              {/* Pagination & Page Size Footer */}
              <div className="flex flex-col gap-3 rounded-[3px] border border-[#111216] bg-white px-4 py-3.5 shadow-[3px_3px_0_#111216] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#4e5361]">
                  <span>
                    显示第{" "}
                    <strong className="text-[#111216]">
                      {pageStartIdx + 1}–
                      {Math.min(pageStartIdx + pageSize, results.length)}
                    </strong>{" "}
                    条 · 共{" "}
                    <strong className="text-[#111216]">{results.length}</strong> 条
                    {totalPages > 1 && (
                      <span className="ml-1.5 text-[#0052ff]">
                        ({currentPage}/{totalPages} 页)
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1 border-l border-[#d4d0c5] pl-3">
                    <span className="text-[10px] text-[#7a808f]">每页</span>
                    {PAGE_SIZE_OPTIONS.map((size) => {
                      const isCurrentSize = pageSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            updateParams({
                              limit: size === 24 ? null : String(size),
                            })
                          }
                          className={`cursor-pointer rounded-[2px] border px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                            isCurrentSize
                              ? "border-[#111216] bg-[#c8ff29] text-[#111216]"
                              : "border-[#d4d0c5] bg-[#f4f3ee] text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label="分页导航"
                    className="flex flex-wrap items-center gap-1.5 font-mono text-xs"
                  >
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => goToPage(currentPage - 1)}
                      className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-[2px] border border-[#111216] bg-[#f4f3ee] px-2.5 text-[11px] font-bold text-[#111216] transition-colors hover:bg-[#c8ff29] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>上一页</span>
                    </button>

                    {buildPageWindow(currentPage, totalPages).map((entry, idx) =>
                      entry === "ellipsis" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1.5 font-mono text-xs text-[#7a808f]"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={entry}
                          type="button"
                          onClick={() => goToPage(entry)}
                          aria-current={
                            entry === currentPage ? "page" : undefined
                          }
                          className={`h-8 min-w-8 cursor-pointer rounded-[2px] border px-2 font-mono text-[11px] font-bold transition-all ${
                            entry === currentPage
                              ? "border-[#111216] bg-[#0052ff] text-white shadow-[2px_2px_0_#111216]"
                              : "border-[#d4d0c5] bg-white text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                          }`}
                        >
                          {entry}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-[2px] border border-[#111216] bg-[#f4f3ee] px-2.5 text-[11px] font-bold text-[#111216] transition-colors hover:bg-[#c8ff29] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span>下一页</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </nav>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
