import { z } from "zod";

export const runSchema = z.object({
  id: z.string(),
  run_number: z.number(),
  project_id: z.string(),
  flow_id: z.string(),
  flow_name: z.string(),
  environment: z.enum(["production", "staging", "pr_preview", "development"]),
  status: z.enum([
    "passed",
    "passed_healed",
    "failed",
    "regression",
    "agent_error",
    "running",
    "queued",
    "cancelled",
  ]),
  branch: z.string(),
  commit_sha: z.string(),
  trigger: z.string(),
  started_at: z.string(),
  duration_seconds: z.number(),
  action_count: z.number(),
  estimated_cost_usd: z.number(),
  execution_mode: z.enum(["replay", "agentic"]),
  failure_id: z.string().optional(),
  pr_number: z.number().optional(),
});

export type RunSnakeCase = z.infer<typeof runSchema>;
