"use client";

import { useQuery } from "@tanstack/react-query";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { mapRun } from "./map-run";

/** BE lists runs by environment; combine those lists for the project overview. */
export function useProjectRuns(projectId: string, userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["workspace", userId, projectId, "project-runs"],
    enabled: enabled && !!userId,
    retry: false,
    queryFn: async () => {
      const environments = await workspaceApi.listEnvironments(projectId);
      const groups = await Promise.all(environments.map((environment) =>
        workspaceApi.listRuns(projectId, environment.id),
      ));
      return groups.flat().map(mapRun).sort((a, b) =>
        new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime(),
      );
    },
  });
}
