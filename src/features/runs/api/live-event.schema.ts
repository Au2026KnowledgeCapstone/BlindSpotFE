import { z } from "zod";

export const liveEventSchema = z.object({
  event_type: z.enum([
    "run.started",
    "step.started",
    "action.executed",
    "screenshot.created",
    "step.passed",
    "step.failed",
    "analysis.started",
    "analysis.finished",
    "run.completed",
  ]),
  run_id: z.string(),
  emitted_at: z.string(),
  offset_ms: z.number(),
  step_number: z.number().optional(),
  step_title: z.string().optional(),
  action_id: z.string().optional(),
  action_description: z.string().optional(),
  artifact_url: z.string().optional(),
  run_status: z
    .enum(["running", "passed", "passed_healed", "failed", "regression", "agent_error", "cancelled"])
    .optional(),
});

export type LiveEventSnakeCase = z.infer<typeof liveEventSchema>;
