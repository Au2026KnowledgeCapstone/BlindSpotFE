import React from "react";
import OverviewDashboard from "@/features/overview/OverviewDashboard";

export function HealsContent({ projectId }: { projectId: string }) {
  return <OverviewDashboard runs={[]} />;
}
