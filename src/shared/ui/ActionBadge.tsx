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

/**
 * Literal utility classes, not `var(--bs-*)` strings: a dynamically assembled
 * class name would never reach Tailwind's JIT scan, and inline styles can't be
 * overridden by a caller's className or carry variants.
 */
const ACTION_CONFIG: Record<ActionType, string> = {
  NAVIGATE: "bg-accent-tint text-accent border-accent-tint",
  NETWORK: "bg-accent-tint text-accent border-accent-tint",
  CLICK: "bg-selected text-fg border-strong",
  FILL: "bg-selected text-fg border-strong",
  WAIT: "bg-hover text-fg-tertiary border-subtle",
  OBSERVE: "bg-hover text-fg-tertiary border-subtle",
  RECOVERY: "bg-warn-tint text-warn border-warn-border",
  HEAL: "bg-healed-tint text-healed border-healed-border",
  FAIL_STEP: "bg-fail-tint text-fail border-fail-border",
  COMPLETE_STEP: "bg-pass-tint text-pass border-pass-border",
};

export const ActionBadge: React.FC<ActionBadgeProps> = ({
  action,
  className = "",
}) => {
  const tone = ACTION_CONFIG[action] || ACTION_CONFIG.OBSERVE;

  return (
    <span
      className={`${tone} inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-[11px] font-semibold uppercase tracking-wide leading-none ${className}`}
    >
      {action}
    </span>
  );
};
