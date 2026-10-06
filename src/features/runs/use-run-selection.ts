"use client";

import { useQueryState } from "nuqs";
import type { Action, TestStepRun } from "./types";

export interface RunSelection {
  currentStep: TestStepRun | undefined;
  currentAction: Action | undefined;
  tab: string;
  selectStep: (stepId: string) => void;
  selectAction: (step: TestStepRun, action: Action) => void;
  selectTab: (tab: string) => void;
}

/**
 * Owns the `?step=&action=&tab=` deep-link state for run detail.
 * Defaults land on the failing step so a pasted link opens the failing action.
 */
export function useRunSelection(steps: TestStepRun[]): RunSelection {
  const [stepId, setStepId] = useQueryState("step");
  const [actionId, setActionId] = useQueryState("action");
  const [tab, setTab] = useQueryState("tab", { defaultValue: "ai" });

  const failingStep = steps.find((s) => s.status === "failed");
  const defaultStep = failingStep ?? steps[0];
  const currentStep = steps.find((s) => s.id === stepId) ?? defaultStep;

  const failingAction = currentStep?.actions.find(
    (a) => a.badgeType === "FAIL_STEP" || a.resultStatus === "bad"
  );
  const defaultAction = failingAction ?? currentStep?.actions[0];
  const currentAction =
    currentStep?.actions.find((a) => a.id === actionId) ?? defaultAction;

  const selectStep = (id: string) => {
    void setStepId(id);
    const step = steps.find((s) => s.id === id);
    const first = step?.actions[0];
    if (first) void setActionId(first.id);
  };

  const selectAction = (step: TestStepRun, action: Action) => {
    void setStepId(step.id);
    void setActionId(action.id);
  };

  return {
    currentStep,
    currentAction,
    tab,
    selectStep,
    selectAction,
    selectTab: (next: string) => void setTab(next),
  };
}
