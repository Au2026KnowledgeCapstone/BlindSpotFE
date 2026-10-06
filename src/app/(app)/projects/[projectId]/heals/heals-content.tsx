"use client";

import React from "react";
import { HealsQueue } from "@/features/heals";

export function HealsContent({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-4" data-testid="heals-view">
      <h1 className="text-lg font-bold text-primary">Heals · {projectId}</h1>
      <HealsQueue />
    </div>
  );
}
