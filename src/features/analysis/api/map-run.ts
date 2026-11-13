import type { WorkspaceApiTypes } from "@/features/workspace";
import type { Run } from "../types";

export function mapRun(data: WorkspaceApiTypes["Run"]): Run {
  return {
    id: data.id,
    runNumber: data.run_number,
    projectId: data.project_id,
    environmentId: data.environment_id,
    status: data.status,
    cancelRequested: data.cancel_requested,
    ...(data.engine != null && { engine: data.engine }),
    requirementSnapshots: data.requirement_snapshots.map((snapshot) => ({
      id: snapshot.id,
      title: snapshot.title,
      description: snapshot.description,
      criteria: snapshot.criteria,
    })),
    requestedBy: data.requested_by,
    queuedAt: data.queued_at,
    ...(data.started_at != null && { startedAt: data.started_at }),
    ...(data.completed_at != null && { completedAt: data.completed_at }),
    actionCount: data.action_count,
    ...(data.estimated_cost_usd != null && { estimatedCostUsd: data.estimated_cost_usd }),
    ...(data.error != null && { error: data.error }),
  };
}
