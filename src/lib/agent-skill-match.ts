import type { InstallScope, LocalAgentStatus } from "@/types/local-agent";
import type { SkillItem } from "@/types/skill";

export function getSkillAliasNames(skill: Pick<SkillItem, "slug" | "englishName" | "installCommand" | "subpath">): string[] {
  const aliases = new Set<string>([skill.slug, skill.englishName]);
  const flagMatch = skill.installCommand.match(/--skill\s+([^\s]+)/);
  if (flagMatch?.[1]) {
    aliases.add(flagMatch[1]);
  }
  if (skill.subpath && skill.subpath !== ".") {
    const last = skill.subpath.split("/").filter(Boolean).pop();
    if (last) aliases.add(last);
  }
  return Array.from(aliases);
}

export function isSkillInstalledOnAgent(
  agent: LocalAgentStatus,
  aliases: string[],
  scope: InstallScope = "global"
): boolean {
  const list =
    scope === "project" ? agent.projectInstalledSkills : agent.installedSkills;
  if (list.length === 0) return false;
  const normalizedSet = new Set(list.map((n) => n.toLowerCase()));
  return aliases.some((alias) => normalizedSet.has(alias.toLowerCase()));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
