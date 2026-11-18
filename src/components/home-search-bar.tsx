"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/skills?q=${encodeURIComponent(trimmed)}` : "/skills"
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-12 items-center rounded-[3px] border border-[#111216] bg-white pl-3.5 pr-1 shadow-[4px_4px_0_#111216] transition-transform focus-within:-translate-x-0.5 focus-within:-translate-y-0.5"
    >
      <Search className="h-4 w-4 shrink-0 text-[#4e5361]" />
      <span className="mx-2 font-mono text-xs font-bold text-[#0052ff]">/</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索 3D 场景、Remotion 影片、GLSL、游戏物理引擎..."
        className="h-full w-full bg-transparent text-xs font-medium text-[#111216] placeholder:text-[#7a808f] focus:outline-none sm:text-sm"
      />
      <button
        type="submit"
        className="ml-2 inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-4 font-mono text-xs font-bold text-[#111216] transition-colors hover:bg-[#ff3b1d] hover:text-white"
      >
        <span>进入目录</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
