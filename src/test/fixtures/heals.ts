import type { HealSnakeCase } from "@/features/heals";

export function makeHeal(overrides?: Partial<HealSnakeCase>): HealSnakeCase {
  return {
    id: "heal-4819-3",
    run_id: "run-4819",
    step_number: 3,
    old_target: 'button[data-test="place-order"]',
    new_target: 'button:has-text("Place Order")',
    before_screenshot_url: "/fixtures/heal-4819-3-before.png",
    after_screenshot_url: "/fixtures/heal-4819-3-after.png",
    decision: "pending",
    healed_at: "2026-09-15T09:39:00Z",
    ...overrides,
  };
}

export const fixtureSeedHeals: HealSnakeCase[] = [
  makeHeal(),
  makeHeal({
    id: "heal-4820-2",
    run_id: "run-4820",
    step_number: 2,
    old_target: "#checkout-submit",
    new_target: 'form#checkout button[type="submit"]',
    before_screenshot_url: "/fixtures/heal-4820-2-before.png",
    after_screenshot_url: "/fixtures/heal-4820-2-after.png",
    healed_at: "2026-09-15T08:12:00Z",
  }),
];
