import type { SkillKind } from "@/types/skill";

export function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(count);
}

export const KIND_UPPER_LABELS: Record<SkillKind, string> = {
  "visual-skill": "VISUAL SKILL · 视觉技能",
  "browser-tool": "BROWSER TOOL · 浏览器工具",
  "text-workflow": "TEXT WORKFLOW · 文本工作流",
  "agent-workflow": "AGENT WORKFLOW · Agent 工作流",
};
