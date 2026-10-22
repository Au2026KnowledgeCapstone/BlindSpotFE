"use client";

import React from "react";
import type { Run } from "@/features/runs";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { CostChip } from "@/shared/ui/CostChip";
import { Button } from "@/components/ui/button";
import { RotateCcw, Download } from "lucide-react";

function RunHeaderInfo({ run }: { run: Run }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-fg">
          {run.flowName}
        </h1>
        <span className="font-mono text-xs text-fg-tertiary px-2 py-0.5 rounded bg-raised">
          #{run.runNumber}
        </span>
        <StatusBadge status={run.status} />
      </div>
      <p className="text-xs text-fg-secondary flex items-center gap-2">
        <span>Started {new Date(run.startedAt).toLocaleTimeString()}</span>
        <span>·</span>
        <span>
          branch <code className="font-mono text-fg">{run.branch}</code> @{" "}
          <code className="font-mono text-fg">{run.commitSha}</code>
        </span>
        <span>·</span>
        <span className="capitalize">{run.environment} environment</span>
        <span>·</span>
        <span>Trigger: {run.trigger}</span>
      </p>
    </div>
  );
}

function RunHeaderActions({ run }: { run: Run }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <CostChip
        durationSeconds={run.durationSeconds}
        actionsCount={run.actionCount}
        estimatedCostUsd={run.estimatedCostUsd}
        mode={run.executionMode === "agentic" ? "Agentic" : "Replay"}
      />
      <Button variant="outline" size="sm" onClick={() => alert("Re-running flow...")}>
        <RotateCcw />
        Re-run
      </Button>
      <Button size="sm" onClick={() => alert("Downloading trace archive...")}>
        <Download />
        Download trace
      </Button>
    </div>
  );
}

export function RunHeader({ run }: { run: Run }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-panel border border-border">
      <RunHeaderInfo run={run} />
      <RunHeaderActions run={run} />
    </div>
  );
}
