import { useQuery } from "@tanstack/react-query";
import { runSchema } from "./run.schema";
import { mapRun } from "./map-run";
import { fixtureSeedRuns } from "@/test/fixtures";
import type { Run } from "../types";

export function useRuns(projectId: string) {
  return useQuery<Run[]>({
    queryKey: ["runs", projectId],
    queryFn: async () => {
      // Validates fixtures through snake_case Zod schema then maps to domain type
      const parsed = fixtureSeedRuns.map((r) => runSchema.parse(r));
      return parsed.map(mapRun);
    },
  });
}
