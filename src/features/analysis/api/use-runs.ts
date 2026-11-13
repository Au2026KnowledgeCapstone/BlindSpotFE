"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "@/features/workspace";
import { mapRun } from "./map-run";

function useIdentityVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
    if (channel) channel.onmessage = refresh;
    window.addEventListener("blindspot:auth-changed", refresh);
    return () => { window.removeEventListener("blindspot:auth-changed", refresh); channel?.close(); };
  }, []);
  return version;
}

const runsKey = (userId: string | undefined, projectId: string, environmentId: string | undefined) =>
  ["workspace", userId, projectId, "runs", environmentId] as const;

/** Runs for one environment of a project — the real analysis-run model, selected via `environmentId`. */
export function useRuns(projectId: string, environmentId: string | undefined) {
  const cache = useQueryClient();
  const identityVersion = useIdentityVersion();
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: () => workspaceApi.identity(), retry: false, staleTime: 0, gcTime: 0 });
  const project = useQuery({ queryKey: ["workspace", identity.data?.id, "project", projectId], queryFn: () => workspaceApi.project(projectId), enabled: !!identity.data, retry: false });
  const workspace = useQuery({ queryKey: ["workspace", identity.data?.id, projectId, "infrastructure"], queryFn: ({ signal }) => workspaceApi.projectWorkspace(projectId, signal), enabled: !!project.data, retry: false });
  const runsQuery = useQuery({
    queryKey: runsKey(identity.data?.id, projectId, environmentId),
    queryFn: async () => (await workspaceApi.listRuns(projectId, environmentId!)).map(mapRun),
    enabled: !!project.data && !!environmentId,
    retry: false,
  });

  async function refresh() {
    await cache.invalidateQueries({ queryKey: runsKey(identity.data?.id, projectId, environmentId) });
  }
  async function start(requirementIds: string[]) {
    if (!environmentId) throw new Error("Choose an environment first.");
    const created = await workspaceApi.createRun(projectId, environmentId, requirementIds);
    await refresh();
    return mapRun(created);
  }
  async function cancel(runId: string) {
    if (!environmentId) throw new Error("Choose an environment first.");
    await workspaceApi.cancelRun(projectId, environmentId, runId);
    await refresh();
  }

  return { identity, project, workspace, runsQuery, start, cancel };
}
