"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "./workspace-api";

export function useProjectInfrastructure(projectId: string) {
  const cache = useQueryClient();
  const [identityVersion, setIdentityVersion] = useState(0);
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: workspaceApi.identity, retry: false, staleTime: 0, gcTime: 0 });
  const userId = identity.data?.id;
  const project = useQuery({ queryKey: ["workspace", userId, "project", projectId], queryFn: () => workspaceApi.project(projectId), enabled: !!userId, retry: false });
  const data = useQuery({ queryKey: ["workspace", userId, projectId, "infrastructure"], queryFn: ({ signal }) => workspaceApi.projectWorkspace(projectId, signal), enabled: !!project.data, retry: false });
  useEffect(() => {
    let mounted = true;
    const refresh = () => { void cache.cancelQueries({ queryKey: ["workspace"] }).then(() => { cache.removeQueries({ queryKey: ["workspace"] }); if (mounted) setIdentityVersion((version) => version + 1); }); };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
    if (channel) channel.onmessage = refresh;
    window.addEventListener("blindspot:auth-changed", refresh);
    return () => { mounted = false; window.removeEventListener("blindspot:auth-changed", refresh); channel?.close(); };
  }, [cache]);
  const refresh = () => cache.invalidateQueries({ queryKey: ["workspace", userId, projectId] });
  const canManage = project.data?.role === "owner" || project.data?.role === "admin";
  return { identity, project, data, canManage, refresh };
}
