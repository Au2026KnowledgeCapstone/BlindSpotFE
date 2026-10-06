"use client";

import React from "react";
import type { Failure } from "@/features/runs";
import { ExpectedObserved } from "@/shared/ui/ExpectedObserved";
import { CircleX, TrendingDown } from "lucide-react";

const CATEGORY_COPY = {
  application_defect: "Application defect",
  agent_error: "Agent error",
} as const;

export interface FailureSummaryProps {
  failure?: Failure | undefined;
  lastPassingRunNumber?: number | undefined;
  firstFailingRunNumber?: number | undefined;
}

function RegressionBlock({
  lastPassing,
  firstFailing,
}: {
  lastPassing: number;
  firstFailing: number;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--bs-fail-border)] bg-[var(--bs-fail-tint)] text-xs text-[var(--bs-text-primary)]">
      <TrendingDown className="w-4 h-4 text-[var(--bs-fail)]" aria-hidden="true" />
      <span className="font-medium text-[var(--bs-fail)]">Regression</span>
      <span className="text-[var(--bs-text-secondary)]">
        last passing run{" "}
        <span className="font-mono tabular-nums text-[var(--bs-text-primary)]">#{lastPassing}</span>
        {" → first failing run "}
        <span className="font-mono tabular-nums text-[var(--bs-text-primary)]">#{firstFailing}</span>
      </span>
    </div>
  );
}

export function FailureSummary({
  failure,
  lastPassingRunNumber,
  firstFailingRunNumber,
}: FailureSummaryProps) {
  if (!failure) return null;

  const showRegression =
    lastPassingRunNumber !== undefined && firstFailingRunNumber !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-[var(--bs-fail-tint)] border border-[var(--bs-fail-border)] text-xs font-medium text-[var(--bs-fail)]">
        <span className="flex items-center gap-2">
          <CircleX className="w-4 h-4" aria-hidden="true" />
          <span>
            Failed at step{" "}
            <span className="font-mono tabular-nums">{failure.stepNumber}</span>
            {" — "}
            <strong>{CATEGORY_COPY[failure.category]}</strong>
          </span>
        </span>
        <span className="font-mono text-[11px] text-[var(--bs-text-tertiary)]">{failure.id}</span>
      </div>

      <ExpectedObserved expected={failure.expected} observed={failure.observed} />

      {showRegression && (
        <RegressionBlock
          lastPassing={lastPassingRunNumber}
          firstFailing={firstFailingRunNumber}
        />
      )}
    </div>
  );
}
