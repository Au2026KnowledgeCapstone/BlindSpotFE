import type { LiveEventSnakeCase } from "./live-event.schema";

export interface LiveEvent {
  eventType:
    | "run.started"
    | "step.started"
    | "action.executed"
    | "screenshot.created"
    | "step.passed"
    | "step.failed"
    | "analysis.started"
    | "analysis.finished"
    | "run.completed";
  runId: string;
  emittedAt: string;
  offsetMs: number;
  stepNumber?: number | undefined;
  stepTitle?: string | undefined;
  actionId?: string | undefined;
  actionDescription?: string | undefined;
  artifactUrl?: string | undefined;
  runStatus?:
    | "running"
    | "passed"
    | "passed_healed"
    | "failed"
    | "regression"
    | "agent_error"
    | "cancelled"
    | undefined;
}

export function mapLiveEvent(data: LiveEventSnakeCase): LiveEvent {
  return {
    eventType: data.event_type,
    runId: data.run_id,
    emittedAt: data.emitted_at,
    offsetMs: data.offset_ms,
    ...(data.step_number !== undefined && { stepNumber: data.step_number }),
    ...(data.step_title !== undefined && { stepTitle: data.step_title }),
    ...(data.action_id !== undefined && { actionId: data.action_id }),
    ...(data.action_description !== undefined && { actionDescription: data.action_description }),
    ...(data.artifact_url !== undefined && { artifactUrl: data.artifact_url }),
    ...(data.run_status !== undefined && { runStatus: data.run_status }),
  };
}
