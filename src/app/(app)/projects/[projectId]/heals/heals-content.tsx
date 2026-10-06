"use client";

import React from "react";
import { useRuns } from "@/features/runs";

export function HealsContent({ projectId }: { projectId: string }) {
  const { isLoading } = useRuns(projectId);

  if (isLoading) return <div className="text-xs text-tertiary">Loading heals queue...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-primary">Heals Review Queue — {projectId}</h1>
      <div className="border border-border rounded p-4 bg-raised space-y-3">
        <p className="text-xs text-secondary">
          Pending heals requiring developer acceptance or rejection.
        </p>
        <div className="p-3 border border-border rounded bg-panel text-xs space-y-2">
          <div className="flex justify-between font-semibold">
            <span>Checkout Flow — Run #4819</span>
            <span className="text-amber-500 font-mono">Passed · healed</span>
          </div>
          <p className="text-tertiary">Selector auto-healed: button[name="submit"] → button[type="submit"]</p>
          <div className="flex gap-2">
            <button type="button" className="px-2.5 py-1 rounded bg-pass text-black font-semibold text-[11px]">
              Accept Heal
            </button>
            <button type="button" className="px-2.5 py-1 rounded bg-fail text-white font-semibold text-[11px]">
              Reject Heal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
