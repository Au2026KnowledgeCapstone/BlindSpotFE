import { useQuery } from "@tanstack/react-query";
import { WorkspaceApiError } from "@/features/workspace/workspace-api";
import type { Run } from "../types";

export function useRuns(projectId: string) {
  const query = useQuery<Run[]>({
    queryKey: ["runs", projectId],
    queryFn: async () => {
      throw new WorkspaceApiError(501, "execution_unavailable", "Run history is unavailable until the project execution API is integrated.");
    },
    retry: false,
  });
  return query;
}
