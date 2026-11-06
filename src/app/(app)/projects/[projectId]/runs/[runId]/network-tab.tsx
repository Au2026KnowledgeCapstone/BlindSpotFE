"use client";

import React from "react";
import type { NetworkLogEntry, TestStepRun } from "@/features/runs";
import { FIELD_CHECKBOX } from "@/shared/ui/field";

export interface NetworkTabProps {
  steps: TestStepRun[];
  currentStep: TestStepRun | undefined;
}

function NetworkRow({ entry }: { entry: NetworkLogEntry }) {
  const isError = entry.status >= 400;
  const shell = isError
    ? "border-fail-border bg-fail-tint text-fail"
    : "border-subtle bg-raised text-fg-secondary";
  const chip = isError
    ? "bg-fail text-white"
    : "bg-pass-tint text-pass";

  return (
    <li className={`p-2 rounded border flex items-center justify-between ${shell}`}>
      <span className="flex items-center gap-2 truncate">
        <span className="font-semibold">{entry.method}</span>
        <span className="truncate">{entry.url}</span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        <span className={`px-1.5 py-0.5 rounded text-[11px] tabular-nums ${chip}`}>
          {entry.status}
        </span>
        <span className="tabular-nums">{entry.durationMs}ms</span>
      </span>
    </li>
  );
}

export function NetworkTab({ steps, currentStep }: NetworkTabProps) {
  const [showAll, setShowAll] = React.useState(false);
  const entries = showAll
    ? steps.flatMap((s) => s.networkLogs ?? [])
    : currentStep?.networkLogs ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-fg-secondary">
          {showAll ? "All steps" : `Step ${currentStep?.stepNumber ?? "—"}`}
        </span>
        <label className="flex items-center gap-1.5 text-xs text-fg-tertiary cursor-pointer">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className={FIELD_CHECKBOX}
          />
          <span>Show all</span>
        </label>
      </div>

      <ul className="space-y-1 font-mono text-[11px] list-none">
        {entries.map((entry) => (
          <NetworkRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  );
}
