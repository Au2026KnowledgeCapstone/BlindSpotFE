import React from "react";

export interface CostChipProps {
  durationSeconds: number;
  actionsCount: number;
  estimatedCostUsd: number;
  mode?: "Replay" | "Agentic";
  className?: string;
}

export const CostChip: React.FC<CostChipProps> = ({
  durationSeconds,
  actionsCount,
  estimatedCostUsd,
  mode = "Agentic",
  className = "",
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--bs-bg-panel)",
        borderColor: "var(--bs-border-default)",
        color: "var(--bs-text-tertiary)",
      }}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono text-[11px] tabular-nums ${className}`}
    >
      <span>⏱ {durationSeconds.toFixed(1)}s</span>
      <span>·</span>
      <span>{actionsCount} actions</span>
      <span>·</span>
      <span>~${estimatedCostUsd.toFixed(2)}</span>
      <span>·</span>
      <span className="font-sans text-[var(--bs-text-secondary)] font-medium">
        {mode}
      </span>
    </div>
  );
};
