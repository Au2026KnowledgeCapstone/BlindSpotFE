"use client";

import React from "react";
import { useRuns } from "@/features/runs";
import { OverviewDashboard } from "@/features/overview";

export function OverviewContent({ projectId }: { projectId: string }) {
  const { data: runs, isLoading, error } = useRuns(projectId);

  if (isLoading) return <div className="text-xs text-tertiary">Loading overview...</div>;
  if (error) return <div className="text-xs text-fail">Failed to load overview data</div>;

  return <OverviewDashboard runs={runs ?? []} />;
}
