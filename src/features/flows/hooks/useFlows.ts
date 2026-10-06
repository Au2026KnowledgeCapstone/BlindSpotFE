import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Flow } from "./types";

const flowsFetcher = async (projectId: string): Promise<Flow[]> => {
  // TODO: replace with real API call
  return Promise.resolve([]);
};

export function useFlows(projectId: string) {
  return useQuery({
    queryKey: ["flows", projectId],
    queryFn: () => flowsFetcher(projectId),
    staleTime: 30000,
  });
}
