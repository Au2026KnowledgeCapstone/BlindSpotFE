import React from "react";
import type { Run } from "@/features/runs";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { CostChip } from "@/shared/ui/CostChip";

export function OverviewDashboard({ runs }: { runs: Run[] }) {
  const regressions = runs.filter((r) => r.status === "regression");
  const failures = runs.filter((r) => r.status === "failed");
  const flaky = runs.filter((r) => r.status === "passed_healed");

  return (
    <div className="space-y-6" data-testid="overview-dashboard">
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Regressions & Alerts</h2>
        {regressions.length > 0 ? (
          <div className="border border-fail/40 bg-fail/10 rounded-md p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-fail flex items-center gap-2">
                <StatusBadge status="regression" /> Regression detected in Checkout Flow (PR #482)
              </span>
              <span className="text-xs text-secondary font-mono">Since deployment v2.4.1 (12m ago)</span>
            </div>
          </div>
        ) : (
          <div className="border border-border bg-raised rounded-md p-3 text-xs text-secondary">
            No regressions active.
          </div>
        )}
      </div>

      <div className="border border-border bg-panel rounded-md p-4 space-y-3">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Recent Runs</h3>
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
                    <CostChip durationSeconds={r.durationSeconds} actionsCount={r.actionCount} costUsd={r.estimatedCostUsd} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
