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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-tint text-fg-secondary border border-neutral-border"
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pass-tint text-pass border border-pass-border"
    >
      <span className="w-2 h-2 rounded-full bg-pass animate-pulse" aria-hidden="true" />
      <span>LIVE</span>
    </span>
  );
}

function ReconnectingBadge() {
  return (
    <span
      data-testid="stream-state-badge"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warn-tint text-warn border border-warn-border"
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-raised text-fg-tertiary border border-subtle"
    >
      <span>Stream Ended</span>
    </span>
  );
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
