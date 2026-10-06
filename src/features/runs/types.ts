export interface Artifact {
  id: string;
  runId: string;
  stepRunId?: string | undefined;
  type: "screenshot" | "trace" | "console_log" | "network_log" | "video";
  url: string;
  mimeType?: string | undefined;
  createdAt: string;
  metadata?: Record<string, unknown> | undefined;
}

export interface Action {
  id: string;
  stepRunId: string;
  timestamp: string;
  badgeType:
    | "NAVIGATE"
    | "FILL"
    | "CLICK"
    | "WAIT"
    | "OBSERVE"
    | "NETWORK"
    | "RECOVERY"
    | "HEAL"
    | "FAIL_STEP"
    | "COMPLETE_STEP";
  description: string;
  target?: string | undefined;
  reasoning?: string | undefined;
  resultText?: string | undefined;
  resultStatus?: "ok" | "bad" | undefined;
}

export interface TestStepRun {
  id: string;
  runId: string;
  stepNumber: number;
  title: string;
  status: "passed" | "failed" | "healed" | "running";
  durationMs: number;
  actions: Action[];
}

export interface Failure {
  id: string;
  runId: string;
  stepNumber: number;
  expected: string;
  observed: string;
  category: "application_defect" | "agent_error";
  likelyCause: string;
  suggestedNextSteps: string[];
  linkedEvidence: string[];
}

export interface Run {
  id: string;
  runNumber: number;
  projectId: string;
  flowId: string;
  flowName: string;
  environment: "production" | "staging" | "pr_preview" | "development";
  status:
    | "passed"
    | "passed_healed"
    | "failed"
    | "regression"
    | "agent_error"
    | "running"
    | "queued"
    | "cancelled";
  branch: string;
  commitSha: string;
  trigger: string;
  startedAt: string;
  durationSeconds: number;
  actionCount: number;
  estimatedCostUsd: number;
  executionMode: "replay" | "agentic";
  failureId?: string | undefined;
  prNumber?: number | undefined;
}
