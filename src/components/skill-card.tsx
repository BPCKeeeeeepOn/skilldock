"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  FileText,
  Heart,
  Layers,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { OUTPUT_LABELS, TASK_TOOL_LABELS } from "@/data/catalog";
import { useFavorites } from "@/lib/favorites";
import {
  getSkillAliasNames,
  isSkillInstalledOnAgent,
} from "@/lib/agent-skill-match";
import { formatStars, KIND_UPPER_LABELS } from "@/lib/format";
import { useLocalAgents } from "@/components/local-agents-provider";
import { SkillVisualBanner } from "@/components/skill-visual-banner";
import type { PlatformId, SkillItem } from "@/types/skill";

function KindGlyph({ kind }: { kind: SkillItem["kind"] }) {
  if (kind === "visual-skill") {
    return <Sparkles className="h-3 w-3 text-[#ff3b1d]" />;
  }
  if (kind === "browser-tool") {
    return <Wrench className="h-3 w-3 text-[#0052ff]" />;
  }
  if (kind === "text-workflow") {
    return <FileText className="h-3 w-3 text-[#d97706]" />;
  }
  return <Layers className="h-3 w-3 text-[#059669]" />;
}

export function SkillCard({ skill }: { skill: SkillItem }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { snapshot, scope, openDrawer, installSkill } = useLocalAgents();
  const fav = isFavorite(skill.slug);
  const [installing, setInstalling] = useState(false);
  const [justInstalledCount, setJustInstalledCount] = useState<number | null>(
    null
  );
  const [installFailed, setInstallFailed] = useState(false);

  const aliases = useMemo(() => getSkillAliasNames(skill), [skill]);

  const compatibleConnectedIds = useMemo<PlatformId[]>(() => {
    if (!snapshot) return [];
    const allowed = new Set<PlatformId>(skill.platforms);
    return snapshot.connectedIds.filter((id) => allowed.has(id));
  }, [skill.platforms, snapshot]);

  const installedCount = useMemo(() => {
    if (!snapshot) return 0;
    const allowed = new Set<PlatformId>(skill.platforms);
    return snapshot.agents.filter(
      (a) => allowed.has(a.id) && isSkillInstalledOnAgent(a, aliases, scope)
    ).length;
  }, [aliases, scope, skill.platforms, snapshot]);

  const rightTargetLabel = skill.output
    ? OUTPUT_LABELS[skill.output]
    : skill.taskTool
      ? TASK_TOOL_LABELS[skill.taskTool]
      : "Workflow";

  async function handleQuickInstall(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (compatibleConnectedIds.length === 0) {
      openDrawer();
      return;
    }

    setInstalling(true);
    setInstallFailed(false);
    try {
      const res = await installSkill({
        skillSlug: skill.slug,
        agentIds: compatibleConnectedIds,
        scopeOverride: scope,
      });
      const okCount = res.results.filter((r) => r.ok).length;
      setJustInstalledCount(okCount);
      setTimeout(() => setJustInstalledCount(null), 2600);
    } catch {
      setInstallFailed(true);
      setTimeout(() => setInstallFailed(false), 2400);
    } finally {
      setInstalling(false);
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[3px] border border-[#111216]/25 bg-white transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-[#111216] hover:shadow-[4px_4px_0_#111216]">
      <Link href={`/skills/${skill.slug}`} className="block">
        <SkillVisualBanner skill={skill} />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {/* Badges Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-semibold">
            {skill.featured && (
              <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-1.5 py-0.5 text-[#111216]">
                <Star className="h-2.5 w-2.5 fill-[#111216] text-[#111216]" />
                <span>精选</span>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-0.5 ${
                skill.functionTested
                  ? "border-[#059669]/40 bg-[#ecfdf5] text-[#047857]"
                  : "border-[#d4d0c5] bg-[#f4f3ee] text-[#4e5361]"
              }`}
            >
              <ShieldCheck className="h-2.5 w-2.5" />
              <span>{skill.functionTested ? "实测通过" : "已验证规范"}</span>
            </span>
            {installedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#059669] bg-[#059669] px-1.5 py-0.5 text-white">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>已装 {installedCount} 端</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(skill.slug)}
            aria-label={fav ? "取消收藏" : "加入收藏"}
            className={`inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[2px] border transition-colors ${
              fav
                ? "border-[#111216] bg-[#ff3b1d] text-white"
                : "border-[#d4d0c5] bg-[#f4f3ee] text-[#7a808f] hover:border-[#111216] hover:text-[#111216]"
            }`}
          >
            <Heart className={`h-3 w-3 ${fav ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Kind & Target Line */}
        <div className="mt-3 flex items-center justify-between gap-2 border-b border-[#eae8e0] pb-2 font-mono text-[10px]">
          <span className="inline-flex items-center gap-1.5 font-bold tracking-wider text-[#111216] uppercase">
            <KindGlyph kind={skill.kind} />
            <span>{KIND_UPPER_LABELS[skill.kind].split(" · ")[0]}</span>
          </span>
          <span className="font-medium text-[#4e5361]">{rightTargetLabel}</span>
        </div>

        {/* Title & English Name */}
        <Link
          href={`/skills/${skill.slug}`}
          className="mt-2.5 flex items-start justify-between gap-2"
        >
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[14px] leading-snug font-bold tracking-tight text-[#111216] transition-colors group-hover:text-[#0052ff]">
              {skill.title}
            </h3>
            <p className="mt-0.5 truncate font-mono text-[10px] text-[#7a808f]">
              {skill.repo} · {skill.englishName}
            </p>
          </div>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#7a808f] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff3b1d]" />
        </Link>

        {/* Summary */}
        <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-[#4e5361]">
          {skill.summary}
        </p>

        {/* Tech Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
          {skill.techTags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#111216]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Card Action Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#eae8e0] pt-3 font-mono text-[10px]">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[#7a808f]">
            <span className="shrink-0 font-bold text-[#111216]">
              ★ {formatStars(skill.stars)}
            </span>
            <span className="truncate">{skill.deliverable}</span>
          </span>

          <button
            type="button"
            disabled={installing}
            onClick={handleQuickInstall}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-[2px] border px-2 py-1 font-bold transition-colors ${
              justInstalledCount !== null
                ? "border-[#111216] bg-[#c8ff29] text-[#111216]"
                : installFailed
                  ? "border-[#ff3b1d] bg-[#fff0eb] text-[#ff3b1d]"
                  : compatibleConnectedIds.length > 0
                    ? "border-[#111216] bg-[#c8ff29] text-[#111216] hover:bg-[#0052ff] hover:text-white"
                    : "border-[#111216]/30 bg-[#f4f3ee] text-[#111216] hover:border-[#111216] hover:bg-[#111216] hover:text-white"
            }`}
          >
            {installing ? (
              <>
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                <span>安装中...</span>
              </>
            ) : justInstalledCount !== null ? (
              <>
                <Check className="h-2.5 w-2.5" />
                <span>已装 {justInstalledCount} 端</span>
              </>
            ) : installFailed ? (
              <span>重试安装</span>
            ) : compatibleConnectedIds.length > 0 ? (
              <>
                <Zap className="h-2.5 w-2.5 fill-current" />
                <span>
                  {installedCount > 0
                    ? `同步 (${compatibleConnectedIds.length})`
                    : `一键安装 (${compatibleConnectedIds.length})`}
                </span>
              </>
            ) : (
              <>
                <Zap className="h-2.5 w-2.5" />
                <span>连接并安装</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
