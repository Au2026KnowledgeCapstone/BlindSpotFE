"use client";

import React from "react";
import Link from "next/link";

export function FlowDetailContent({ projectId, flowId }: { projectId: string; flowId: string }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-fg">Flow: {flowId}</h1>
        <span className="text-xs font-mono text-fg-tertiary">Project: {projectId}</span>
      </div>
      <div role="status" className="rounded-lg border border-border bg-panel p-4 text-sm text-fg-secondary">
        Flow execution is unavailable. No steps or results are being reported.
      </div>
      <Link className="text-sm text-accent underline-offset-4 hover:underline" href={`/projects/${projectId}/flows`}>
        Back to flows
      </Link>
    </section>
  );
}
