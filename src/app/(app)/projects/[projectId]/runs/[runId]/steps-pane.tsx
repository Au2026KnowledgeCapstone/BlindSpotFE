"use client";

import React, { useEffect, useRef } from "react";
import type { TestStepRun, RunSelection } from "@/features/runs";
import { StepRow } from "./step-row";

export interface StepsPaneProps {
  steps: TestStepRun[];
  selection: RunSelection;
  collapsedIds: string[];
  currentStepNumber?: number | null | undefined;
  isPresentationMode?: boolean | undefined;
  onToggleExpand: (stepId: string, e: React.MouseEvent) => void;
}

function StepsHeader({ count }: { count: number }) {
  return (
    <h2 className="px-4 py-3 border-b border-[var(--bs-border-subtle)] bg-[var(--bs-bg-raised)] text-xs font-semibold uppercase tracking-wider text-[var(--bs-text-primary)] flex items-center justify-between">
      <span>Steps &amp; actions</span>
      <span className="font-mono tabular-nums text-[var(--bs-text-tertiary)]">({count})</span>
    </h2>
  );
}

export function StepsPane({ steps, selection, collapsedIds, currentStepNumber, isPresentationMode, onToggleExpand }: StepsPaneProps) {
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 60) el.scrollTop = el.scrollHeight;
  }, [steps.length, steps]);

  const shellClass = `border border-[var(--bs-border-default)] bg-[var(--bs-bg-panel)] rounded-lg overflow-hidden flex flex-col lg:h-[750px] ${isPresentationMode ? "text-2xl" : ""}`;

  return (
    <section aria-label="Steps and actions" className={shellClass}>
      <StepsHeader count={steps.length} />
      <ul ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2 list-none">
        {steps.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            isSelected={step.id === selection.currentStep?.id}
            isExpanded={!collapsedIds.includes(step.id)}
            isCurrentStep={step.stepNumber === currentStepNumber}
            isPresentationMode={isPresentationMode}
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
