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

  const style: React.CSSProperties = {
    backgroundColor: config.tintToken,
    color: config.token,
    borderColor: config.borderToken,
  };

  if (compact) {
    return (
      <span
        tabIndex={0}
        role="status"
        aria-label={config.label}
        title={config.label}
        style={style}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)] ${className}`}
      >
        <Icon className={`w-3.5 h-3.5 ${config.spins ? "animate-spin" : ""}`} />
        {SecondaryIcon && <SecondaryIcon className="w-2.5 h-2.5 -ml-1" />}
      </span>
    );
  }

  return (
    <span
      role="status"
      style={style}
      className={`inline-flex items-center gap-1.5 h-5 px-2 rounded-full border text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)] ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.spins ? "animate-spin" : ""}`} />
      {SecondaryIcon && <SecondaryIcon className="w-3 h-3 -ml-0.5" />}
      <span>{config.label}</span>
    </span>
  );
};
