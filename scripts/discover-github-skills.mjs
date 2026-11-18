#!/usr/bin/env node
/**
 * 批量从 GitHub 搜索并解析开源 Agent Skills (SKILL.md)
 *
 * 用法：
 *   node scripts/discover-github-skills.mjs "react"
 *   GITHUB_TOKEN=ghp_xxx node scripts/discover-github-skills.mjs "pdf"
 *
 * 说明：
 * - 若配置了 GITHUB_TOKEN，则优先使用 Code Search API 精确查找 filename:SKILL.md 并抓取原文件解析 YAML Frontmatter。
 * - 若未配置 Token，则降级使用公开 Repository Search API，返回匹配仓库的元信息。
 */

import fs from "node:fs";
import path from "node:path";

const keyword = process.argv[2] || "agent skills";
const token = process.env.GITHUB_TOKEN || "";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "SkillAtlas-Discovery-Script",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (key) meta[key] = val;
  }
  return meta;
}

async function searchWithCodeApi() {
  const q = `filename:SKILL.md ${keyword}`;
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=15`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Code Search API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const seen = new Set();
  const results = [];

  for (const item of data.items || []) {
    const fullName = item.repository?.full_name;
    if (!fullName) continue;
    const uniqueKey = `${fullName}:${item.path}`;
    if (seen.has(uniqueKey)) continue;
    seen.add(uniqueKey);

    const rawUrl = `https://raw.githubusercontent.com/${fullName}/${
      item.repository.default_branch || "main"
    }/${item.path}`;

    let frontmatter = {};
    try {
      const rawRes = await fetch(rawUrl);
      if (rawRes.ok) {
        frontmatter = parseFrontmatter(await rawRes.text());
      }
    } catch {
      // Ignore individual raw file fetch errors
    }

    results.push({
      repo: fullName,
      repoUrl: item.repository.html_url,
      filePath: item.path,
      name: frontmatter.name || path.basename(path.dirname(item.path)) || fullName,
      description:
        frontmatter.description || item.repository.description || "No description",
      installCommand: `npx skills add ${fullName}`,
    });
  }

  return results;
}

async function searchWithRepoApi() {
  const q = /skill|rule|claude|codex|cursor|agent/i.test(keyword)
    ? keyword
    : `${keyword} SKILL.md`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    q
  )}&sort=stars&order=desc&per_page=15`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Repo Search API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return (data.items || []).map((repo) => ({
    repo: repo.full_name,
    repoUrl: repo.html_url,
    stars: repo.stargazers_count,
    license: repo.license?.spdx_id || "UNKNOWN",
    description: repo.description || "",
    updatedAt: repo.updated_at?.slice(0, 10),
    installCommand: `npx skills add ${repo.full_name}`,
  }));
}

async function main() {
  console.log(`Searching GitHub for "${keyword}" (${token ? "Code API + Token" : "Public Repo API"})...`);
  const items = token ? await searchWithCodeApi() : await searchWithRepoApi();
  const outDir = path.join(process.cwd(), "data");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "discovered-skills.json");
  fs.writeFileSync(
    outFile,
    JSON.stringify({ keyword, generatedAt: new Date().toISOString(), items }, null, 2),
    "utf8"
  );
  console.log(`Found ${items.length} entries -> saved to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
