"use client";

import React from "react";
import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function OverviewContent(_props: { projectId: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Overview" />
      <EmptyState
        icon={LayoutDashboard}
        title="Overview is being rebuilt"
        description="This screen is being redesigned for the product-manager workflow."
      />
    </div>
  );
}
