import { z } from "zod";

export const flowSettingsSchema = z.object({
  environment: z.enum(["development", "staging", "production", "pr_preview"]),
  schedule: z.enum(["now", "weekly", "on_pr", "manual"]),
  credentialsReference: z.string().optional(),
});

export const flowStepSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Step title required"),
  expectedOutcome: z.string().min(1, "Expected outcome required"),
  order: z.number(),
  type: z.enum(["action", "inference", "check"]),
});

export const flowCreateSchema = z.object({
  name: z.string().min(2, "Flow name required"),
  goal: z.string().min(5, "Natural language goal required"),
  settings: flowSettingsSchema,
  steps: z.array(flowStepSchema),
});

export type FlowFormValues = z.infer<typeof flowCreateSchema>;
