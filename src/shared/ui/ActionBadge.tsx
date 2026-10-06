import React from "react";

export type ActionType =
  | "NAVIGATE"
  | "CLICK"
  | "FILL"
  | "WAIT"
  | "OBSERVE"
  | "NETWORK"
  | "RECOVERY"
  | "HEAL"
  | "FAIL_STEP"
  | "COMPLETE_STEP";

export interface ActionBadgeProps {
  action: ActionType;
  className?: string;
}

interface ActionBadgeConfig {
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const ACTION_CONFIG: Record<ActionType, ActionBadgeConfig> = {
  NAVIGATE: {
    bgColor: "var(--bs-accent-tint)",
    textColor: "var(--bs-accent)",
    borderColor: "var(--bs-accent-tint)",
  },
  NETWORK: {
    bgColor: "var(--bs-accent-tint)",
    textColor: "var(--bs-accent)",
    borderColor: "var(--bs-accent-tint)",
  },
  CLICK: {
    bgColor: "var(--bs-bg-selected)",
    textColor: "var(--bs-text-primary)",
    borderColor: "var(--bs-border-strong)",
  },
  FILL: {
    bgColor: "var(--bs-bg-selected)",
    textColor: "var(--bs-text-primary)",
    borderColor: "var(--bs-border-strong)",
  },
  WAIT: {
    bgColor: "var(--bs-bg-hover)",
    textColor: "var(--bs-text-tertiary)",
    borderColor: "var(--bs-border-subtle)",
  },
  OBSERVE: {
    bgColor: "var(--bs-bg-hover)",
    textColor: "var(--bs-text-tertiary)",
    borderColor: "var(--bs-border-subtle)",
  },
  RECOVERY: {
    bgColor: "var(--bs-warn-tint)",
    textColor: "var(--bs-warn)",
    borderColor: "var(--bs-warn-border)",
  },
  HEAL: {
    bgColor: "var(--bs-healed-tint)",
    textColor: "var(--bs-healed)",
    borderColor: "var(--bs-healed-border)",
  },
  FAIL_STEP: {
    bgColor: "var(--bs-fail-tint)",
    textColor: "var(--bs-fail)",
    borderColor: "var(--bs-fail-border)",
  },
  COMPLETE_STEP: {
    bgColor: "var(--bs-pass-tint)",
    textColor: "var(--bs-pass)",
    borderColor: "var(--bs-pass-border)",
  },
};

export const ActionBadge: React.FC<ActionBadgeProps> = ({
  action,
  className = "",
}) => {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.OBSERVE;

  return (
    <span
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor,
      }}
      className={`inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-[11px] font-semibold uppercase tracking-wide leading-none ${className}`}
    >
      {action}
    </span>
  );
};
