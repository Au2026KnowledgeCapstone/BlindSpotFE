"use client";

import React from "react";
import type { TestStepRun } from "@/features/runs";
import type { RunSelection } from "@/features/runs";
import { StepRow } from "./step-row";

export interface StepsPaneProps {
  steps: TestStepRun[];
  selection: RunSelection;
  collapsedIds: string[];
  onToggleExpand: (stepId: string, e: React.MouseEvent) => void;
}

export function StepsPane({ steps, selection, collapsedIds, onToggleExpand }: StepsPaneProps) {
  return (
    <section
      aria-label="Steps and actions"
      className="border border-[var(--bs-border-default)] bg-[var(--bs-bg-panel)] rounded-lg overflow-hidden flex flex-col lg:h-[750px]"
    >
      <h2 className="px-4 py-3 border-b border-[var(--bs-border-subtle)] bg-[var(--bs-bg-raised)] text-xs font-semibold uppercase tracking-wider text-[var(--bs-text-primary)]">
        Steps &amp; actions
        <span className="ml-1.5 font-mono tabular-nums text-[var(--bs-text-tertiary)]">
          ({steps.length})
        </span>
      </h2>

      <ul className="flex-1 overflow-y-auto p-2 space-y-2 list-none">
        {steps.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            isSelected={step.id === selection.currentStep?.id}
            isExpanded={!collapsedIds.includes(step.id)}
            currentActionId={selection.currentAction?.id}
            onToggleExpand={onToggleExpand}
            onSelectStep={selection.selectStep}
            onSelectAction={selection.selectAction}
          />
        ))}
      </ul>
    </section>
  );
}
