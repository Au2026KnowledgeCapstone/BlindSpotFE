"use client";

import { useEffect } from "react";

export interface UseKeyboardShortcutsOptions {
  onNextStep?: (() => void) | undefined;
  onPrevStep?: (() => void) | undefined;
  onEscape?: (() => void) | undefined;
  enabled?: boolean | undefined;
}

function isEditableTarget(target: HTMLElement | null): boolean {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function processKey(
  key: string,
  handlers: UseKeyboardShortcutsOptions
) {
  const k = key.toLowerCase();
  if (k === "j") handlers.onNextStep?.();
  else if (k === "k") handlers.onPrevStep?.();
  else if (key === "Escape") handlers.onEscape?.();
}

/**
 * Keyboard navigation hook for run detail screens (§P8 hardening):
 * - `j`: move to next step
 * - `k`: move to previous step
 * - `Esc`: close active overlays / dialogs
 */
export function useKeyboardShortcuts({
  onNextStep,
  onPrevStep,
  onEscape,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target as HTMLElement | null)) return;
      processKey(event.key, { onNextStep, onPrevStep, onEscape });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNextStep, onPrevStep, onEscape, enabled]);
}
