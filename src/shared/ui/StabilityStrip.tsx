import React from "react";
import { STATUS_CONFIG, type RunStatus } from "./status-config";

export interface RunBar {
  id: string;
  status: RunStatus;
  label?: string;
}

export interface StabilityStripProps {
  runs: RunBar[];
  onSelectRun?: (runId: string) => void;
  className?: string;
}

export const StabilityStrip: React.FC<StabilityStripProps> = ({
  runs,
  onSelectRun,
  className = "",
}) => {
  return (
    <div
      role="group"
      aria-label="Stability history strip (oldest to newest)"
      className={`inline-flex items-center gap-[2px] ${className}`}
    >
      {runs.map((run, index) => {
        const bar = STATUS_CONFIG[run.status]?.barClass ?? "bg-neutral";
        return (
          <button
            key={run.id || index}
            type="button"
            onClick={() => onSelectRun?.(run.id)}
            title={run.label || `Run ${index + 1}: ${run.status}`}
            className={`${bar} w-[6px] h-4 rounded-[1px] transition-transform hover:scale-y-125 focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50`}
          />
        );
      })}
    </div>
  );
};
