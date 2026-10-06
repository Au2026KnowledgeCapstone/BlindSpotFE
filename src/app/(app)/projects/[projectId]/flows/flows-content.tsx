import React from "react";
import OverviewDashboard from "@/features/overview/OverviewDashboard";

export function FlowsContent({ projectId }: { projectId: string }) {
  return <OverviewDashboard runs={[]} />;
}
