"use client";

import React, { useState } from "react";
import { useRunDetail, useRunSelection, useLiveRunEvents, deriveLiveRunState } from "@/features/runs";
import { StreamStatusBar } from "./stream-status-bar";
import { RunHeader } from "./run-header";
import { FailureSummary } from "./failure-summary";
import { StepsPane } from "./steps-pane";
import { EvidencePane } from "./evidence-pane";
import { DetailsTabs } from "./details-tabs";

function RunStatusLayout({ runId, liveIntervalMs }: { runId: string; liveIntervalMs?: number | undefined }) {
  const { data } = useRunDetail(runId);
  const { events, streamState } = useLiveRunEvents(runId, liveIntervalMs !== undefined ? { intervalMs: liveIntervalMs } : {});
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const steps = data?.steps ?? [];
  const selection = useRunSelection(steps);

  if (!data) return null;
  const { currentStepNumber, analysisState } = deriveLiveRunState(events);
  const toggleStep = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <StreamStatusBar
        streamState={streamState}
        analysisState={analysisState}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode((prev) => !prev)}
      />
      <RunHeader run={data.run} />
      <FailureSummary failure={data.failure} lastPassingRunNumber={data.run.runNumber - 1} firstFailingRunNumber={data.run.runNumber} />
      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)_400px] gap-4 items-start">
        <StepsPane
          steps={steps}
          selection={selection}
          collapsedIds={collapsedIds}
          currentStepNumber={currentStepNumber}
          isPresentationMode={isPresentationMode}
          onToggleExpand={toggleStep}
        />
        <EvidencePane steps={steps} selection={selection} />
        <DetailsTabs steps={steps} currentStep={selection.currentStep} failure={data.failure} activeTab={selection.tab} onSelectTab={selection.selectTab} />
      </div>
    </div>
  );
}

export function RunDetailContent({ runId, liveIntervalMs }: { runId: string; liveIntervalMs?: number | undefined }) {
  const { data, isLoading, error } = useRunDetail(runId);
  if (isLoading) return <div className="flex items-center justify-center min-h-[400px] text-xs font-mono text-[var(--bs-text-tertiary)]">Loading run details and execution trace...</div>;
  if (error || !data) return <div className="p-6 border border-[var(--bs-fail-border)] bg-[var(--bs-fail-tint)] rounded-lg text-xs text-[var(--bs-fail)]">Failed to load run details. Please check connection or run ID.</div>;
  return <RunStatusLayout runId={runId} liveIntervalMs={liveIntervalMs} />;
}
