import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RunHistory } from "./run-history";
import { RunTelemetry } from "./run-telemetry";
import { RUN_OUTCOME_LIMIT } from "./use-run-outcomes";
import { workspaceApi, WorkspaceApiError } from "@/features/workspace/workspace-api";
import type { Run } from "./types";

const ids = { project: "11111111-1111-4111-8111-111111111111", environment: "22222222-2222-4222-8222-222222222222" };
vi.mock("@/features/workspace/workspace-api", async (original) => ({
  ...(await original<typeof import("@/features/workspace/workspace-api")>()),
  workspaceApi: { listResults: vi.fn(), projectDashboard: vi.fn() },
}));
const listResults = () => vi.mocked(workspaceApi.listResults);
const dashboard = () => vi.mocked(workspaceApi.projectDashboard);
const emptyRequirements = { total_requirements: 0, approved_requirements: 0, requirements_tested: 0, requirements_passed: 0, requirements_failed: 0, requirements_inconclusive: 0, requirements_untested: 0 };
// 5 + 4 + 3 = 12 runs, so the pass rate reads 41.7%.
const dashboardCounts = { requirements: emptyRequirements, runs: { total_runs: 12, runs_passed: 5, runs_failed: 4, runs_inconclusive: 3 } };

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

beforeEach(() => {
  listResults().mockReset().mockResolvedValue(passing as never);
  dashboard().mockReset().mockResolvedValue(dashboardCounts);
});
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

  it("counts the summary donut from one backend read instead of per-run results", async () => {
    renderWith(<RunTelemetry projectId={ids.project} />);
    await waitFor(() => expect(screen.getByText("41.7%")).toBeVisible());
    expect(dashboard()).toHaveBeenCalledTimes(1);
    expect(dashboard()).toHaveBeenCalledWith(ids.project, expect.anything());
    // The whole point: no results request, however many runs the project has.
    expect(listResults()).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "Run outcomes: 5 passed, 4 failed, 3 inconclusive" })).toBeVisible();
  });

  it("offers a retry rather than presenting a failed count as zero", async () => {
    dashboard().mockRejectedValue(new WorkspaceApiError(503, undefined, "Workspace service unavailable. Retry."));
    renderWith(<RunTelemetry projectId={ids.project} />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Workspace service unavailable. Retry."));
    expect(screen.queryByText("0%")).toBeNull();
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  });

  it("shows an empty project as no pass rate rather than zero percent", async () => {
    dashboard().mockResolvedValue({ requirements: emptyRequirements, runs: { total_runs: 0, runs_passed: 0, runs_failed: 0, runs_inconclusive: 0 } });
    renderWith(<RunTelemetry projectId={ids.project} />);
    await waitFor(() => expect(screen.getByText("—")).toBeVisible());
  });

  it("shows an unfinished run as queued or running, never as a verdict", async () => {
    const started = [{ ...runs[0]!, status: "queued" as const }, { ...runs[1]!, status: "running" as const }, runs[2]!];
    renderWith(<RunHistory runs={started} />);
    await waitFor(() => expect(screen.getAllByLabelText("QUEUED").length).toBeGreaterThan(0));
    expect(screen.getAllByLabelText("RUNNING").length).toBeGreaterThan(0);
    // The old behaviour: a run started seconds ago read as a finished, judged run.
    expect(screen.queryAllByLabelText("INCONCLUSIVE")).toHaveLength(0);
  });

  it("says runs are in progress so starting a check is visibly acknowledged", async () => {
    const started = [{ ...runs[0]!, status: "queued" as const }, { ...runs[1]!, status: "running" as const }, runs[2]!];
    const { rerender } = renderWith(<RunHistory runs={started} />);
    await waitFor(() => expect(screen.getByText(/2 runs are in progress/)).toBeVisible());
    rerender(<QueryClientProvider client={new QueryClient()}><RunHistory runs={[runs[2]!]} /></QueryClientProvider>);
    await waitFor(() => expect(screen.queryByText(/in progress/)).toBeNull());
  });

  it("filters to in-progress runs across every run, reading no results to do it", async () => {
    const mixed = runs.map((run, index) => (index === 3 ? { ...run, status: "queued" as const } : index === 120 ? { ...run, status: "running" as const } : run));
    renderWith(<RunHistory runs={mixed} />);
    await waitFor(() => expect(listResults()).toHaveBeenCalled());
    listResults().mockClear();
    fireEvent.change(screen.getByLabelText("Test outcome"), { target: { value: "IN_PROGRESS" } });
    await waitFor(() => expect(screen.getByText("2 matching runs")).toBeVisible());
    // Execution state comes off the run, so this needs no per-run request —
    // which also lets it search past the 50-run verdict window (run 120).
    expect(listResults()).not.toHaveBeenCalled();
    expect(screen.queryByText(new RegExp(`Outcome filters cover the ${RUN_OUTCOME_LIMIT} most recent runs`))).toBeNull();
    expect(screen.getAllByLabelText("QUEUED")).toHaveLength(2);
    expect(screen.getAllByLabelText("RUNNING")).toHaveLength(2);
  });

  it("still windows a verdict filter, which genuinely needs results", async () => {
    renderWith(<RunHistory runs={runs} />);
    await waitFor(() => expect(listResults()).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText("Test outcome"), { target: { value: "PASS" } });
    await waitFor(() => expect(screen.getByText(new RegExp(`Outcome filters cover the ${RUN_OUTCOME_LIMIT} most recent runs`))).toBeVisible());
    expect(listResults().mock.calls.length).toBeLessThanOrEqual(RUN_OUTCOME_LIMIT);
  });

  it("distinguishes a cancelled run and an errored run from an ambiguous verdict", async () => {
    const ended = [{ ...runs[0]!, status: "cancelled" as const }, { ...runs[1]!, status: "failed" as const }];
    renderWith(<RunHistory runs={ended} />);
    await waitFor(() => expect(screen.getAllByLabelText("CANCELLED").length).toBeGreaterThan(0));
    expect(screen.getAllByLabelText("ERROR").length).toBeGreaterThan(0);
    expect(screen.queryAllByLabelText("INCONCLUSIVE")).toHaveLength(0);
  });

  it("never reads results for a run that has not completed", async () => {
    const queued = runs.slice(0, 4).map((run, index) => (index % 2 ? { ...run, status: "queued" as const } : run));
    renderWith(<RunHistory runs={queued} />);
    await waitFor(() => expect(listResults()).toHaveBeenCalled());
    expect(listResults().mock.calls.map(([, , runId]) => runId)).toEqual(["run-000", "run-002"]);
  });
});
