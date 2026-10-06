"use client";

import React from "react";
import type { Action, TestStepRun } from "@/features/runs";
import { ActionRow } from "./action-row";
import { CheckCircle2, XCircle, Bandage, LoaderCircle, ChevronDown, ChevronRight } from "lucide-react";

const STEP_ICON = { passed: CheckCircle2, failed: XCircle, healed: Bandage, running: LoaderCircle } as const;
const STEP_TONE = { passed: "var(--bs-pass)", failed: "var(--bs-fail)", healed: "var(--bs-healed)", running: "var(--bs-accent)" } as const;

function stepShellClass(status: TestStepRun["status"], isSelected: boolean): string {
  if (status === "failed") return "border-[var(--bs-fail-border)] bg-[var(--bs-fail-tint)]";
  if (status === "healed") return "border-[var(--bs-healed-border)] bg-[var(--bs-healed-tint)]";
  if (isSelected) return "border-[var(--bs-accent)] bg-[var(--bs-bg-selected)]";
  return "border-[var(--bs-border-subtle)] bg-[var(--bs-bg-raised)]";
}

export interface StepRowProps {
  step: TestStepRun;
  isSelected: boolean;
  isExpanded: boolean;
  isCurrentStep?: boolean | undefined;
  isPresentationMode?: boolean | undefined;
  currentActionId: string | undefined;
  onToggleExpand: (stepId: string, e: React.MouseEvent) => void;
  onSelectStep: (stepId: string) => void;
  onSelectAction: (step: TestStepRun, action: Action) => void;
}

function StepRowHeader(props: StepRowProps & { effectiveStatus: TestStepRun["status"] }) {
  const { step, isSelected, isExpanded, isPresentationMode, effectiveStatus, onToggleExpand, onSelectStep } = props;
  const Icon = STEP_ICON[effectiveStatus];
  const Chevron = isExpanded ? ChevronDown : ChevronRight;
  const titleClass = isPresentationMode ? "text-2xl font-bold tracking-tight py-1" : "text-xs font-medium";

  return (
    <div className="px-2 py-2 flex items-center justify-between gap-2">
      <button type="button" aria-expanded={isExpanded} aria-label={isExpanded ? `Collapse step ${step.stepNumber}` : `Expand step ${step.stepNumber}`} onClick={(e) => onToggleExpand(step.id, e)} className="text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] rounded p-1">
        <Chevron className="w-4 h-4" aria-hidden="true" />
      </button>
      <button type="button" aria-current={isSelected} onClick={() => onSelectStep(step.id)} className="flex-1 min-w-0 flex items-center gap-2 text-left rounded">
        <span className="font-mono text-xs tabular-nums text-[var(--bs-text-secondary)]">{step.stepNumber}.</span>
        <span className={`text-[var(--bs-text-primary)] truncate ${titleClass}`}>{step.title}</span>
      </button>
      <span className="flex items-center gap-1.5 shrink-0">
        <span className="font-mono text-[10px] tabular-nums text-[var(--bs-text-tertiary)]">{step.durationMs}ms</span>
        <Icon aria-label={effectiveStatus} style={{ color: STEP_TONE[effectiveStatus] }} className={`w-4 h-4 ${effectiveStatus === "running" ? "animate-spin" : ""}`} />
      </span>
    </div>
  );
}

export function StepRow(props: StepRowProps) {
  const { step, isSelected, isExpanded, isCurrentStep, isPresentationMode, currentActionId, onSelectAction } = props;
  const effectiveStatus = isCurrentStep ? "running" : step.status;

  return (
    <li className={`rounded-md border transition-all ${stepShellClass(effectiveStatus, isSelected)}`}>
      <StepRowHeader {...props} effectiveStatus={effectiveStatus} />
      {isExpanded && (
        <ul className="px-2 pb-2 pt-1 space-y-1.5 border-t border-[var(--bs-border-subtle)] list-none">
          {step.actions.map((action) => (
            <li key={action.id}>
              <ActionRow action={action} isSelected={action.id === currentActionId} isPresentationMode={isPresentationMode} onSelect={(a, e) => { e.stopPropagation(); onSelectAction(step, a); }} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
