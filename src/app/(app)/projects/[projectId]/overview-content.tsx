"use client";

import React from "react";
import { useRuns } from "@/features/runs";

export function OverviewContent({ projectId }: { projectId: string }) {
  const { data: runs, isLoading, error } = useRuns(projectId);

  if (isLoading) return <div className="text-xs text-tertiary">Loading overview...</div>;
  if (error) return <div className="text-xs text-fail">Failed to load overview data</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-primary">Overview — {projectId}</h1>
      <p className="text-xs text-secondary">
        Showing {runs?.length ?? 0} fixture runs loaded through Zod schema & mapper.
      </p>
      <div className="border border-border rounded p-4 bg-raised space-y-2">
        {runs?.map((run) => (
          <div key={run.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
            <div>
              <span className="font-mono text-tertiary">#{run.runNumber}</span>{" "}
              <span className="font-medium text-primary">{run.flowName}</span>{" "}
              <span className="text-quaternary">({run.environment})</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-panel border border-border">
              {run.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
