"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Heart, Menu, PlugZap, Terminal, X } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { useLocalAgents } from "@/components/local-agents-provider";

const NAV_ITEMS = [
  { href: "/", code: "00", label: "创意首页" },
  { href: "/skills", code: "01", label: "探索目录" },
  { href: "/skills?kind=visual-skill", code: "02", label: "视觉技能" },
  { href: "/skills?kind=browser-tool", code: "03", label: "浏览器工具" },
  { href: "/platforms", code: "04", label: "平台与路径" },
  { href: "/discover", code: "05", label: "GitHub 采集" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const { snapshot, loading, openDrawer } = useLocalAgents();
  const [mobileOpen, setMobileOpen] = useState(false);

  const connectedCount = snapshot?.connectedIds.length ?? 0;
  const cliReadyCount =
    snapshot?.agents.filter((a) => a.detectMode === "cli-ready").length ?? 0;
  const detectedCount =
    snapshot?.agents.filter((a) => a.detected).length ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-[#111216]/15 bg-[#f4f3ee]/92 backdrop-blur-md">
      <div className="mx-auto flex h-15 max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-7">
          {/* Geometric Bauhaus Optical Mark linking to Homepage */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-6 w-6 grid-cols-2 gap-0.5 rounded-[2px] border border-[#111216] bg-white p-0.5 shadow-[2px_2px_0_#111216] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
              <span className="bg-[#111216]" />
              <span className="bg-[#ff3b1d]" />
              <span className="bg-[#0052ff]" />
              <span className="bg-[#c8ff29]" />
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-display text-[15px] font-extrabold tracking-tight text-[#111216] uppercase">
                SKILLDOCK
              </span>
              <span className="hidden rounded-[2px] border border-[#111216]/25 bg-[#c8ff29] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-[#111216] sm:inline-block">
                LAB // 26
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/skills"
                    ? pathname === "/skills"
                    : !item.href.includes("?") &&
                      pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[2px] px-2.5 py-1.5 text-[12px] transition-colors ${
                    isActive
                      ? "bg-[#111216] font-semibold text-[#f4f3ee]"
                      : "text-[#4e5361] hover:bg-[#eae8e0] hover:text-[#111216]"
                  }`}
                >
                  <span
                    className={`hidden font-mono text-[10px] xl:inline ${
                      isActive ? "text-[#c8ff29]" : "text-[#7a808f]"
                    }`}
                  >
                    {item.code}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <button
            type="button"
            onClick={openDrawer}
            className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[2px] border px-2.5 font-mono text-[11px] font-bold transition-all hover:-translate-y-0.5 ${
              connectedCount > 0
                ? "border-[#111216] bg-[#c8ff29] text-[#111216] shadow-[2px_2px_0_#111216]"
                : "border-[#0052ff] bg-white text-[#0052ff] shadow-[2px_2px_0_#111216] hover:bg-[#eef3ff]"
            }`}
          >
            {connectedCount > 0 ? (
              <>
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#059669]" />
                <span>已连接 {connectedCount} CLI</span>
              </>
            ) : loading && !snapshot ? (
              <>
                <Terminal className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                <span>扫描本机 CLI...</span>
              </>
            ) : (
              <>
                <PlugZap className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {detectedCount > 0 ? (
                    cliReadyCount > 0 ? (
                      <>
                        <span className="hidden xl:inline">
                          本机 {cliReadyCount} CLI / {detectedCount} 环境 · 连接
                        </span>
                        <span className="xl:hidden">
                          CLI {cliReadyCount}/{detectedCount} · 连接
                        </span>
                      </>
                    ) : (
                      `连接本机 (${detectedCount})`
                    )
                  ) : (
                    "连接本机 CLI"
                  )}
                </span>
              </>
            )}
          </button>

          <Link
            href="/skills?favorites=1"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[2px] border border-[#111216]/30 bg-white px-2.5 font-mono text-[11px] font-medium text-[#111216] transition-all hover:border-[#111216] hover:shadow-[2px_2px_0_#111216]"
          >
            <Heart
              className={`h-3 w-3 shrink-0 ${
                favorites.length > 0
                  ? "fill-[#ff3b1d] text-[#ff3b1d]"
                  : "text-[#7a808f]"
              }`}
            />
            <span>收藏</span>
            <span className="border-l border-[#d4d0c5] pl-1.5 font-bold">
              {String(favorites.length).padStart(2, "0")}
            </span>
          </Link>

          <Link
            href="/discover"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[2px] border border-[#111216] bg-[#ff3b1d] px-3 text-[12px] font-bold text-white shadow-[2px_2px_0_#111216] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#111216]"
          >
            <span>采集开源 SKILL</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-[2px] border border-[#111216]/30 bg-white p-1.5 text-[#111216] lg:hidden"
          aria-label="展开导航菜单"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#111216]/15 bg-[#ffffff] px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openDrawer();
              }}
              className="mb-1 flex cursor-pointer items-center justify-between rounded-[2px] border border-[#111216] bg-[#c8ff29] px-2.5 py-2 font-mono text-xs font-bold text-[#111216]"
            >
              <span>本机 Agent CLI 连接管理</span>
              <span>
                {connectedCount > 0
                  ? `${connectedCount} 已连接`
                  : `${detectedCount} 已发现`}
              </span>
            </button>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-[2px] px-2 py-2 text-xs font-medium text-[#111216] hover:bg-[#eae8e0]"
              >
                <span className="font-mono text-[10px] text-[#0052ff]">
                  {item.code}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
