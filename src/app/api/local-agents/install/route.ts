import { installSkillToLocalAgents } from "@/lib/local-agents";
import type { InstallScope } from "@/types/local-agent";
import type { PlatformId } from "@/types/skill";

interface InstallRequestBody {
  skillSlug?: string;
  customRepo?: { repo: string; dirName?: string };
  agentIds?: PlatformId[];
  scope?: InstallScope;
  projectPath?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InstallRequestBody;
    const scope: InstallScope =
      body.scope === "project" ? "project" : "global";
    const agentIds = Array.isArray(body.agentIds) ? body.agentIds : [];

    const outcome = await installSkillToLocalAgents({
      skillSlug: body.skillSlug,
      customRepo: body.customRepo,
      agentIds,
      scope,
      projectPath: body.projectPath,
    });

    return Response.json(outcome, { status: outcome.ok ? 200 : 422 });
  } catch (err) {
    return Response.json(
      {
        error: "安装技能到本地 Agent CLI 失败",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 400 }
    );
  }
}
