import type { FailureSnakeCase } from "./failure.schema";
import type { Failure } from "../types";

export function mapFailure(data: FailureSnakeCase): Failure {
  return {
    id: data.id,
    runId: data.run_id,
    stepNumber: data.step_number,
    expected: data.expected,
    observed: data.observed,
    category: data.category,
    likelyCause: data.likely_cause,
    suggestedNextSteps: data.suggested_next_steps,
    linkedEvidence: data.linked_evidence,
  };
}
