import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { RunDetailContent } from "./run-detail-content";

const mocks = vi.hoisted(() => ({ useRunDetail: vi.fn(), useRunEvents: vi.fn(), cancelRun: vi.fn(), refetch: vi.fn() }));
vi.mock("@/features/analysis", () => ({ useRunDetail: mocks.useRunDetail }));
vi.mock("@/features/analysis/api/use-run-events", () => ({ useRunEvents: mocks.useRunEvents }));
vi.mock("@/features/workspace", () => ({ workspaceApi: { cancelRun: mocks.cancelRun } }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

const run = {
  id: "run-a", runNumber: 1, projectId: "project-a", environmentId: "env-a", status: "running",
  cancelRequested: false, requirementSnapshots: [], requestedBy: "user-a", queuedAt: "2026-01-01T00:00:00Z", actionCount: 0,
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.refetch.mockResolvedValue({ data: run });
  mocks.useRunEvents.mockReturnValue("live");
  mocks.useRunDetail.mockReturnValue({ run: { data: { ...run }, isPending: false, isError: false, refetch: mocks.refetch }, results: { data: [], isPending: false, isError: false } });
});

it("shows a pending cancellation without claiming the worker already stopped", async () => {
  mocks.cancelRun.mockResolvedValue({ status: "cancellation_requested" });
  render(<RunDetailContent projectId="project-a" environmentId="env-a" runId="run-a" />);
  fireEvent.click(screen.getByRole("button", { name: "Cancel run" }));
  expect(await screen.findByText("Cancellation requested. Waiting for the worker to stop.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Cancel run" })).not.toBeInTheDocument();
  await waitFor(() => expect(mocks.refetch).toHaveBeenCalledOnce());
});

it("does not offer a second cancellation for a request already recorded by BE", () => {
  mocks.useRunDetail.mockReturnValue({ run: { data: { ...run, cancelRequested: true }, isPending: false, isError: false, refetch: mocks.refetch }, results: { data: [], isPending: false, isError: false } });
  render(<RunDetailContent projectId="project-a" environmentId="env-a" runId="run-a" />);
  expect(screen.getByText("Cancellation requested. Waiting for the worker to stop.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Cancel run" })).not.toBeInTheDocument();
});
