import React from "react";
import type { Run } from "@/features/runs";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function RegressionsFirst({ runs }: { runs: Run[] }) {
  const regressions = runs.filter((r) => r.status === "regression");
  return (
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
  );
}
