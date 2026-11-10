"use client";

import React from "react";
import type { StreamState, AnalysisState } from "@/features/runs";
import { Sparkles, Monitor } from "lucide-react";

export interface StreamStatusBarProps {
  streamState: StreamState;
  analysisState: AnalysisState;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
}

function StreamStateBadge({ streamState }: { streamState: StreamState }) {
  if (streamState === "unavailable") return <span data-testid="stream-state-badge" className="text-xs text-fg-tertiary">Live updates unavailable</span>;
  if (streamState === "connecting") return <span data-testid="stream-state-badge" className="text-xs text-fg-tertiary">Connecting stream…</span>;
  if (streamState === "live") return <span data-testid="stream-state-badge" className="text-xs text-pass">LIVE</span>;
  if (streamState === "reconnecting") return <span data-testid="stream-state-badge" className="text-xs text-warn">Reconnecting stream…</span>;
  return <span data-testid="stream-state-badge" className="text-xs text-fg-tertiary">Stream ended</span>;
}

function AnalysisBanner({ analysisState }: { analysisState: AnalysisState }) {
  if (analysisState !== "running") return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-infer-tint border border-infer-border text-xs font-medium text-infer animate-pulse">
      <Sparkles className="w-4 h-4 text-infer" aria-hidden="true" />
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
    ? "bg-accent-tint text-accent border-accent ring-1 ring-accent"
    : "bg-raised text-fg border-border hover:bg-hover";

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-panel border border-border">
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
