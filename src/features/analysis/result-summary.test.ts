import { describe, expect, it } from "vitest";
import { summarizeResults } from "./result-summary";
import { buildReport, reportUrl } from "./report";
import type { Result, Run, Verdict } from "./types";

const run: Run = { id: "run-a", runNumber: 12, projectId: "project-a", environmentId: "env-a", status: "completed", cancelRequested: false, requestedBy: "user-a", queuedAt: "2026-11-17T00:00:00Z", actionCount: 0, requirementSnapshots: ["a", "b", "c"].map((id) => ({ id, title: id, description: "", criteria: [] })) };
function results(...verdicts: Verdict[]): Result[] {
  return verdicts.map((verdict, index) => ({ id: `result-${index}`, runId: run.id, requirementId: String(index), requirementTitle: `Test ${index}`, verdict, classification: "criteria_satisfied", observedBehavior: "Observed", criterionAssessments: [], actions: [], evidence: [] }));
}

describe("honest overall testing results", () => {
  it("counts inconclusive attempts in the score denominator", () => {
    expect(summarizeResults(run, results("pass", "fail", "inconclusive"))).toMatchObject({ outcome: "FAIL", score: 33, executed: 3, passed: 1, failed: 1, inconclusive: 1, pending: 0 });
  });
  it("requires all expected tests to pass before declaring PASS", () => {
    expect(summarizeResults(run, results("pass", "pass", "pass")).outcome).toBe("PASS");
    expect(summarizeResults(run, results("pass")).outcome).toBe("INCOMPLETE");
    expect(summarizeResults(run, results("pass", "pass", "inconclusive")).outcome).toBe("INCONCLUSIVE");
  });
  it("does not present empty, running, errored or cancelled runs as passing", () => {
    expect(summarizeResults(run, [])).toMatchObject({ score: null, outcome: "INCOMPLETE", executed: 0 });
    expect(summarizeResults({ ...run, status: "running" }, results("pass")).outcome).toBe("IN PROGRESS");
    expect(summarizeResults({ ...run, status: "failed" }, results("pass")).outcome).toBe("ERROR");
    expect(summarizeResults({ ...run, status: "cancelled" }, []).outcome).toBe("CANCELLED");
  });
});

describe("portable report", () => {
  it("escapes user and backend text instead of rendering HTML or scripts", () => {
    const items = results("fail");
    items[0]!.requirementTitle = '<script>alert("x")</script>';
    items[0]!.observedBehavior = '<img src=x onerror="alert(1)">';
    const report = buildReport(run, items);
    expect(report).toContain("&lt;script&gt;");
    expect(report).not.toContain("<script>");
    expect(report).not.toContain("<img");
    expect(report).toContain("FAIL");
    expect(report).toContain("Without result");
  });
  it("retains project and environment context in the shared URL", () => {
    expect(reportUrl("https://app.example.com", run)).toBe("https://app.example.com/projects/project-a/runs/run-a?environmentId=env-a");
  });
});
