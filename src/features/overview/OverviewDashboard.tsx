import React from "react";
import type { Run } from "@/features/runs";
import { RegressionsFirst } from "./RegressionsFirst";
import { OverviewCounters } from "./OverviewCounters";
import { PassRateTrend } from "./PassRateTrend";
import { RecentRunsTable } from "./RecentRunsTable";

export function OverviewDashboard({ runs }: { runs: Run[] }) {
  return (
    <div className="space-y-6" data-testid="overview-dashboard">
      <RegressionsFirst runs={runs} />
      <OverviewCounters runs={runs} />
      <PassRateTrend runs={runs} />
      <RecentRunsTable runs={runs} />
    </div>
  );
}
