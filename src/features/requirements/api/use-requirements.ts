"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceApi, WorkspaceApiError } from "@/features/workspace";
import { mapRequirement } from "./map-requirement";

const key = (userId: string | undefined, projectId: string) =>
  ["workspace", userId, projectId, "requirements"] as const;

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

/** Requirement queries and mutations backed by BE's project API. */
export function useRequirements(projectId: string) {
  const cache = useQueryClient();
  const identityVersion = useIdentityVersion();
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: () => workspaceApi.identity(), retry: false, staleTime: 0, gcTime: 0 });
  const project = useQuery({ queryKey: ["workspace", identity.data?.id, "project", projectId], queryFn: () => workspaceApi.project(projectId), enabled: !!identity.data, retry: false });
  const data = useQuery({
    queryKey: key(identity.data?.id, projectId),
    queryFn: async () => (await workspaceApi.requirements(projectId)).map(mapRequirement),
    enabled: !!project.data,
    retry: false,
  });

  async function refresh() {
    await cache.invalidateQueries({ queryKey: key(identity.data?.id, projectId) });
  }
  async function create(args: { title: string; description?: string; category?: string; priority?: string; acceptanceCriteria?: string[] }) {
    await workspaceApi.createRequirement(projectId, args);
    await refresh();
  }
  async function update(requirementId: string, args: { title: string; description: string; acceptanceCriteria: { id?: string; text: string }[] }) {
    await workspaceApi.updateRequirement(projectId, requirementId, args);
    await refresh();
  }
  async function approve(requirementId: string) {
    await workspaceApi.approveRequirement(projectId, requirementId);
    await refresh();
  }

  const canManage = project.data?.role === "owner" || project.data?.role === "admin";
  const unavailable = data.isError && data.error instanceof WorkspaceApiError && data.error.status === 501;
  return { identity, project, data, canManage, unavailable, create, update, approve };
}
