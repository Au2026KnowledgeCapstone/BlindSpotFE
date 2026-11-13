import React from "react";
import { VERDICT_CONFIG, type Verdict } from "./status-config";

export interface VerdictBadgeProps {
  verdict: Verdict;
  compact?: boolean;
  className?: string;
}

/** Same pill treatment as `StatusBadge`, for the verdict axis (pass/fail/inconclusive). */
export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  compact = false,
  className = "",
}) => {
  const config = VERDICT_CONFIG[verdict];
  const Icon = config.icon;
  const base = `${config.chipClass} inline-flex items-center rounded-full border text-xs font-medium focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50`;

  if (compact) {
    return (
      <span tabIndex={0} role="status" aria-label={config.label} title={config.label} className={`${base} justify-center w-5 h-5 ${className}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
    );
  }

  return (
    <span role="status" className={`${base} gap-1.5 h-5 px-2 ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
