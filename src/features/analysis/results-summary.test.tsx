import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultsSummary } from "./results-summary";
import type { Result, Run } from "./types";

const run = (status: Run["status"], snapshots = 2): Run => ({
  id: "33333333-3333-4333-8333-333333333333",
  runNumber: 8,
  projectId: "11111111-1111-4111-8111-111111111111",
  environmentId: "22222222-2222-4222-8222-222222222222",
  status,
  cancelRequested: false,
  requirementSnapshots: Array.from({ length: snapshots }, (_, index) => ({ id: `req-${index}`, title: `Requirement ${index}`, description: "", criteria: [] })),
  requestedBy: "user-a",
  queuedAt: "2026-11-20T11:26:39Z",
  actionCount: 0,
});

const result = (verdict: Result["verdict"]): Result => ({
  id: `res-${verdict}`, runId: "33333333-3333-4333-8333-333333333333", requirementId: "req-0",
  requirementTitle: "Checkout", verdict, classification: "criteria_satisfied",
  observedBehavior: "observed", criterionAssessments: [], actions: [], evidence: [],
});

const heading = () => screen.getByRole("heading", { level: 2 });
const spinner = () => document.querySelector(".animate-spin");

describe("overall result while a run is still moving", () => {
  it("animates a running run instead of presenting a still heading", () => {
    render(<ResultsSummary run={run("running")} results={[result("pass")]} />);
    expect(heading()).toHaveTextContent("IN PROGRESS");
    expect(spinner()).not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Checking 2 requirements in a browser — 1 done so far");
  });

  it("explains a queued run is waiting rather than counting progress it has not made", () => {
    render(<ResultsSummary run={run("queued")} results={[]} />);
    expect(heading()).toHaveTextContent("IN PROGRESS");
    expect(spinner()).not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Queued and waiting for an analysis worker");
  });

  it("stops animating once the run reaches a verdict", () => {
    render(<ResultsSummary run={run("completed", 1)} results={[result("pass")]} />);
    expect(heading()).toHaveTextContent("PASS");
    expect(spinner()).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
