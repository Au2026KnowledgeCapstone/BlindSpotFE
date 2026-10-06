import type { ActionSnakeCase, TestStepRunSnakeCase } from "./test-step.schema";
import type { Action, TestStepRun } from "../types";

export function mapAction(data: ActionSnakeCase): Action {
  return {
    id: data.id,
    stepRunId: data.step_run_id,
    timestamp: data.timestamp,
    badgeType: data.badge_type,
    description: data.description,
    ...(data.target !== undefined && { target: data.target }),
    ...(data.reasoning !== undefined && { reasoning: data.reasoning }),
    ...(data.result_text !== undefined && { resultText: data.result_text }),
    ...(data.result_status !== undefined && { resultStatus: data.result_status }),
  };
}

export function mapTestStepRun(data: TestStepRunSnakeCase): TestStepRun {
  return {
    id: data.id,
    runId: data.run_id,
    stepNumber: data.step_number,
    title: data.title,
    status: data.status,
    durationMs: data.duration_ms,
    actions: data.actions.map(mapAction),
  };
}
