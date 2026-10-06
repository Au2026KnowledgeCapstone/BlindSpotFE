"use client";

import React from "react";
import { useRunDetail } from "@/features/runs";

export function FlowDetailContent({ projectId, flowId }: { projectId: string; flowId: string }) {
  const { data, isLoading } = useRunDetail("run-4821");

  if (isLoading) return <div className="text-xs text-tertiary">Loading flow detail...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Flow: {flowId}</h1>
        <span className="text-xs font-mono text-tertiary">Project: {projectId}</span>
      </div>
      <div className="border border-border rounded p-4 bg-raised space-y-3">
        <h2 className="text-sm font-semibold text-primary">Configured Steps</h2>
        <div className="space-y-2">
          {data?.steps.map((s) => (
            <div key={s.id} className="p-2 border border-border rounded bg-panel text-xs flex justify-between">
              <span>{s.stepNumber}. {s.title}</span>
              <span className="text-tertiary">{s.actions.length} actions</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
