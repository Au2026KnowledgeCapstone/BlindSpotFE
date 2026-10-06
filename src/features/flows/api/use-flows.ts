import { useQuery } from "@tanstack/react-query";
import { fixtureSeedFlows } from "@/test/fixtures";
import { flowSchema } from "./flow.schema";
import { mapFlow } from "./map-flow";
import type { Flow } from "../types";

export const flowsQueryKey = (projectId: string) => ["flows", projectId] as const;

export function useFlows(projectId: string) {
  return useQuery<Flow[]>({
    queryKey: flowsQueryKey(projectId),
    queryFn: async () => fixtureSeedFlows.map((f) => mapFlow(flowSchema.parse(f))),
  });
}
