"use client";

import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useRuns } from "@/features/runs";
import type { Run } from "@/features/runs";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { environmentLabel } from "@/shared/lib/labels";

function RunRow({ run, projectId }: { run: Run; projectId: string }) {
  return (
    <tr className="hover:bg-hover">
      <td className="p-3 font-mono font-medium text-fg">#{run.runNumber}</td>
      <td className="p-3 font-medium text-fg-secondary">{run.flowName}</td>
      <td className="p-3 text-fg-secondary">{environmentLabel(run.environment)}</td>
      <td className="p-3">
        <StatusBadge status={run.status} />
      </td>
      <td className="p-3 font-mono text-fg-tertiary">{run.durationSeconds}s</td>
      <td className="p-3">
        <Link
          href={`/projects/${projectId}/runs/${run.id}`}
          className="text-accent font-medium hover:underline"
        >
          View Run →
        </Link>
      </td>
    </tr>
  );
}

export function RunsContent({ projectId }: { projectId: string }) {
  const { data: runs, isLoading, error } = useRuns(projectId);

  if (isLoading) return <LoadingScreen label="Loading runs" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Runs"
        description="Every execution the agent has made, with its evidence and cost."
      />
      {error ? (
        <div role="status">
          <EmptyState
            icon={Clock}
            title="Run history unavailable"
            description="Run history is unavailable until the project execution service is integrated."
          />
        </div>
      ) : <div className="overflow-hidden rounded-xl border border-border bg-raised text-xs shadow-ambient">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-panel text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">
            <tr>
              <th className="p-3">Run</th>
              <th className="p-3">Flow</th>
              <th className="p-3">Environment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {runs?.map((r) => (
              <RunRow key={r.id} run={r} projectId={projectId} />
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
