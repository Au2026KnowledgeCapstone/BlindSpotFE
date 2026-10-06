import { z } from "zod";
import { flowSettingsSchema, flowStepSchema } from "./flow.schema";

export const flowCreateSchema = z.object({
  name: z.string().min(2, "Flow name required"),
  goal: z.string().min(5, "Describe the goal in a sentence"),
  settings: flowSettingsSchema,
  steps: z.array(flowStepSchema),
});

export type FlowFormValues = z.infer<typeof flowCreateSchema>;
