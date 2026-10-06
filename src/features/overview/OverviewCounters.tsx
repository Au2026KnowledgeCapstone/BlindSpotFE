import React from "react";
import type { Run } from "@/features/runs";

function Counter({ label, value, tone }: { label: string; value: string; tone?: "fail" }) {
  return (
    <div className="border border-border bg-panel rounded-md p-3">
      <div className="text-xs text-tertiary">{label}</div>
      <div className={`text-lg font-bold font-mono tabular-nums ${tone === "fail" ? "text-fail" : "text-primary"}`}>
        {value}
      </div>
    </div>
  );
}

export function OverviewCounters({ runs }: { runs: Run[] }) {
  const passed = runs.filter((r) => r.status === "passed" || r.status === "passed_healed").length;
  const passRate = runs.length === 0 ? "—" : `${((passed / runs.length) * 100).toFixed(1)}%`;
  const regressions = runs.filter((r) => r.status === "regression").length;
  const costThisWeek = runs.reduce((sum, r) => sum + r.estimatedCostUsd, 0);

  return (
    <div className="grid grid-cols-4 gap-4">
      <Counter label="Tests" value={String(runs.length)} />
      <Counter label="Pass rate" value={passRate} />
      <Counter label="New regressions" value={String(regressions)} tone="fail" />
      <Counter label="AI cost this week" value={`$${costThisWeek.toFixed(2)}`} />
    </div>
  );
}
