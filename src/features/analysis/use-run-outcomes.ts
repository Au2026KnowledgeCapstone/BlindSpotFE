"use client";
import { useQueries } from "@tanstack/react-query";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { mapResult } from "./api/map-result";
import type { Result, Run } from "./types";

/**
 * A run's outcome is only knowable by reading its results, and BE exposes no
 * cross-run aggregate — so this costs one paginated request per run. Every
 * caller therefore passes the narrowest run list that answers its question,
 * and this window caps whatever slips through. Without it a project with a
 * few hundred runs opens its runs page with a few hundred concurrent reads.
 */
export const RUN_OUTCOME_LIMIT = 50;

export type RunOutcome = { results?: Result[] | undefined; isPending: boolean; isError: boolean };

export function useRunOutcomes(runs: Run[], limit = RUN_OUTCOME_LIMIT) {
  // Only a completed run has results to read; anything else is still moving.
  const eligible = runs.filter((run) => run.status === "completed").slice(0, limit);
  const queries = useQueries({
    queries: eligible.map((run) => ({
      // Shared with every other outcome reader on the page, so two components
      // asking about the same run cost one request.
      queryKey: ["workspace", run.projectId, "runs", run.environmentId, run.id, "results", "telemetry"],
      queryFn: () => workspaceApi.listResults(run.projectId, run.environmentId, run.id),
      retry: false,
      staleTime: 30000,
    })),
  });
  const byId = new Map<string, RunOutcome>(
    eligible.map((run, index) => {
      const query = queries[index];
      return [run.id, { results: query?.data?.map(mapResult), isPending: !!query?.isPending, isError: !!query?.isError }];
    }),
  );
  return {
    byId,
    /** Runs this hook actually read, so callers can disclose a truncated view. */
    covered: eligible.length,
    truncated: runs.filter((run) => run.status === "completed").length > eligible.length,
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
  };
}
