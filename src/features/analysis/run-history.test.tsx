import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RunHistory } from "./run-history";
import { RunTelemetry } from "./run-telemetry";
import { RUN_OUTCOME_LIMIT } from "./use-run-outcomes";
import { workspaceApi } from "@/features/workspace/workspace-api";
import type { Run } from "./types";

const ids = { project: "11111111-1111-4111-8111-111111111111", environment: "22222222-2222-4222-8222-222222222222" };
vi.mock("@/features/workspace/workspace-api", () => ({ workspaceApi: { listResults: vi.fn() } }));
const listResults = () => vi.mocked(workspaceApi.listResults);

// Enough runs that an unbounded fan-out would be obvious in the call count.
const RUN_COUNT = 200;
const runs: Run[] = Array.from({ length: RUN_COUNT }, (_, index) => ({
  id: `run-${String(index).padStart(3, "0")}`,
  runNumber: RUN_COUNT - index,
  projectId: ids.project,
  environmentId: ids.environment,
  status: "completed",
  cancelRequested: false,
  requirementSnapshots: [{ id: `req-${index}`, title: `Checkout step ${index}`, description: "", criteria: [] }],
  requestedBy: "user-a",
  queuedAt: new Date(Date.UTC(2026, 0, 1) - index * 86400000).toISOString(),
  actionCount: 1,
}));

const passing = [{ id: "res-1", runId: "run-000", requirementId: "req-0", requirementTitle: "Checkout", verdict: "pass", classification: "criteria_satisfied", observed_behavior: "", criterion_assessments: [], actions: [], evidence: [] }];

function renderWith(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => { listResults().mockReset().mockResolvedValue(passing as never); });
afterEach(() => { vi.clearAllMocks(); });

describe("run outcome request budget", () => {
  it("reads only the visible page of runs, not every run in the project", async () => {
    renderWith(<RunHistory runs={runs} />);
    await waitFor(() => expect(listResults()).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(`${RUN_COUNT} matching runs`)).toBeVisible());
    // One page of rows, regardless of how many runs exist.
    expect(listResults().mock.calls.length).toBeLessThanOrEqual(10);
    expect(listResults()).toHaveBeenCalledWith(ids.project, ids.environment, "run-000");
    expect(listResults()).not.toHaveBeenCalledWith(ids.project, ids.environment, "run-050");
  });

  it("reads the next page's runs only once that page is opened", async () => {
    renderWith(<RunHistory runs={runs} />);
    await waitFor(() => expect(listResults()).toHaveBeenCalled());
    const firstPage = listResults().mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(listResults()).toHaveBeenCalledWith(ids.project, ids.environment, "run-010"));
    expect(listResults().mock.calls.length).toBeLessThanOrEqual(firstPage + 10);
  });

  it("bounds an outcome filter to a disclosed window instead of every run", async () => {
    renderWith(<RunHistory runs={runs} />);
    await waitFor(() => expect(listResults()).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText("Test outcome"), { target: { value: "PASS" } });
    await waitFor(() => expect(screen.getByText(new RegExp(`Outcome filters cover the ${RUN_OUTCOME_LIMIT} most recent runs`))).toBeVisible());
    expect(listResults().mock.calls.length).toBeLessThanOrEqual(RUN_OUTCOME_LIMIT);
  });

  it("caps the summary donut and says which runs it covers", async () => {
    renderWith(<RunTelemetry runs={runs} />);
    await waitFor(() => expect(screen.getByText(`The ${RUN_OUTCOME_LIMIT} most recent completed runs.`)).toBeVisible());
    expect(listResults().mock.calls.length).toBeLessThanOrEqual(RUN_OUTCOME_LIMIT);
  });

  it("reports covering everything when a project has fewer runs than the window", async () => {
    renderWith(<RunTelemetry runs={runs.slice(0, 3)} />);
    await waitFor(() => expect(screen.getByText("All completed runs.")).toBeVisible());
    expect(listResults().mock.calls.length).toBe(3);
  });

  it("never reads results for a run that has not completed", async () => {
    const queued = runs.slice(0, 4).map((run, index) => (index % 2 ? { ...run, status: "queued" as const } : run));
    renderWith(<RunHistory runs={queued} />);
    await waitFor(() => expect(listResults()).toHaveBeenCalled());
    expect(listResults().mock.calls.map(([, , runId]) => runId)).toEqual(["run-000", "run-002"]);
  });
});
