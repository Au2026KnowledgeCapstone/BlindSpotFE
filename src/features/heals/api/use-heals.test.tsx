import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { useDecideHeal, useHeals, type HealDecision } from "./use-heals";
import { mapRun, type RunDetailData } from "@/features/runs";
import type { Run } from "@/features/runs";
import { fixtureSeedRuns } from "@/test/fixtures";

/** Decides one heal, then reports both runs cache and run-detail cache status for run-4819. */
function Harness({ decision }: { decision: HealDecision }) {
  const { data: heals } = useHeals("acme-corp");
  const decide = useDecideHeal("acme-corp");
  const heal = heals?.find((h) => h.runId === "run-4819");

  return (
    <div>
      <button type="button" disabled={!heal} onClick={() => heal && decide.mutate({ healId: heal.id, decision })}>
        decide
      </button>
      {decide.isSuccess && <span data-testid="done">done</span>}
    </div>
  );
}

function renderWithSeededCaches(decision: HealDecision) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rawRun = fixtureSeedRuns.find((r) => r.id === "run-4819") ?? fixtureSeedRuns[0]!;
  const mappedRun = mapRun(rawRun);

  queryClient.setQueryData<Run[]>(["runs", "acme-corp"], [mappedRun]);
  queryClient.setQueryData<RunDetailData>(["run", "run-4819"], {
    run: mappedRun,
    steps: [],
  });

  render(
    <QueryClientProvider client={queryClient}>
      <Harness decision={decision} />
    </QueryClientProvider>,
  );
  return queryClient;
}

const statusOfRunsList = (queryClient: QueryClient) =>
  queryClient.getQueryData<Run[]>(["runs", "acme-corp"])?.find((r) => r.id === "run-4819")?.status;

const statusOfRunDetail = (queryClient: QueryClient) =>
  queryClient.getQueryData<RunDetailData>(["run", "run-4819"])?.run.status;

describe("useDecideHeal", () => {
  it("rejecting a heal turns the source run into a failure in both runs list and run detail caches", async () => {
    const queryClient = renderWithSeededCaches("rejected");
    await waitFor(() => expect(screen.getByRole("button", { name: "decide" })).toBeEnabled());

    screen.getByRole("button", { name: "decide" }).click();

    await screen.findByTestId("done");
    expect(statusOfRunsList(queryClient)).toBe("failed");
    expect(statusOfRunDetail(queryClient)).toBe("failed");
  });

  it("accepting a heal records passed_healed across both runs list and run detail caches", async () => {
    const queryClient = renderWithSeededCaches("accepted");
    await waitFor(() => expect(screen.getByRole("button", { name: "decide" })).toBeEnabled());

    screen.getByRole("button", { name: "decide" }).click();

    await screen.findByTestId("done");
    expect(statusOfRunsList(queryClient)).toBe("passed_healed");
    expect(statusOfRunDetail(queryClient)).toBe("passed_healed");
  });
});
