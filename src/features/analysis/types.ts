export type RunExecutionStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type Engine = "mvp" | "graph" | "stub";
export type Verdict = "pass" | "fail" | "inconclusive";
export type Classification = "criteria_satisfied" | "criteria_violated" | "locator_failure" | "environment_failure" | "execution_error";
export type EvidenceSource = "ai" | "objective" | "engine";
export type EvidenceType = "screenshot" | "page_text" | "log";
export type ActionOutcome = "completed" | "stopped";

export interface RequirementSnapshot {
  id: string;
  title: string;
  description: string;
  criteria: Record<string, string>[];
}

export interface Run {
  id: string;
  runNumber: number;
  projectId: string;
  environmentId: string;
  status: RunExecutionStatus;
  cancelRequested: boolean;
  engine?: Engine | undefined;
  requirementSnapshots: RequirementSnapshot[];
  requestedBy: string;
  queuedAt: string;
  startedAt?: string | undefined;
  completedAt?: string | undefined;
  actionCount: number;
  estimatedCostUsd?: number | undefined;
  error?: string | undefined;
}

export interface CriterionAssessment {
  criterionId: string;
  criterionText: string;
  verdict: Verdict;
  rationale: string;
  source: EvidenceSource;
  citedEvidenceIds: string[];
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  mediaType?: string | undefined;
  observationId?: string | undefined;
  sha256?: string | undefined;
  capturedAt?: string | undefined;
}

export interface ResultAction {
  index: number;
  kind: string;
  description: string;
  outcome: ActionOutcome;
  evidenceId?: string | undefined;
}

/** One requirement, one run. `observedBehavior` is plain-English fact; model reasoning lives in `criterionAssessments`. */
export interface Result {
  id: string;
  runId: string;
  requirementId: string;
  requirementTitle: string;
  verdict: Verdict;
  classification: Classification;
  observedBehavior: string;
  criterionAssessments: CriterionAssessment[];
  actions: ResultAction[];
  evidence: Evidence[];
  durationMs?: number | undefined;
}
