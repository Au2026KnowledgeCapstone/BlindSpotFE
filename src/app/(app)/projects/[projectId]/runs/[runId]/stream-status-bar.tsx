"use client";

import React from "react";
import type { StreamState, AnalysisState } from "@/features/runs";
import { Radio, LoaderCircle, Sparkles, Monitor } from "lucide-react";

export interface StreamStatusBarProps {
  streamState: StreamState;
  analysisState: AnalysisState;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
}

function ConnectingBadge() {
  return (
    <span
      data-testid="stream-state-badge"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bs-neutral-tint)] text-[var(--bs-text-secondary)] border border-[var(--bs-neutral-border)]"
    >
      <LoaderCircle className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
      <span>Connecting stream...</span>
    </span>
  );
}

function LiveBadge() {
  return (
    <span
      data-testid="stream-state-badge"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--bs-pass-tint)] text-[var(--bs-pass)] border border-[var(--bs-pass-border)]"
    >
      <span className="w-2 h-2 rounded-full bg-[var(--bs-pass)] animate-pulse" aria-hidden="true" />
      <span>LIVE</span>
    </span>
  );
}

function ReconnectingBadge() {
  return (
    <span
      data-testid="stream-state-badge"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bs-warn-tint)] text-[var(--bs-warn)] border border-[var(--bs-warn-border)]"
    >
      <Radio className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
      <span>Reconnecting stream...</span>
    </span>
  );
}

function StreamStateBadge({ streamState }: { streamState: StreamState }) {
  if (streamState === "connecting") return <ConnectingBadge />;
  if (streamState === "live") return <LiveBadge />;
  if (streamState === "reconnecting") return <ReconnectingBadge />;
  return (
    <span
      data-testid="stream-state-badge"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bs-bg-raised)] text-[var(--bs-text-tertiary)] border border-[var(--bs-border-subtle)]"
    >
      <span>Stream Ended</span>
    </span>
  );
}

function AnalysisBanner({ analysisState }: { analysisState: AnalysisState }) {
  if (analysisState !== "running") return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bs-infer-tint)] border border-[var(--bs-infer-border)] text-xs font-medium text-[var(--bs-infer)] animate-pulse">
      <Sparkles className="w-4 h-4 text-[var(--bs-infer)]" aria-hidden="true" />
      <span>Analyzing failure…</span>
    </div>
  );
}

export function StreamStatusBar({
  streamState,
  analysisState,
  isPresentationMode,
  onTogglePresentationMode,
}: StreamStatusBarProps) {
  const modeBtnClass = isPresentationMode
    ? "bg-[var(--bs-accent-tint)] text-[var(--bs-accent)] border-[var(--bs-accent)] ring-1 ring-[var(--bs-accent)]"
    : "bg-[var(--bs-bg-raised)] text-[var(--bs-text-primary)] border-[var(--bs-border-default)] hover:bg-[var(--bs-bg-hover)]";

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[var(--bs-bg-panel)] border border-[var(--bs-border-default)]">
      <div className="flex items-center gap-3">
        <StreamStateBadge streamState={streamState} />
        <AnalysisBanner analysisState={analysisState} />
      </div>

      <button
        type="button"
        onClick={onTogglePresentationMode}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${modeBtnClass}`}
      >
        <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Presentation mode</span>
      </button>
    </div>
  );
}
