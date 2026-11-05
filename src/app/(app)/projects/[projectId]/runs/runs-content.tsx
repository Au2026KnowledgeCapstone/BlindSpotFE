"use client";

import React from "react";
import { Play } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function RunsContent(_props: { projectId: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Runs" />
      <EmptyState
        icon={Play}
        title="Runs is being rebuilt"
        description="This screen is being redesigned for the product-manager workflow."
      />
    </div>
  );
}
