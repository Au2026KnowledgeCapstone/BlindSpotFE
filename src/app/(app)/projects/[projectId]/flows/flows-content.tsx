"use client";

import React from "react";
import { Zap } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function FlowsContent(_props: { projectId: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Flows" />
      <EmptyState
        icon={Zap}
        title="Flows is being rebuilt"
        description="This screen is being redesigned for the product-manager workflow."
      />
    </div>
  );
}
