import React from "react";
import type { Run } from "@/features/runs";
import { RegressionsFirst } from "./RegressionsFirst";
import { OverviewCounters } from "./OverviewCounters";
import { RecentRunsTable } from "./RecentRunsTable";

export function OverviewDashboard({
  runs,
  projectId,
}: {
  runs: Run[];
  projectId?: string | undefined;
}) {
  return (
    <div className="mt-6 space-y-8" data-testid="overview-dashboard">
      <RegressionsFirst runs={runs} projectId={projectId} />
      <OverviewCounters runs={runs} />
      <RecentRunsTable runs={runs} />
    </div>
  );
}
