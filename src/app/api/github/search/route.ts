interface GitHubRepoItem {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  topics?: string[];
  license: { spdx_id?: string | null; name?: string | null } | null;
}

interface GitHubRepoResponse {
  total_count: number;
  items: GitHubRepoItem[];
}

async function queryGitHubRepos(
  githubQuery: string,
  headers: Record<string, string>
) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    githubQuery
  )}&sort=stars&order=desc&per_page=12`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    return {
      ok: false as const,
      status: res.status,
      detail: (await res.text()).slice(0, 240),
    };
  }
  const data = (await res.json()) as GitHubRepoResponse;
  return { ok: true as const, data };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("q") ?? "").trim();
  const mode = searchParams.get("mode") ?? "skills";

  const keyword = rawQuery || "claude skills";
  const isMcp = mode === "mcp";
  const primaryQuery = isMcp
    ? /\bmcp\b/i.test(keyword)
      ? keyword
      : `${keyword} mcp server`
    : /skill|rule|claude|codex|cursor|agent/i.test(keyword)
      ? keyword
      : `${keyword} SKILL.md`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "SkillDock-Open-Directory",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    let outcome = await queryGitHubRepos(primaryQuery, headers);
    if (!outcome.ok) {
      return Response.json(
        {
          error: `GitHub API 返回状态 ${outcome.status}`,
          detail: outcome.detail,
          rateLimited: outcome.status === 403 || outcome.status === 429,
        },
        { status: outcome.status }
      );
    }

    // Fallback to broader "agent skills" repo query if exact SKILL.md search returned 0
    if (
      !isMcp &&
      outcome.data.total_count === 0 &&
      primaryQuery !== `${keyword} agent skills`
    ) {
      const fallback = await queryGitHubRepos(`${keyword} agent skills`, headers);
      if (fallback.ok && fallback.data.total_count > 0) {
        outcome = fallback;
      }
    }

    const items = (outcome.data.items ?? []).map((repo) => ({
      id: repo.id,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description ?? "暂无仓库简介",
      stars: repo.stargazers_count,
      language: repo.language ?? "Markdown",
      license: repo.license?.spdx_id ?? "未标注协议",
      updatedAt: repo.updated_at.slice(0, 10),
      topics: (repo.topics ?? []).slice(0, 5),
      suggestedCommand: isMcp
        ? `git clone ${repo.html_url}.git`
        : `npx skills add ${repo.full_name}`,
    }));

    return Response.json({
      query: keyword,
      mode,
      totalCount: outcome.data.total_count,
      hasToken: Boolean(process.env.GITHUB_TOKEN),
      items,
    });
  } catch (err) {
    return Response.json(
      {
        error: "请求 GitHub Search API 失败，请检查网络连接",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
