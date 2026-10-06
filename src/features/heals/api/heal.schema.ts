import { z } from "zod";

export const healSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  step_number: z.number(),
  old_target: z.string(),
  new_target: z.string(),
  before_screenshot_url: z.string(),
  after_screenshot_url: z.string(),
  decision: z.enum(["pending", "accepted", "rejected"]),
  healed_at: z.string(),
});

export type HealSnakeCase = z.infer<typeof healSchema>;
