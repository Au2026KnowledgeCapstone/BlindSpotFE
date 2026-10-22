import React from "react";
import { STATUS_CONFIG, type RunStatus } from "./status-config";

export interface StatusBadgeProps {
  status: RunStatus;
  compact?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  compact = false,
  className = "",
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const SecondaryIcon = config.secondaryIcon;

  const base = `${config.chipClass} inline-flex items-center rounded-full border text-xs font-medium focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50`;

  if (compact) {
    return (
      <span
        tabIndex={0}
        role="status"
        aria-label={config.label}
        title={config.label}
        className={`${base} justify-center w-5 h-5 ${className}`}
      >
        <Icon className={`w-3.5 h-3.5 ${config.spins ? "animate-spin" : ""}`} />
        {SecondaryIcon && <SecondaryIcon className="w-2.5 h-2.5 -ml-1" />}
      </span>
    );
  }

  return (
    <span role="status" className={`${base} gap-1.5 h-5 px-2 ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${config.spins ? "animate-spin" : ""}`} />
      {SecondaryIcon && <SecondaryIcon className="w-3 h-3 -ml-0.5" />}
      <span>{config.label}</span>
    </span>
  );
};
