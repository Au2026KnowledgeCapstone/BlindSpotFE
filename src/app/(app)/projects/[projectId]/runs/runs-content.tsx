"use client";

import React from "react";
import Link from "next/link";
import { useRuns } from "@/features/runs";
import type { Run } from "@/features/runs";

function RunRow({ run, projectId }: { run: Run; projectId: string }) {
  return (
    <tr className="hover:bg-hover">
      <td className="p-3 font-mono font-medium text-primary">#{run.runNumber}</td>
      <td className="p-3 font-medium text-secondary">{run.flowName}</td>
      <td className="p-3 text-tertiary">{run.environment}</td>
      <td className="p-3">
        <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-border bg-panel">
          {run.status}
        </span>
      </td>
      <td className="p-3 font-mono text-tertiary">{run.durationSeconds}s</td>
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
  const { data: runs, isLoading } = useRuns(projectId);

  if (isLoading) return <div className="text-xs text-tertiary">Loading runs...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-primary">Runs — {projectId}</h1>
      <div className="border border-border rounded bg-raised overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-panel border-b border-border text-tertiary font-mono uppercase text-[10px]">
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
      </div>
    </div>
  );
}
