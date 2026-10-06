"use client";

import React from "react";
import type { Run } from "@/features/runs";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { CostChip } from "@/shared/ui/CostChip";
import { RotateCcw, Download } from "lucide-react";

export function RunHeader({ run }: { run: Run }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--bs-bg-panel)] border border-[var(--bs-border-default)]">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--bs-text-primary)]">
            {run.flowName}
          </h1>
          <span className="font-mono text-xs text-[var(--bs-text-tertiary)] px-2 py-0.5 rounded bg-[var(--bs-bg-raised)]">
            #{run.runNumber}
          </span>
          <StatusBadge status={run.status} />
        </div>
        <p className="text-xs text-[var(--bs-text-secondary)] flex items-center gap-2">
          <span>Started {new Date(run.startedAt).toLocaleTimeString()}</span>
          <span>·</span>
          <span>
            branch <code className="font-mono text-[var(--bs-text-primary)]">{run.branch}</code> @{" "}
            <code className="font-mono text-[var(--bs-text-primary)]">{run.commitSha}</code>
          </span>
          <span>·</span>
          <span className="capitalize">{run.environment} environment</span>
          <span>·</span>
          <span>Trigger: {run.trigger}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <CostChip
          durationSeconds={run.durationSeconds}
          actionsCount={run.actionCount}
          estimatedCostUsd={run.estimatedCostUsd}
          mode={run.executionMode === "agentic" ? "Agentic" : "Replay"}
        />
        <button
          type="button"
          onClick={() => alert("Re-running flow...")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bs-bg-raised)] hover:bg-[var(--bs-bg-hover)] text-[var(--bs-text-primary)] border border-[var(--bs-border-default)] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Re-run</span>
        </button>
        <button
          type="button"
          onClick={() => alert("Downloading trace archive...")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bs-accent-solid)] hover:bg-[var(--bs-accent-solid-hover)] text-white shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download trace</span>
        </button>
      </div>
    </div>
  );
}
