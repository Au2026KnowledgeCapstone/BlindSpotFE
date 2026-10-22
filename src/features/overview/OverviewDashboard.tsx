import React from "react";
import type { Run } from "@/features/runs";
import { PageHeader } from "@/shared/ui/PageHeader";
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
    <div className="space-y-8" data-testid="overview-dashboard">
      <PageHeader
        title="Overview"
        description="Regressions first, then the rest of the week's runs."
      />
      <RegressionsFirst runs={runs} projectId={projectId} />
      <OverviewCounters runs={runs} />
      <RecentRunsTable runs={runs} />
    </div>
  );
}
