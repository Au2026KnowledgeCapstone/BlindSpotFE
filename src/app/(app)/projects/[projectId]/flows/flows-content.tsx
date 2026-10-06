"use client";

import React from "react";
import Link from "next/link";
import { useRuns } from "@/features/runs";

export function FlowsContent({ projectId }: { projectId: string }) {
  const { isLoading } = useRuns(projectId);

  if (isLoading) return <div className="text-xs text-tertiary">Loading flows...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-primary">Flows — {projectId}</h1>
      <div className="border border-border rounded p-4 bg-raised space-y-2">
        <Link
          href={`/projects/${projectId}/flows/checkout-flow`}
          className="flex items-center justify-between text-xs py-2 px-3 border border-border rounded bg-panel hover:bg-hover transition-colors"
        >
          <div>
            <span className="font-semibold text-primary">Checkout Flow</span>
            <div className="text-tertiary text-[11px]">5 steps · 23 actions · Staging</div>
          </div>
          <span className="text-accent font-medium">View Flow →</span>
        </Link>
      </div>
    </div>
  );
}
