import Link from "next/link";
import { ArrowRight, ArrowUpRight, Film, Gamepad2, Layers, Sparkles } from "lucide-react";
import {
  COLLECTION_ITEMS,
  OUTPUT_LABELS,
  TOPIC_ITEMS,
  getCatalogStats,
  getOutputCounts,
  querySkills,
} from "@/data/catalog";
import { HeroKineticCanvas } from "@/components/hero-kinetic-canvas";
import { HomeInstallerPreview } from "@/components/home-installer-preview";
import { HomeSearchBar } from "@/components/home-search-bar";
import { SkillCard } from "@/components/skill-card";

const MARQUEE_TOKENS = [
  "THREE.JS ARCHITECTURAL WALKTHROUGH",
  "EXPLODED HARDWARE CAD",
  "REMOTION 60FPS FILM",
  "GLSL RAYMARCHING SDF",
  "BOIDS CORAL ECOLOGY",
  "WEBAUDIO POLY SYNTH",
  "PHASER ARCADE PHYSICS",
  "SWISS POSTER GRID",
];

export default function HomePage() {
  const stats = getCatalogStats();
  const outputCounts = getOutputCounts();
  const outputTypeCount = Object.keys(OUTPUT_LABELS).length;
  const topicCount = TOPIC_ITEMS.length;
  const featured = querySkills({ kind: "featured", sort: "popular" }).slice(0, 8);

  return (
    <div>
      {/* 1. Asymmetric Kinetic Hero Stage */}
      <section className="mx-auto max-w-[1480px] px-4 pt-8 pb-12 sm:px-6 lg:px-10 lg:pt-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Hero Manifesto */}
          <div className="min-w-0 space-y-6 lg:col-span-6">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-[2px] border border-[#111216] bg-white px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-[#111216] shadow-[2px_2px_0_#111216]">
              <span className="h-2 w-2 rounded-full bg-[#ff3b1d]" />
              <span>DAYLIGHT CREATIVE STUDIO</span>
              <span className="text-[#bab5a8]">{"//"}</span>
              <span className="text-[#0052ff]">SKILL.MD STANDARD</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#111216] sm:text-5xl xl:text-[56px] xl:leading-[1.06]">
                让编码智能体
                <span className="block">
                  直接生成
                  <span className="relative mx-1.5 inline-block border-b-4 border-[#ff3b1d] px-1 text-[#0052ff] sm:mx-2">
                    3D · 视频 · 游戏
                  </span>
                </span>
              </h1>
              <p className="font-editorial text-xl text-[#4e5361] italic sm:text-3xl">
                Visual Worlds, Motion Films &amp; Playable Mechanics.
              </p>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-[#4e5361] sm:text-[15px]">
              告别千篇一律的通用脚本。这里汇集专为{" "}
              <strong className="font-semibold text-[#111216]">
                Three.js 建筑漫游、CAD 爆炸拆解、Remotion 编程电影、GLSL 着色器、WebAudio 合成器与物理游戏
              </strong>{" "}
              打造的开源 <code className="rounded-[2px] border border-[#111216]/20 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-[#0052ff]">SKILL.md</code> 技能包。
            </p>

            <div className="max-w-lg">
              <HomeSearchBar />
            </div>

            {/* Dual Action CTAs & Telemetry Counters */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/skills"
                className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-[#111216] bg-[#111216] px-5 font-mono text-xs font-bold text-white shadow-[4px_4px_0_#ff3b1d] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#0052ff]"
              >
                <span>探索完整分类目录 ({stats.totalItems})</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/discover"
                className="inline-flex h-11 items-center gap-1.5 rounded-[3px] border border-[#111216] bg-white px-4 font-mono text-xs font-bold text-[#111216] shadow-[3px_3px_0_#111216] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#c8ff29]"
              >
                <span>GitHub 开源雷达</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid max-w-lg grid-cols-3 divide-x divide-[#d4d0c5] border-t border-[#d4d0c5] pt-4 font-mono">
              <div className="pr-3">
                <div className="text-xl font-extrabold text-[#111216]">
                  {stats.visualCount}
                </div>
                <div className="text-[10px] text-[#7a808f]">视觉与 3D 技能</div>
              </div>
              <div className="px-3">
                <div className="text-xl font-extrabold text-[#0052ff]">
                  {stats.browserCount + stats.workflowCount}
                </div>
                <div className="text-[10px] text-[#7a808f]">工具与工作流</div>
              </div>
              <div className="pl-3">
                <div className="text-xl font-extrabold text-[#ff3b1d]">
                  08
                </div>
                <div className="text-[10px] text-[#7a808f]">大原生 Agent 平台</div>
              </div>
            </div>
          </div>

          {/* Right Live Interactive 60FPS Canvas Stage */}
          <div className="min-w-0 lg:col-span-6">
            <HeroKineticCanvas />
          </div>
        </div>
      </section>

      {/* 2. Acid-Lime Kinetic Marquee Tape */}
      <div className="overflow-hidden border-y border-[#111216] bg-[#c8ff29] py-2.5">
        <div className="animate-kinetic-marquee font-mono text-xs font-extrabold tracking-widest text-[#111216] uppercase">
          {[...MARQUEE_TOKENS, ...MARQUEE_TOKENS].map((token, idx) => (
            <span key={idx} className="mx-5 inline-flex items-center gap-4">
              <span>{token}</span>
              <span className="text-[#ff3b1d]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Bento Taxonomy Portal + 12 Collections */}
      <section className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#0052ff] uppercase">
              TAXONOMY PORTAL // 从成果目标与分类开始
            </p>
            <h2 className="mt-1 flex flex-wrap items-baseline gap-3 text-2xl font-bold tracking-tight text-[#111216] sm:text-3xl">
              <span>创作分类矩阵</span>
              <span className="font-editorial text-2xl font-normal text-[#4e5361] italic sm:text-3xl">
                Start with an outcome.
              </span>
            </h2>
          </div>

          <Link
            href="/skills"
            className="font-mono text-xs font-bold text-[#111216] underline decoration-[#ff3b1d] decoration-2 underline-offset-4 hover:text-[#0052ff]"
          >
            打开完整筛选器 (6 形态 · {outputTypeCount} 产出 · {topicCount} 主题) →
          </Link>
        </div>

        {/* Asymmetric 4-Card Bento Showcase */}
        <div className="grid gap-4 md:grid-cols-12">
          {/* Card 1: Blueprint Cobalt Large Tile */}
          <Link
            href="/skills?kind=visual-skill"
            className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-[3px] border border-[#111216] bg-[#0052ff] p-6 text-white shadow-[5px_5px_0_#111216] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 md:col-span-5"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-[2px] border border-white/40 bg-white/15 px-2 py-0.5 font-mono text-[10px] font-bold">
                01 // VISUAL SKILLS [{stats.visualCount}]
              </span>
              <Sparkles className="h-5 w-5 text-[#c8ff29]" />
            </div>
            <div className="mt-8 space-y-2">
              <h3 className="text-2xl font-extrabold tracking-tight">
                视觉技能与 3D 交互空间
              </h3>
              <p className="text-xs leading-relaxed text-white/85">
                Three.js 建筑漫游、CAD 爆炸拆解、机甲骨骼遥测、Coral Reef Boids 海洋生态、GLSL Raymarching 着色器与瑞士印刷海报网格。
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px]">
                <span className="border border-white/30 bg-white/10 px-2 py-0.5">
                  three.js
                </span>
                <span className="border border-white/30 bg-white/10 px-2 py-0.5">
                  WebGL &amp; GLSL
                </span>
                <span className="border border-white/30 bg-white/10 px-2 py-0.5">
                  Canvas / SVG
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Signal Vermilion Video Block */}
          <Link
            href="/skills?output=video"
            className="group flex min-w-0 flex-col justify-between rounded-[3px] border border-[#111216] bg-[#ff3b1d] p-6 text-white shadow-[5px_5px_0_#111216] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 md:col-span-4"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-[2px] border border-white/40 bg-black/15 px-2 py-0.5 font-mono text-[10px] font-bold">
                02 // OUTPUT: VIDEO [{outputCounts.video}]
              </span>
              <Film className="h-5 w-5 text-[#c8ff29]" />
            </div>
            <div className="mt-8 space-y-2">
              <h3 className="text-2xl font-extrabold tracking-tight">
                编程式视频与动效流水线
              </h3>
              <p className="text-xs leading-relaxed text-white/90">
                Remotion 60fps 产品宣传短片、声画节拍驱动相机推轨、手绘白板科普动画与逐帧分镜生成工作流。
              </p>
              <div className="pt-2 font-mono text-[11px] font-bold underline underline-offset-4">
                筛选视频输出技能 →
              </div>
            </div>
          </Link>

          {/* Right Column Stacked 2 Tiles */}
          <div className="flex min-w-0 flex-col gap-4 md:col-span-3">
            <Link
              href="/skills?output=games"
              className="group flex flex-1 flex-col justify-between rounded-[3px] border border-[#111216] bg-white p-5 shadow-[4px_4px_0_#111216] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#c8ff29]"
            >
              <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#0052ff] group-hover:text-[#111216]">
                <span>03 // OUTPUT: GAMES [{outputCounts.games}]</span>
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-extrabold text-[#111216]">
                  游戏开发与物理引擎
                </h3>
                <p className="mt-1 text-[11px] text-[#4e5361] group-hover:text-[#111216]">
                  Godot 4.7、Unity 6.3、Unreal 5.8、Roblox、Phaser、Three.js、Bevy 全链路技能
                </p>
              </div>
            </Link>

            <Link
              href="/skills?kind=browser-tool"
              className="group flex flex-1 flex-col justify-between rounded-[3px] border border-[#111216] bg-[#eae8e0] p-5 shadow-[4px_4px_0_#111216] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-white"
            >
              <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#ff3b1d]">
                <span>04 // TOOLS &amp; WORKFLOWS [{stats.browserCount + stats.workflowCount}]</span>
                <Layers className="h-4 w-4" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-extrabold text-[#111216]">
                  浏览器工具与 Agent 流程
                </h3>
                <p className="mt-1 text-[11px] text-[#4e5361]">
                  WebAudio 贝斯效果器链、SVG 可视化器与文本工作流
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Collections Quick Rack */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {COLLECTION_ITEMS.map((col, idx) => (
            <Link
              key={col.slug}
              href={`/skills?collection=${col.slug}`}
              className="group flex items-center justify-between gap-2 rounded-[2px] border border-[#111216]/25 bg-white px-3 py-2 text-[11px] font-semibold text-[#111216] transition-all hover:-translate-y-0.5 hover:border-[#111216] hover:bg-[#c8ff29] hover:shadow-[2px_2px_0_#111216]"
            >
              <span className="truncate">{col.label}</span>
              <span className="shrink-0 font-mono text-[10px] text-[#0052ff] group-hover:text-[#111216]">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Gallery Specimens */}
      <section className="mx-auto max-w-[1480px] border-t border-[#111216]/15 px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#ff3b1d] uppercase">
              CURATED SPECIMENS // 精选高星代表作
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#111216] sm:text-3xl">
              热门视觉、3D 与游戏技能精选
            </h2>
          </div>

          <Link
            href="/skills"
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#111216] bg-white px-4 py-2 font-mono text-xs font-bold text-[#111216] shadow-[3px_3px_0_#111216] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#c8ff29]"
          >
            <span>查看全部 {stats.totalItems} 项技能</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      {/* 5. Interactive Platform Installer Strip */}
      <section className="mx-auto max-w-[1480px] px-4 pb-8 sm:px-6 lg:px-10">
        <HomeInstallerPreview />
      </section>
    </div>
  );
}
