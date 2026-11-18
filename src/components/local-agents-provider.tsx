"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  HandshakeCheckItem,
  InstallScope,
  InstallSkillResponse,
  LocalAgentsSnapshot,
  UninstallSkillResponse,
} from "@/types/local-agent";
import type { PlatformId } from "@/types/skill";

const SCOPE_STORAGE_KEY = "skilldock:install-scope";
const PROJECT_PATH_STORAGE_KEY = "skilldock:project-path";

interface ConnectResponse {
  ok: boolean;
  checks?: HandshakeCheckItem[];
  snapshot: LocalAgentsSnapshot;
  error?: string;
  detail?: string;
}

interface LocalAgentsContextValue {
  snapshot: LocalAgentsSnapshot | null;
  loading: boolean;
  error: string | null;
  scope: InstallScope;
  setScope: (scope: InstallScope) => void;
  projectPath: string;
  setProjectPath: (path: string) => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  handshakes: Record<string, HandshakeCheckItem>;
  busyAction: string | null;
  refresh: (customProjectPath?: string) => Promise<LocalAgentsSnapshot | null>;
  runConnectAction: (
    action:
      | "connect"
      | "disconnect"
      | "connect-all-cli"
      | "connect-all-detected"
      | "disconnect-all"
      | "set-connections"
      | "verify",
    options?: { agentId?: PlatformId; agentIds?: PlatformId[] }
  ) => Promise<ConnectResponse>;
  installSkill: (params: {
    skillSlug?: string;
    customRepo?: { repo: string; dirName?: string };
    agentIds?: PlatformId[];
    scopeOverride?: InstallScope;
  }) => Promise<InstallSkillResponse>;
  uninstallSkill: (params: {
    skillSlug: string;
    agentIds: PlatformId[];
    scopeOverride?: InstallScope;
  }) => Promise<UninstallSkillResponse>;
}

const LocalAgentsContext = createContext<LocalAgentsContextValue | null>(null);

