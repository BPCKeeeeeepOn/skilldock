import { connection } from "next/server";
import { scanLocalAgents } from "@/lib/local-agents";

export async function GET(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const projectPath = searchParams.get("projectPath") ?? undefined;
    const snapshot = await scanLocalAgents(projectPath);
    return Response.json(snapshot);
  } catch (err) {
    return Response.json(
      {
        error: "扫描本机 Agent CLI 环境失败",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
