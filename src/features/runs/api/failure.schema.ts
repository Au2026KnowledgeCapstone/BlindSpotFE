import { z } from "zod";

export const failureSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  step_number: z.number(),
  expected: z.string(),
  observed: z.string(),
  category: z.enum(["application_defect", "agent_error"]),
  likely_cause: z.string(),
  suggested_next_steps: z.array(z.string()),
  linked_evidence: z.array(z.string()),
});

export type FailureSnakeCase = z.infer<typeof failureSchema>;
