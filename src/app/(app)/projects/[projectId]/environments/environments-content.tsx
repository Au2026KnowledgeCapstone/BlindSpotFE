"use client";

import React from "react";
import { Globe } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function EnvironmentsContent() {
  return (
    <div className="space-y-6" data-testid="environments-view">
      <PageHeader title="Environments" />
      <EmptyState
        icon={Globe}
        title="Environments is being rebuilt"
        description="This screen is being redesigned for the product-manager workflow."
      />
    </div>
  );
}
