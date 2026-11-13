import type { WorkspaceApiTypes } from "@/features/workspace";
import type { CriterionAssessment, Evidence, Result, ResultAction } from "../types";

function mapCriterionAssessment(data: WorkspaceApiTypes["CriterionAssessment"]): CriterionAssessment {
  return {
    criterionId: data.criterion_id,
    criterionText: data.criterion_text,
    verdict: data.verdict,
    rationale: data.rationale,
    source: data.source,
    citedEvidenceIds: data.cited_evidence_ids,
  };
}

function mapEvidence(data: WorkspaceApiTypes["Evidence"]): Evidence {
  return {
    id: data.id,
    type: data.type,
    ...(data.media_type != null && { mediaType: data.media_type }),
    ...(data.observation_id != null && { observationId: data.observation_id }),
    ...(data.sha256 != null && { sha256: data.sha256 }),
    ...(data.captured_at != null && { capturedAt: data.captured_at }),
  };
}

function mapAction(data: WorkspaceApiTypes["ResultAction"]): ResultAction {
  return {
    index: data.index,
    kind: data.kind,
    description: data.description,
    outcome: data.outcome,
    ...(data.evidence_id != null && { evidenceId: data.evidence_id }),
  };
}

export function mapResult(data: WorkspaceApiTypes["Result"]): Result {
  return {
    id: data.id,
    runId: data.run_id,
    requirementId: data.requirement_id,
    requirementTitle: data.requirement_title,
    verdict: data.verdict,
    classification: data.classification,
    observedBehavior: data.observed_behavior,
    criterionAssessments: data.criterion_assessments.map(mapCriterionAssessment),
    actions: data.actions.map(mapAction),
    evidence: data.evidence.map(mapEvidence),
    ...(data.duration_ms != null && { durationMs: data.duration_ms }),
  };
}
