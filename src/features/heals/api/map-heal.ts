import type { HealSnakeCase } from "./heal.schema";

export interface Heal {
  id: string;
  runId: string;
  stepNumber: number;
  oldTarget: string;
  newTarget: string;
  beforeScreenshotUrl: string;
  afterScreenshotUrl: string;
  decision: "pending" | "accepted" | "rejected";
  healedAt: string;
}

export function mapHeal(data: HealSnakeCase): Heal {
  return {
    id: data.id,
    runId: data.run_id,
    stepNumber: data.step_number,
    oldTarget: data.old_target,
    newTarget: data.new_target,
    beforeScreenshotUrl: data.before_screenshot_url,
    afterScreenshotUrl: data.after_screenshot_url,
    decision: data.decision,
    healedAt: data.healed_at,
  };
}
