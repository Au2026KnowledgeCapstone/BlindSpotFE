import React from "react";
import type { Run } from "@/features/runs";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { CostChip } from "@/shared/ui/CostChip";

export function RecentRunsTable({ runs }: { runs: Run[] }) {
  return (
    <div className="border border-border bg-panel rounded-md p-4 space-y-3">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Recent runs</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-tertiary">
              <th className="pb-2">Run</th>
              <th className="pb-2">Flow</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Environment</th>
              <th className="pb-2">Trigger</th>
              <th className="pb-2">Duration / Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {runs.map((r) => (
              <tr key={r.id} className="hover:bg-raised">
                <td className="py-2.5 font-mono text-tertiary">#{r.runNumber}</td>
                <td className="py-2.5 font-medium text-primary">{r.flowName}</td>
                <td className="py-2.5"><StatusBadge status={r.status} /></td>
                <td className="py-2.5 capitalize">{r.environment}</td>
                <td className="py-2.5 font-mono text-tertiary">{r.trigger}</td>
                <td className="py-2.5">
                  <CostChip
                    durationSeconds={r.durationSeconds}
                    actionsCount={r.actionCount}
                    estimatedCostUsd={r.estimatedCostUsd}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
