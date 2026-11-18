"use client";

import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Check, Loader2, Search, Star, Terminal, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { formatStars } from "@/lib/format";
import { CopyButton } from "@/components/copy-button";
import { useLocalAgents } from "@/components/local-agents-provider";

interface GitHubResultItem {
  id: number;
  fullName: string;
  url: string;
  description: string;
  stars: number;
  language: string;
  license: string;
  updatedAt: string;
  topics: string[];
  suggestedCommand: string;
}

const PRESET_SEARCHES = [
  { label: "01 Remotion 视频", q: "remotion skills" },
  { label: "02 Three.js 3D 场景", q: "threejs skills" },
  { label: "03 游戏开发 GameDev", q: "gamedev agent skills" },
  { label: "04 UI / 视觉设计", q: "ui ux skill" },
  { label: "05 Claude Agent Skills", q: "claude skills" },
];

const CLI_SCRIPT_CMD = `node scripts/discover-github-skills.mjs "threejs skills"`;

export function GitHubDiscoverClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "remotion skills";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GitHubResultItem[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const { snapshot, scope, openDrawer, installSkill } = useLocalAgents();
  const [installingRepo, setInstallingRepo] = useState<string | null>(null);
  const [installedRepos, setInstalledRepos] = useState<Record<string, string>>(
    {}
  );

  async function handleInstallRepo(repoFullName: string) {
    const connectedIds = snapshot?.connectedIds ?? [];
    if (connectedIds.length === 0) {
      openDrawer();
      return;
    }
    setInstallingRepo(repoFullName);
    try {
      const res = await installSkill({
        customRepo: { repo: repoFullName },
        agentIds: connectedIds,
        scopeOverride: scope,
      });
      const okCount = res.results.filter((r) => r.ok).length;
      setInstalledRepos((prev) => ({
        ...prev,
        [repoFullName]: `已装 ${okCount} 端 (${res.files.length} 文件)`,
      }));
    } catch (err) {
      setInstalledRepos((prev) => ({
        ...prev,
        [repoFullName]:
          err instanceof Error ? `失败: ${err.message.slice(0, 28)}` : "安装失败",
      }));
    } finally {
      setInstallingRepo(null);
    }
  }

  function executeSearch(targetQuery: string, signal?: AbortSignal) {
    fetch(
      `/api/github/search?q=${encodeURIComponent(targetQuery)}&mode=skills`,
      { signal }
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "GitHub 检索请求失败");
        }
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotalCount(
          typeof data.totalCount === "number" ? data.totalCount : null
        );
        setError(null);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "网络请求失败");
      })
      .finally(() => {
        if (!signal?.aborted) {
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    executeSearch(initialQuery, controller.signal);
    return () => controller.abort();
  }, [initialQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = query.trim() || "claude skills";
    setLoading(true);
    setError(null);
    executeSearch(target);
  }

  function handlePreset(presetQuery: string) {
    setQuery(presetQuery);
    setLoading(true);
    setError(null);
    executeSearch(presetQuery);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[3px] border border-[#111216] bg-white p-5 shadow-[5px_5px_0_#111216]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex flex-1 items-center rounded-[2px] border border-[#111216]/35 bg-[#faf9f5] focus-within:border-[#111216]">
            <Search className="ml-3 h-4 w-4 shrink-0 text-[#4e5361]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入开源领域关键词检索 GitHub SKILL.md 仓库..."
              className="h-10 w-full bg-transparent px-3 text-sm font-medium text-[#111216] placeholder:text-[#7a808f] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-[#111216] bg-[#ff3b1d] px-5 font-mono text-xs font-bold text-white shadow-[2px_2px_0_#111216] transition-all hover:bg-[#0052ff] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>实时扫描 GITHUB</span>
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {PRESET_SEARCHES.map((preset) => {
            const active = query === preset.q;
            return (
              <button
                key={preset.q}
                type="button"
                onClick={() => handlePreset(preset.q)}
                className={`cursor-pointer rounded-[2px] border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-[#111216] bg-[#c8ff29] text-[#111216]"
                    : "border-[#d4d0c5] bg-[#f4f3ee] text-[#4e5361] hover:border-[#111216] hover:text-[#111216]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eae8e0] pt-3.5 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-[#4e5361]">
            <Terminal className="h-3.5 w-3.5 text-[#0052ff]" />
            <span>CLI 批量抓取落盘脚本:</span>
            <code className="rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-2 py-0.5 font-semibold text-[#111216]">
              {CLI_SCRIPT_CMD}
            </code>
          </div>
          <CopyButton text={CLI_SCRIPT_CMD} label="复制脚本命令" />
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-[11px] font-semibold text-[#4e5361]">
        <span>
          {loading
            ? "SCANNING REPOSITORIES..."
            : `MATCHED ${items.length} REPOSITORIES` +
              (totalCount !== null ? ` (GITHUB TOTAL: ${totalCount})` : "")}
        </span>
        <span>SOURCE: api.github.com/search/repositories</span>
      </div>

      {error && (
        <div className="rounded-[2px] border border-[#ff3b1d] bg-[#fff0eb] p-4 font-mono text-xs font-bold text-[#ff3b1d]">
          ERROR // {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((repo) => (
          <div
            key={repo.id}
            className="flex flex-col justify-between rounded-[3px] border border-[#111216]/25 bg-white p-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-[#111216] hover:shadow-[4px_4px_0_#111216]"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-[#111216] hover:text-[#0052ff]"
                >
                  <span>{repo.fullName}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-2 py-0.5 font-mono text-[11px] font-bold text-[#111216]">
                  <Star className="h-3 w-3 fill-[#111216]" />
                  {formatStars(repo.stars)}
                </span>
              </div>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#4e5361]">
                {repo.description}
              </p>

              {repo.topics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {repo.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-[2px] border border-[#d4d0c5] bg-[#f4f3ee] px-1.5 py-0.5 font-mono text-[10px] text-[#4e5361]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#eae8e0] pt-3 font-mono text-[10px]">
              <div className="flex items-center gap-2 font-medium text-[#7a808f]">
                <span>{repo.language}</span>
                <span>·</span>
                <span>{repo.license}</span>
                <span>·</span>
                <span>{repo.updatedAt}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CopyButton text={repo.suggestedCommand} label="复制命令" />
                <button
                  type="button"
                  disabled={installingRepo === repo.fullName}
                  onClick={() => handleInstallRepo(repo.fullName)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-[2px] border border-[#111216] bg-[#c8ff29] px-2.5 py-1 font-bold text-[#111216] hover:bg-[#0052ff] hover:text-white disabled:opacity-50"
                >
                  {installingRepo === repo.fullName ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>安装中...</span>
                    </>
                  ) : installedRepos[repo.fullName] ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>{installedRepos[repo.fullName]}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 fill-current" />
                      <span>
                        {(snapshot?.connectedIds.length ?? 0) > 0
                          ? `一键安装 (${snapshot?.connectedIds.length})`
                          : "连接后直装"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
