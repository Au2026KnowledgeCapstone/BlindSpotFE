import { z } from "zod";

export const actionSchema = z.object({
  id: z.string(),
  step_run_id: z.string(),
  timestamp: z.string(),
  badge_type: z.enum([
    "NAVIGATE",
    "FILL",
    "CLICK",
    "WAIT",
    "OBSERVE",
    "NETWORK",
    "RECOVERY",
    "HEAL",
    "FAIL_STEP",
    "COMPLETE_STEP",
  ]),
  description: z.string(),
  target: z.string().optional(),
  reasoning: z.string().optional(),
  result_text: z.string().optional(),
  result_status: z.enum(["ok", "bad"]).optional(),
});
export type ActionSnakeCase = z.infer<typeof actionSchema>;

export const testStepRunSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  step_number: z.number(),
  title: z.string(),
  status: z.enum(["passed", "failed", "healed", "running"]),
  duration_ms: z.number(),
  actions: z.array(actionSchema),
});
export type TestStepRunSnakeCase = z.infer<typeof testStepRunSchema>;
