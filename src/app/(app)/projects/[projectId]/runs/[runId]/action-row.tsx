"use client";

import React from "react";
import type { Action } from "@/features/runs";
import { ActionBadge } from "@/shared/ui/ActionBadge";
import { Inference } from "@/shared/ui/Inference";

export interface ActionRowProps {
  action: Action;
  isSelected: boolean;
  onSelect: (action: Action, e: React.MouseEvent) => void;
  isPresentationMode?: boolean | undefined;
}

function rowClass(action: Action, isSelected: boolean): string {
  const isFail = action.badgeType === "FAIL_STEP" || action.resultStatus === "bad";
  if (isFail) {
    return "border-l-2 border-l-[var(--bs-fail)] border-[var(--bs-fail-border)] bg-[var(--bs-fail-tint)] text-[var(--bs-fail)]";
  }
  const isAmber = action.badgeType === "RECOVERY" || action.badgeType === "HEAL";
  if (isAmber) {
    return "border-l-2 border-l-[var(--bs-warn)] border-[var(--bs-warn-border)] bg-[var(--bs-warn-tint)] text-[var(--bs-warn)]";
  }
  if (isSelected) {
    return "border-[var(--bs-accent)] bg-[var(--bs-bg-selected)] text-[var(--bs-text-primary)]";
  }
  return "border-transparent bg-[var(--bs-bg-panel)] text-[var(--bs-text-secondary)] hover:bg-[var(--bs-bg-hover)]";
}

export function ActionRow({ action, isSelected, onSelect, isPresentationMode }: ActionRowProps) {
  const descSizeClass = isPresentationMode ? "text-lg font-medium" : "text-[11px]";

  return (
    <button
      type="button"
      aria-current={isSelected}
      onClick={(e) => onSelect(action, e)}
      className={`w-full text-left p-2 rounded border transition-all duration-180 ease-out focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bs-focus-ring)] ${rowClass(
        action,
        isSelected
      )}`}
    >
      <span className="flex items-center justify-between gap-2 mb-1">
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] tabular-nums text-[var(--bs-text-tertiary)]">
            {action.timestamp}
          </span>
          <ActionBadge action={action.badgeType} />
        </span>
        {action.target && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bs-bg-raised)] text-[var(--bs-text-tertiary)] truncate max-w-[120px]">
            {action.target}
          </span>
        )}
      </span>

      <span className={`block text-[var(--bs-text-primary)] ${descSizeClass}`}>
        {action.description}
      </span>

      {action.reasoning && (
        <span className="block mt-1.5">
          <Inference compact title="Reasoning">
            {action.reasoning}
          </Inference>
        </span>
      )}
    </button>
  );
}
