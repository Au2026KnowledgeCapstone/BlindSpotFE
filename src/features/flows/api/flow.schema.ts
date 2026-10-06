import { z } from "zod";

export const flowStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  expectedOutcome: z.string(),
  order: z.number(),
  type: z.enum(["action", "inference", "check"]),
});

export const flowSettingsSchema = z.object({
  environment: z.enum(["development", "staging", "production", "pr_preview"]),
  schedule: z.enum(["now", "weekly", "on_pr", "manual"]),
  credentialsReference: z.string().optional(),
});

export const runBarSchema = z.object({
  id: z.string(),
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
  label: z.string().optional(),
});

export const flowSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  name: z.string(),
  description: z.string(),
  goal: z.string(),
  status: z.enum(["draft", "active", "archived"]),
  feature_area: z.string(),
  steps: z.array(flowStepSchema),
  settings: flowSettingsSchema,
  history: z.array(runBarSchema),
  last_status: z.string(),
  last_run_at: z.string(),
});

export type FlowSnakeCase = z.infer<typeof flowSchema>;
