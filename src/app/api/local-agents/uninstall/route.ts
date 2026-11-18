import { uninstallSkillFromLocalAgents } from "@/lib/local-agents";
import type { InstallScope } from "@/types/local-agent";
import type { PlatformId } from "@/types/skill";

interface UninstallRequestBody {
  skillSlug?: string;
  agentIds?: PlatformId[];
  scope?: InstallScope;
  projectPath?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UninstallRequestBody;
    if (!body.skillSlug) {
      return Response.json({ error: "缺少 skillSlug 参数" }, { status: 400 });
    }
    const scope: InstallScope =
      body.scope === "project" ? "project" : "global";
    const agentIds = Array.isArray(body.agentIds) ? body.agentIds : [];

    const outcome = await uninstallSkillFromLocalAgents({
      skillSlug: body.skillSlug,
      agentIds,
      scope,
      projectPath: body.projectPath,
    });
    return Response.json(outcome);
  } catch (err) {
    return Response.json(
      {
        error: "卸载本地 Skill 失败",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 400 }
    );
  }
}
