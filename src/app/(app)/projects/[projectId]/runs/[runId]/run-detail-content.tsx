"use client";

import React from "react";
import { useRunDetail } from "@/features/runs";
import type { Failure, TestStepRun } from "@/features/runs";

function FailureBanner({ failure }: { failure: Failure }) {
  return (
    <div className="border border-fail-border bg-fail-tint p-4 rounded text-xs space-y-2">
      <div className="font-semibold text-fail">
        ✗ Failure at step {failure.stepNumber} — Expected vs Observed
      </div>
      <div><b className="text-secondary">Expected:</b> {failure.expected}</div>
      <div><b className="text-secondary">Observed:</b> {failure.observed}</div>
    </div>
  );
}

function StepsList({ steps }: { steps: TestStepRun[] }) {
  return (
    <div className="border border-border rounded p-4 bg-raised space-y-2">
      <h2 className="text-sm font-semibold text-primary">Steps & Actions</h2>
      {steps.map((step) => (
        <div key={step.id} className="p-3 border border-border rounded bg-panel text-xs space-y-2">
          <div className="flex justify-between font-medium">
            <span>{step.stepNumber}. {step.title}</span>
            <span className="font-mono text-tertiary">{step.status}</span>
          </div>
          <div className="pl-4 space-y-1 text-tertiary font-mono text-[11px]">
            {step.actions.map((act) => (
              <div key={act.id} className="flex gap-2">
                <span>[{act.badgeType}]</span>
                <span>{act.description}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RunDetailContent({ projectId, runId }: { projectId: string; runId: string }) {
  const { data, isLoading } = useRunDetail(runId);

  if (isLoading) return <div className="text-xs text-tertiary">Loading run details...</div>;

  const { run, steps, failure } = data!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">
            {run.flowName} <span className="font-mono text-tertiary">#{run.runNumber}</span>
          </h1>
          <p className="text-xs text-tertiary">
            Started {run.startedAt} · {run.durationSeconds}s · branch <code className="text-secondary">{run.branch}</code> @ <code className="text-secondary">{run.commitSha}</code>
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-panel border border-border">
          {run.status}
        </span>
      </div>

      {failure && <FailureBanner failure={failure} />}
      <StepsList steps={steps} />
    </div>
  );
}
