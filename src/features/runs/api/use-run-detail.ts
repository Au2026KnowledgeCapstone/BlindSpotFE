import { useQuery } from "@tanstack/react-query";
import { WorkspaceApiError } from "@/features/workspace/workspace-api";
import type { Run, TestStepRun, Failure } from "../types";

export interface RunDetailData {
  run: Run;
  steps: TestStepRun[];
  failure?: Failure | undefined;
}

export function useRunDetail(runId: string) {
  const query = useQuery<RunDetailData>({
    queryKey: ["run", runId],
    queryFn: async () => {
      throw new WorkspaceApiError(501, "execution_unavailable", "Run details are unavailable until the project execution API is integrated.");
    },
    retry: false,
  });
  return query;
}
