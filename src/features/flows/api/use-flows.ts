import { useQuery } from "@tanstack/react-query";
import { WorkspaceApiError } from "@/features/workspace/workspace-api";
import type { Flow } from "../types";

export const flowsQueryKey = (projectId: string) => ["flows", projectId] as const;

export function useFlows(projectId: string) {
  return useQuery<Flow[]>({
    queryKey: flowsQueryKey(projectId),
    queryFn: async () => { throw new WorkspaceApiError(501, "flows_unavailable", "Flows are unavailable until the project flow API is integrated."); },
    retry: false,
  });
}
