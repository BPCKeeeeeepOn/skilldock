import { PLATFORMS } from "@/data/platforms";
import {
  readConnectionState,
  runAgentHandshakes,
  scanLocalAgents,
  writeConnectionState,
} from "@/lib/local-agents";
import type { PlatformId } from "@/types/skill";

type ConnectAction =
  | "connect"
  | "disconnect"
  | "connect-all-cli"
  | "connect-all-detected"
  | "disconnect-all"
  | "set-connections"
  | "verify";

interface ConnectBody {
  action?: ConnectAction;
  agentId?: PlatformId;
  agentIds?: PlatformId[];
  projectPath?: string;
}

const VALID_IDS = new Set<PlatformId>(PLATFORMS.map((p) => p.id));

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConnectBody;
    const action = body.action ?? "verify";
    const current = await readConnectionState();
    let nextConnected = [...current.connectedIds];

    if (action === "connect" && body.agentId && VALID_IDS.has(body.agentId)) {
      nextConnected = Array.from(new Set([...nextConnected, body.agentId]));
      await writeConnectionState(nextConnected);
    } else if (
      action === "disconnect" &&
      body.agentId &&
      VALID_IDS.has(body.agentId)
    ) {
      nextConnected = nextConnected.filter((id) => id !== body.agentId);
      await writeConnectionState(nextConnected);
    } else if (action === "connect-all-cli") {
      const scan = await scanLocalAgents(body.projectPath);
      const cliIds = scan.agents
        .filter((a) => a.detectMode === "cli-ready")
        .map((a) => a.id);
      nextConnected = Array.from(new Set([...nextConnected, ...cliIds]));
      await writeConnectionState(nextConnected);
    } else if (action === "connect-all-detected") {
      const scan = await scanLocalAgents(body.projectPath);
      const detectedIds = scan.agents
        .filter((a) => a.detected)
        .map((a) => a.id);
      nextConnected = Array.from(new Set([...nextConnected, ...detectedIds]));
      await writeConnectionState(nextConnected);
    } else if (action === "disconnect-all") {
      nextConnected = [];
      await writeConnectionState([]);
    } else if (action === "set-connections" && Array.isArray(body.agentIds)) {
      nextConnected = body.agentIds.filter((id) => VALID_IDS.has(id));
      await writeConnectionState(nextConnected);
    }

    const verifyIds: PlatformId[] =
      action === "connect" && body.agentId && VALID_IDS.has(body.agentId)
        ? [body.agentId]
        : Array.isArray(body.agentIds) && body.agentIds.length > 0
          ? body.agentIds.filter((id) => VALID_IDS.has(id))
          : nextConnected;

    const { checks, snapshot } = await runAgentHandshakes(
      verifyIds,
      body.projectPath
    );

    return Response.json({
      ok: true,
      action,
      checks,
      snapshot,
    });
  } catch (err) {
    return Response.json(
      {
        error: "连接本地 Agent CLI 失败",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
