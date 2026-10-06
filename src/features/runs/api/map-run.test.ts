import { describe, it, expect } from "vitest";
import { mapRun, mapTestStepRun, mapFailure, mapArtifact } from "@/features/runs";
import type { ArtifactSnakeCase, TestStepRunSnakeCase, FailureSnakeCase, RunSnakeCase } from "@/features/runs";
import { makeRun, fixtureCheckoutSteps, fixtureFailure } from "@/test/fixtures";

describe("api mappers", () => {
  it("maps run from snake_case to camelCase", () => {
    const raw: RunSnakeCase = makeRun();
    const mapped = mapRun(raw);
    expect(mapped.id).toBe(raw.id);
    expect(mapped.runNumber).toBe(raw.run_number);
    expect(mapped.projectId).toBe(raw.project_id);
    expect(mapped.flowId).toBe(raw.flow_id);
    expect(mapped.environment).toBe(raw.environment);
    expect(mapped.status).toBe(raw.status);
    expect(mapped.branch).toBe(raw.branch);
    expect(mapped.commitSha).toBe(raw.commit_sha);
    expect(mapped.durationSeconds).toBe(raw.duration_seconds);
  });

  it("maps test step run from snake_case to camelCase", () => {
    const raw: TestStepRunSnakeCase = fixtureCheckoutSteps[4]!;
    const mapped = mapTestStepRun(raw);
    expect(mapped.id).toBe(raw.id);
    expect(mapped.runId).toBe(raw.run_id);
    expect(mapped.stepNumber).toBe(raw.step_number);
    expect(mapped.title).toBe(raw.title);
  });

  it("maps failure from snake_case to camelCase", () => {
    const raw: FailureSnakeCase = fixtureFailure;
    const mapped = mapFailure(raw);
    expect(mapped.id).toBe(raw.id);
    expect(mapped.expected).toBe(raw.expected);
    expect(mapped.observed).toBe(raw.observed);
  });

  it("maps artifact from snake_case to camelCase", () => {
    const raw: ArtifactSnakeCase = {
      id: "art-1", run_id: "run-4821", step_run_id: "step-5",
      type: "screenshot", url: "/artifacts/step-5.png", created_at: "2026-09-15T09:41:18Z",
    };
    const mapped = mapArtifact(raw);
    expect(mapped.id).toBe(raw.id);
    expect(mapped.runId).toBe(raw.run_id);
  });
});
