import { describe, expect, it } from "vitest";
import { draftPlanForGoal } from "./draft-plan-for-goal";

describe("draftPlanForGoal", () => {
  it("echoes the goal into the draft steps and ends with a check", () => {
    const steps = draftPlanForGoal("buy a pair of headphones");
    expect(steps).toHaveLength(3);
    expect(steps[0]?.title).toContain("buy a pair of headphones");
    expect(steps.at(-1)?.type).toBe("check");
  });

  it("is pure: same input gives the same output", () => {
    expect(draftPlanForGoal("x")).toEqual(draftPlanForGoal("x"));
  });

  it("falls back to a placeholder subject for an empty goal", () => {
    expect(draftPlanForGoal("  ")[0]?.title).toContain("the target flow");
  });
});
