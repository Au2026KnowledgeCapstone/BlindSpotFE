"use client";

import React from "react";
import type { Action, TestStepRun, RunSelection } from "@/features/runs";
import { ScreenshotFrame } from "@/shared/ui/ScreenshotFrame";

interface FilmStripItemProps {
  step: TestStepRun;
  isSelected: boolean;
  onSelect: (stepId: string) => void;
}

function FilmStripItem({ step, isSelected, onSelect }: FilmStripItemProps) {
  const isFailed = step.status === "failed";
  const borderClass = isSelected
    ? "border-accent ring-1 ring-accent"
    : isFailed
    ? "border-fail"
    : "border-subtle opacity-70 hover:opacity-100";

  return (
    <button
      type="button"
      onClick={() => onSelect(step.id)}
      className={`relative w-28 h-18 rounded border overflow-hidden shrink-0 cursor-pointer text-left transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 ${borderClass}`}
    >
      {step.screenshotUrl ? (
        <img src={step.screenshotUrl} alt={step.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-inset flex items-center justify-center text-[11px] text-fg-tertiary">
          Step {step.stepNumber}
        </div>
      )}
      <span className="absolute bottom-0 inset-x-0 bg-black/70 px-1 py-0.5 text-[11px] font-mono text-white truncate flex items-center justify-between">
        <span>{step.stepNumber}. {step.title}</span>
        {isFailed && <span className="w-2 h-2 rounded-full bg-fail animate-pulse" />}
      </span>
    </button>
  );
}

interface FilmStripProps {
  steps: TestStepRun[];
  currentStepId?: string | undefined;
  onSelectStep: (stepId: string) => void;
}

function FilmStrip({ steps, currentStepId, onSelectStep }: FilmStripProps) {
  return (
    <div className="h-24 bg-raised border border-subtle rounded-lg p-2 flex items-center gap-3 overflow-x-auto shrink-0">
      {steps.map((st) => (
        <FilmStripItem
          key={st.id}
          step={st}
          isSelected={st.id === currentStepId}
          onSelect={onSelectStep}
        />
      ))}
    </div>
  );
}

export interface EvidencePaneProps {
  steps: TestStepRun[];
  selection: RunSelection;
}

/**
 * ScreenshotFrame declares plain optional props; exactOptionalPropertyTypes
 * forbids passing an explicit undefined, so absent keys are omitted instead.
 */
function buildFrameProps(step: TestStepRun | undefined, action: Action | undefined) {
  const target = action ? action.target : undefined;
  const beforeSrc = step ? step.beforeScreenshotUrl : undefined;
  const afterSrc = step ? step.screenshotUrl ?? step.afterScreenshotUrl : undefined;
  const isClick = action ? action.badgeType === "CLICK" : false;

  return {
    url: target ? `https://store.acme.dev/${target}` : "https://store.acme.dev/checkout",
    ...(beforeSrc ? { beforeSrc } : {}),
    ...(afterSrc ? { afterSrc } : {}),
    ...(isClick ? { clickPoint: { x: 50, y: 45 } } : {}),
  };
}

export function EvidencePane({ steps, selection }: EvidencePaneProps) {
  const { currentStep, currentAction } = selection;
  const actionLabel = currentAction ? `Action: ${currentAction.badgeType}` : "Step overview";
  const frameProps = buildFrameProps(currentStep, currentAction);

  return (
    <section
      aria-label="Evidence viewer"
      className="border border-border bg-panel rounded-lg overflow-hidden flex flex-col lg:h-[750px]"
    >
      <div className="px-4 py-3 border-b border-subtle flex items-center justify-between bg-raised">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg">
          Evidence viewer
        </h2>
        <span className="font-mono text-[11px] text-fg-tertiary">{actionLabel}</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 min-h-0">
          <ScreenshotFrame {...frameProps} alt="Step screenshot" className="h-full w-full" />
        </div>
        <FilmStrip steps={steps} currentStepId={currentStep?.id} onSelectStep={selection.selectStep} />
      </div>
    </section>
  );
}
