"use client";

import React from "react";
import { EnvironmentCards } from "@/features/environments";

export function EnvironmentsContent({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-4" data-testid="environments-view">
      <h1 className="text-lg font-bold text-primary">Environments · {projectId}</h1>
      <EnvironmentCards />
    </div>
  );
}
