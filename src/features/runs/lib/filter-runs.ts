import type { Run } from "../types";

export type RunFilters = {
  environment: string | null;
  trigger: string | null;
  status: string | null;
};

/** Pure: narrows a run list by the filters held in the URL. */
export function filterRuns(runs: Run[], filters: RunFilters): Run[] {
  return runs.filter(
    (run) =>
      (filters.environment === null || run.environment === filters.environment) &&
      (filters.trigger === null || run.trigger === filters.trigger) &&
      (filters.status === null || run.status === filters.status),
  );
}
