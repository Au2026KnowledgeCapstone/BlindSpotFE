"use client";

import { useQuery } from "@tanstack/react-query";
import { workspaceApi } from "@/features/workspace";
import { mapRun } from "./map-run";
import { mapResult } from "./map-result";

/** A single run plus its per-requirement results. `cancelRun` while queued is honest about having no worker yet. */
export function useRunDetail(projectId: string, environmentId: string | undefined, runId: string) {
  const run = useQuery({
    queryKey: ["workspace", projectId, "runs", environmentId, runId],
    queryFn: async () => mapRun(await workspaceApi.getRun(projectId, environmentId!, runId)),
    enabled: !!environmentId,
    retry: false,
  });
  const results = useQuery({
    queryKey: ["workspace", projectId, "runs", environmentId, runId, "results"],
    queryFn: async () => (await workspaceApi.listResults(projectId, environmentId!, runId)).map(mapResult),
    enabled: !!environmentId,
    retry: false,
  });
  return { run, results };
}
