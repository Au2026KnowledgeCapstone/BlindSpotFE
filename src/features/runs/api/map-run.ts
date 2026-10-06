import type { RunSnakeCase } from "./run.schema";
import type { Run } from "../types";

export function mapRun(data: RunSnakeCase): Run {
  return {
    id: data.id,
    runNumber: data.run_number,
    projectId: data.project_id,
    flowId: data.flow_id,
    flowName: data.flow_name,
    environment: data.environment,
    status: data.status,
    branch: data.branch,
    commitSha: data.commit_sha,
    trigger: data.trigger,
    startedAt: data.started_at,
    durationSeconds: data.duration_seconds,
    actionCount: data.action_count,
    estimatedCostUsd: data.estimated_cost_usd,
    executionMode: data.execution_mode,
    ...(data.failure_id !== undefined && { failureId: data.failure_id }),
    ...(data.pr_number !== undefined && { prNumber: data.pr_number }),
  };
}
