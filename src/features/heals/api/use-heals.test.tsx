import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { useDecideHeal, useHeals, type HealDecision } from "./use-heals";
import { mapRun } from "@/features/runs";
import type { Run } from "@/features/runs";
import { fixtureSeedRuns } from "@/test/fixtures";

/** Decides one heal, then reports the shared runs-cache status for its source run. */
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

function renderWithSeededRuns(decision: HealDecision) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // The overview and runs list both read this key, so it stands in for "everywhere".
  queryClient.setQueryData<Run[]>(["runs", "acme-corp"], fixtureSeedRuns.map(mapRun));

  render(
    <QueryClientProvider client={queryClient}>
      <Harness decision={decision} />
    </QueryClientProvider>,
  );
  return queryClient;
}

const statusOfRun4819 = (queryClient: QueryClient) =>
  queryClient.getQueryData<Run[]>(["runs", "acme-corp"])?.find((r) => r.id === "run-4819")?.status;

describe("useDecideHeal", () => {
  it("rejecting a heal turns the source run into a failure in the shared runs cache", async () => {
    const queryClient = renderWithSeededRuns("rejected");
    await waitFor(() => expect(screen.getByRole("button", { name: "decide" })).toBeEnabled());

    screen.getByRole("button", { name: "decide" }).click();

    await screen.findByTestId("done");
    expect(statusOfRun4819(queryClient)).toBe("failed");
  });

  it("accepting a heal records passed_healed, never a plain pass", async () => {
    const queryClient = renderWithSeededRuns("accepted");
    await waitFor(() => expect(screen.getByRole("button", { name: "decide" })).toBeEnabled());

    screen.getByRole("button", { name: "decide" }).click();

    await screen.findByTestId("done");
    expect(statusOfRun4819(queryClient)).toBe("passed_healed");
  });
});
