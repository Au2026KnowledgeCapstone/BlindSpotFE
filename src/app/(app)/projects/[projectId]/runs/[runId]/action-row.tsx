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
    return "border-l-2 border-l-fail border-fail-border bg-fail-tint text-fail";
  }
  const isAmber = action.badgeType === "RECOVERY" || action.badgeType === "HEAL";
  if (isAmber) {
    return "border-l-2 border-l-warn border-warn-border bg-warn-tint text-warn";
  }
  if (isSelected) {
    return "border-accent bg-selected text-fg";
  }
  return "border-transparent bg-panel text-fg-secondary hover:bg-hover";
}

export function ActionRow({ action, isSelected, onSelect, isPresentationMode }: ActionRowProps) {
  const descSizeClass = isPresentationMode ? "text-lg font-medium" : "text-[11px]";

  return (
    <button
      type="button"
      aria-current={isSelected}
      onClick={(e) => onSelect(action, e)}
      className={`w-full text-left p-2 rounded border transition-all duration-180 ease-out focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 ${rowClass(
        action,
        isSelected
      )}`}
    >
      <span className="flex items-center justify-between gap-2 mb-1">
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] tabular-nums text-fg-tertiary">
            {action.timestamp}
          </span>
          <ActionBadge action={action.badgeType} />
        </span>
        {action.target && (
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-raised text-fg-tertiary truncate max-w-[120px]">
            {action.target}
          </span>
        )}
      </span>

      <span className={`block text-fg ${descSizeClass}`}>
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