export function LocalAgentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] = useState<LocalAgentsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScopeState] = useState<InstallScope>("global");
  const [projectPath, setProjectPathState] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [handshakes, setHandshakes] = useState<
    Record<string, HandshakeCheckItem>
  >({});
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const projectPathRef = useRef<string>("");

  const setScope = useCallback((next: InstallScope) => {
    setScopeState(next);
    try {
      window.localStorage.setItem(SCOPE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const setProjectPath = useCallback((next: string) => {
    projectPathRef.current = next;
    setProjectPathState(next);
    try {
      window.localStorage.setItem(PROJECT_PATH_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const refresh = useCallback(
    async (customProjectPath?: string): Promise<LocalAgentsSnapshot | null> => {
      setLoading(true);
      setError(null);
      try {
        let savedScope: InstallScope | null = null;
        let effectiveProject = customProjectPath ?? projectPathRef.current;
        if (!effectiveProject) {
          try {
            const storedProject = window.localStorage.getItem(
              PROJECT_PATH_STORAGE_KEY
            );
            if (storedProject) {
              effectiveProject = storedProject;
              projectPathRef.current = storedProject;
            }
            const storedScope = window.localStorage.getItem(SCOPE_STORAGE_KEY);
            if (storedScope === "global" || storedScope === "project") {
              savedScope = storedScope;
            }
          } catch {
            // ignore storage failure
          }
        }
        const qs = effectiveProject
          ? `?projectPath=${encodeURIComponent(effectiveProject)}`
          : "";
        const res = await fetch(`/api/local-agents${qs}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as LocalAgentsSnapshot & {
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error ?? "本地 CLI 扫描失败");
        }
        setSnapshot(data);
        if (savedScope) {
          setScopeState(savedScope);
        }
        if (effectiveProject) {
          setProjectPathState(effectiveProject);
        } else if (data.defaultProjectPath) {
          projectPathRef.current = data.defaultProjectPath;
          setProjectPathState(data.defaultProjectPath);
        }
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "本机扫描失败");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const runConnectAction = useCallback(
    async (
      action:
        | "connect"
        | "disconnect"
        | "connect-all-cli"
        | "connect-all-detected"
        | "disconnect-all"
        | "set-connections"
        | "verify",
      options?: { agentId?: PlatformId; agentIds?: PlatformId[] }
    ): Promise<ConnectResponse> => {
      const actionKey = options?.agentId
        ? `${action}:${options.agentId}`
        : action;
      setBusyAction(actionKey);
      setError(null);
      try {
        const res = await fetch("/api/local-agents/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            agentId: options?.agentId,
            agentIds: options?.agentIds,
            projectPath: projectPath || undefined,
          }),
        });
        const data = (await res.json()) as ConnectResponse;
        if (!res.ok) {
          throw new Error(data.detail ?? data.error ?? "连接本地 CLI 失败");
        }
        if (data.snapshot) {
          setSnapshot(data.snapshot);
        }
        if (Array.isArray(data.checks)) {
          setHandshakes((prev) => {
            const next = { ...prev };
            for (const c of data.checks ?? []) {
              next[c.agentId] = c;
            }
            return next;
          });
        }
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "连接请求异常";
        setError(msg);
        throw err;
      } finally {
        setBusyAction(null);
      }
    },
    [projectPath]
  );

  const installSkill = useCallback(
    async (params: {
      skillSlug?: string;
      customRepo?: { repo: string; dirName?: string };
      agentIds?: PlatformId[];
      scopeOverride?: InstallScope;
    }): Promise<InstallSkillResponse> => {
      const key = params.skillSlug ?? params.customRepo?.repo ?? "install";
      setBusyAction(`install:${key}`);
      setError(null);
      try {
        const fallbackTargets =
          snapshot?.connectedIds && snapshot.connectedIds.length > 0
            ? snapshot.connectedIds
            : snapshot?.agents
                .filter((a) => a.detectMode === "cli-ready")
                .map((a) => a.id) ?? [];

        const targetIds =
          params.agentIds && params.agentIds.length > 0
            ? params.agentIds
            : fallbackTargets;

        const res = await fetch("/api/local-agents/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillSlug: params.skillSlug,
            customRepo: params.customRepo,
            agentIds: targetIds,
            scope: params.scopeOverride ?? scope,
            projectPath: projectPath || undefined,
          }),
        });
        const data = (await res.json()) as InstallSkillResponse & {
          error?: string;
          detail?: string;
        };
        if (data.snapshot) {
          setSnapshot(data.snapshot);
        }
        if (!res.ok) {
          throw new Error(data.detail ?? data.error ?? "安装失败");
        }
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "安装失败";
        setError(msg);
        throw err;
      } finally {
        setBusyAction(null);
      }
    },
    [projectPath, scope, snapshot]
  );

  const uninstallSkill = useCallback(
    async (params: {
      skillSlug: string;
      agentIds: PlatformId[];
      scopeOverride?: InstallScope;
    }): Promise<UninstallSkillResponse> => {
      setBusyAction(`uninstall:${params.skillSlug}`);
      setError(null);
      try {
        const res = await fetch("/api/local-agents/uninstall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillSlug: params.skillSlug,
            agentIds: params.agentIds,
            scope: params.scopeOverride ?? scope,
            projectPath: projectPath || undefined,
          }),
        });
        const data = (await res.json()) as UninstallSkillResponse & {
          error?: string;
          detail?: string;
        };
        if (data.snapshot) {
          setSnapshot(data.snapshot);
        }
        if (!res.ok) {
          throw new Error(data.detail ?? data.error ?? "卸载失败");
        }
        return data;
      } finally {
        setBusyAction(null);
      }
    },
    [projectPath, scope]
  );

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<LocalAgentsContextValue>(
    () => ({
      snapshot,
      loading,
      error,
      scope,
      setScope,
      projectPath,
      setProjectPath,
      drawerOpen,
      openDrawer,
      closeDrawer,
      handshakes,
      busyAction,
      refresh,
      runConnectAction,
      installSkill,
      uninstallSkill,
    }),
    [
      snapshot,
      loading,
      error,
      scope,
      setScope,
      projectPath,
      setProjectPath,
      drawerOpen,
      openDrawer,
      closeDrawer,
      handshakes,
      busyAction,
      refresh,
      runConnectAction,
      installSkill,
      uninstallSkill,
    ]
  );

  return (
    <LocalAgentsContext.Provider value={value}>
      {children}
    </LocalAgentsContext.Provider>
  );
}

export function useLocalAgents() {
  const ctx = useContext(LocalAgentsContext);
  if (!ctx) {
    throw new Error("useLocalAgents must be used inside LocalAgentsProvider");
  }
  return ctx;
}
