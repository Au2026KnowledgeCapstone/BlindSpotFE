import React from "react";
import type { Run } from "@/features/runs";

export function PassRateTrend({ runs }: { runs: Run[] }) {
  return (
    <div className="border border-border bg-panel rounded-md p-4 space-y-2">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Pass-rate trend (7 days)</h3>
      <div className="h-28 w-full flex items-end relative pt-4">
        <svg className="w-full h-20 overflow-visible" viewBox="0 0 500 80">
          <path
            d="M 0,20 Q 80,15 160,25 T 320,60 T 500,10"
            fill="none"
            stroke="var(--bs-text-tertiary)"
            strokeWidth="2"
          />
          <circle cx="320" cy="60" r="5" fill="var(--bs-fail)" />
          <text x="310" y="50" fill="var(--bs-fail)" fontSize="10" fontFamily="monospace">Regression</text>
        </svg>
      </div>
    </div>
  );
}
