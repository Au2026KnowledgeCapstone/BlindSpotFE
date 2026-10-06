import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fixtureSeedHeals } from "@/test/fixtures";
import type { Run } from "@/features/runs";
import { healSchema } from "./heal.schema";
import { mapHeal, type Heal } from "./map-heal";
import { deriveRunStatusFromHeal } from "../lib/derive-run-status-from-heal";

export type HealDecision = "accepted" | "rejected";

export const healsQueryKey = (projectId: string) => ["heals", projectId] as const;

export function useHeals(projectId: string) {
  return useQuery<Heal[]>({
    queryKey: healsQueryKey(projectId),
    queryFn: async () => fixtureSeedHeals.map((h) => mapHeal(healSchema.parse(h))),
  });
}

/**
 * Accept/Reject writes to the heals cache AND the shared runs cache, so the
 * source run's status changes on the overview and the runs list too (§P7).
 */
export function useDecideHeal(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { healId: string; decision: HealDecision }) => vars,
    onSuccess: ({ healId, decision }) => {
      const heals = queryClient.getQueryData<Heal[]>(healsQueryKey(projectId)) ?? [];
      const decided = heals.find((h) => h.id === healId);

      queryClient.setQueryData<Heal[]>(healsQueryKey(projectId), (prev) =>
        (prev ?? []).map((h) => (h.id === healId ? { ...h, decision } : h)),
      );

      if (!decided) return;
      queryClient.setQueryData<Run[]>(["runs", projectId], (prev) =>
        (prev ?? []).map((run) =>
          run.id === decided.runId ? { ...run, status: deriveRunStatusFromHeal(decision) } : run,
        ),
      );
    },
  });
}
