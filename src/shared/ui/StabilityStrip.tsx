import React from "react";
import { type RunStatus } from "./status-config";

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

const STATUS_COLOR_MAP: Record<RunStatus, string> = {
  passed: "var(--bs-pass)",
  passed_healed: "var(--bs-healed)",
  failed: "var(--bs-fail)",
  regression: "var(--bs-fail)",
  agent_error: "var(--bs-neutral)",
  flaky: "var(--bs-warn)",
  running: "var(--bs-accent)",
  queued: "var(--bs-neutral)",
  cancelled: "var(--bs-neutral)",
};

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
        const color = STATUS_COLOR_MAP[run.status] || "var(--bs-neutral)";
        return (
          <button
            key={run.id || index}
            type="button"
            onClick={() => onSelectRun?.(run.id)}
            title={run.label || `Run ${index + 1}: ${run.status}`}
            style={{ backgroundColor: color }}
            className="w-[6px] h-4 rounded-[1px] transition-transform hover:scale-y-125 focus:outline-none focus:ring-1 focus:ring-[var(--bs-focus-ring)]"
          />
        );
      })}
    </div>
  );
};
