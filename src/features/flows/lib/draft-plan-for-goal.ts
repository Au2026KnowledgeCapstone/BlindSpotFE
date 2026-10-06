import type { FlowFormValues } from "../api/flow-form.schema";

type DraftStep = FlowFormValues["steps"][number];

/**
 * Mocked "Generate plan": turns a natural-language goal into draft steps.
 * Pure so it can be tested without the form or a backend.
 */
export function draftPlanForGoal(goal: string): DraftStep[] {
  const subject = goal.trim() || "the target flow";
  return [
    {
      id: "draft-1",
      title: `Open the entry point for ${subject}`,
      expectedOutcome: "The starting page renders without errors",
      order: 1,
      type: "action",
    },
    {
      id: "draft-2",
      title: `Perform the main interaction described by: ${subject}`,
      expectedOutcome: "The app advances to the next state",
      order: 2,
      type: "action",
    },
    {
      id: "draft-3",
      title: "Verify the end state",
      expectedOutcome: "The success condition for the goal is visible",
      order: 3,
      type: "check",
    },
  ];
}
