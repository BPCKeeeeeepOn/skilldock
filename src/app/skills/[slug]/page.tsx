import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import {
  getSkillBySlug,
  KIND_LABELS,
  OUTPUT_LABELS,
  SKILLS_CATALOG,
  TASK_TOOL_LABELS,
  TOPIC_LABEL_MAP,
} from "@/data/catalog";
import { formatStars } from "@/lib/format";
import { SkillCard } from "@/components/skill-card";
import {
  AgentInstallerPanel,
  FavoriteToggleButton,
  PackageFileExplorer,
  SkillDetailGallery,
} from "@/components/skill-detail-interactive";

export async function generateStaticParams() {
  return SKILLS_CATALOG.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) {
    return { title: "未找到 · SKILLDOCK" };
  }
  return {
    title: `${skill.title} · SKILLDOCK`,
    description: skill.summary,
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  const rightLabel = skill.output
    ? OUTPUT_LABELS[skill.output]
    : skill.taskTool
      ? TASK_TOOL_LABELS[skill.taskTool]
      : "Workflow";

  const related = SKILLS_CATALOG.filter(
    (item) =>
      item.slug !== skill.slug &&
      (item.kind === skill.kind ||
        item.topics.some((t) => skill.topics.includes(t)))
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] font-medium text-[#7a808f]">
        <Link
          href="/skills"
          className="inline-flex items-center gap-1 hover:text-[#111216]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>INDEX</span>
        </Link>
        <span>/</span>
        <Link
          href={`/skills?kind=${skill.kind}`}
          className="hover:text-[#0052ff]"
        >
          {KIND_LABELS[skill.kind]}
        </Link>
        <span>/</span>
        <span className="font-bold text-[#111216]">{skill.englishName}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 space-y-8 lg:col-span-8">
          <div className="space-y-3 border-b border-[#d4d0c5] pb-6">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="rounded-[2px] border border-[#111216] bg-[#ff3b1d] px-2 py-0.5 font-bold text-white uppercase">
                {KIND_LABELS[skill.kind]}
              </span>
              <span className="rounded-[2px] border border-[#d4d0c5] bg-white px-2 py-0.5 font-semibold text-[#111216]">
                {rightLabel}
              </span>
              <span
                className={`rounded-[2px] border border-[#111216] px-2 py-0.5 font-bold ${
                  skill.free
                    ? "bg-[#c8ff29] text-[#111216]"
                    : "bg-[#0052ff] text-white"
                }`}
              >
                {skill.free ? "FREE" : "PRO"}
              </span>
              <span className="font-bold text-[#4e5361]">
                ★ {formatStars(skill.stars)}
              </span>
            </div>

            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#111216] break-words sm:text-4xl">
              {skill.title}
            </h1>

            <p className="font-mono text-xs font-medium text-[#7a808f] break-all">
              {skill.englishName}
            </p>

            <p className="text-sm leading-relaxed text-[#4e5361] break-words sm:text-base">
              {skill.summary}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <FavoriteToggleButton slug={skill.slug} />

              <a
                href={skill.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 rounded-[2px] border border-[#111216]/30 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-[#111216] transition-all hover:border-[#111216] hover:shadow-[2px_2px_0_#111216]"
              >
                <span className="truncate">{skill.repo}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#0052ff]" />
              </a>

              {skill.skillBlobUrl && (
                <a
                  href={skill.skillBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-3 py-1.5 font-mono text-xs font-bold text-[#111216] shadow-[2px_2px_0_#111216] transition-transform hover:-translate-y-0.5"
                >
                  <span>查看 GitHub SKILL.md</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </a>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[3px] border border-[#111216] shadow-[5px_5px_0_#111216]">
            <SkillDetailGallery skill={skill} />
            <div className="grid grid-cols-2 divide-x divide-y divide-[#d4d0c5] border-t border-[#111216]/20 bg-white text-xs sm:grid-cols-4 sm:divide-y-0">
              <div className="min-w-0 p-3.5">
                <div className="font-mono text-[10px] font-bold text-[#7a808f] uppercase">
                  TECH STACK
                </div>
                <div className="mt-1 font-mono font-bold text-[#111216] break-words">
                  {skill.techTags.join(" · ")}
                </div>
              </div>
              <div className="min-w-0 p-3.5">
                <div className="font-mono text-[10px] font-bold text-[#7a808f] uppercase">
                  DELIVERABLE
                </div>
                <div className="mt-1 font-mono font-bold text-[#111216] break-words">
                  {skill.deliverable}
                </div>
              </div>
              <div className="p-3.5">
                <div className="font-mono text-[10px] font-bold text-[#7a808f] uppercase">
                  EVIDENCE STATUS
                </div>
                <div className="mt-1 font-mono font-bold text-[#059669]">
                  {skill.functionTested ? "Function-tested" : "Script checked"}
                </div>
              </div>
              <div className="p-3.5">
                <div className="font-mono text-[10px] font-bold text-[#7a808f] uppercase">
                  UPDATED AT
                </div>
                <div className="mt-1 font-mono font-bold text-[#111216]">
                  {skill.updatedAt}
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="font-mono text-xs font-bold tracking-widest text-[#0052ff] uppercase">
              01 // SKILL.md 执行流程
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {skill.playbookSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-[2px] border border-[#111216] bg-white p-4 shadow-[3px_3px_0_#eae8e0]"
                >
                  <div className="font-mono text-xs font-extrabold text-[#ff3b1d]">
                    {step.step}
                  </div>
                  <h3 className="mt-1.5 text-sm font-bold text-[#111216]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#4e5361]">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs font-bold tracking-widest text-[#0052ff] uppercase">
              02 // 包内文件与指令源码预览
            </h2>
            <PackageFileExplorer files={skill.files} />
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs font-bold tracking-widest text-[#0052ff] uppercase">
              03 // EVIDENCE, NOT PROMISES · 实测记录
            </h2>
            <div className="divide-y divide-[#d4d0c5] rounded-[2px] border border-[#111216] bg-white">
              {skill.verificationChecks.map((check) => (
                <div
                  key={check.label}
                  className="flex flex-col gap-1.5 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="flex items-center gap-2 font-bold text-[#111216]">
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#059669]" />
                    <span>{check.label}</span>
                  </span>
                  <span className="break-all font-mono text-[11px] text-[#4e5361] sm:text-right">
                    {check.note}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="min-w-0 lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-20">
            <AgentInstallerPanel skill={skill} />

            <div className="rounded-[3px] border border-[#111216] bg-white p-4">
              <div className="mb-3 font-mono text-[10px] font-bold tracking-wider text-[#7a808f] uppercase">
                TOPICS // 所属细分主题
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skill.topics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/skills?topic=${encodeURIComponent(topic)}`}
                    className="rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#111216] transition-colors hover:border-[#111216] hover:bg-[#c8ff29]"
                  >
                    {TOPIC_LABEL_MAP[topic] ?? topic}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t border-[#d4d0c5] pt-8">
          <h2 className="mb-5 font-mono text-xs font-bold tracking-widest text-[#0052ff] uppercase">
            RELATED SPECIMENS // 同类推荐
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <SkillCard key={item.id} skill={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
