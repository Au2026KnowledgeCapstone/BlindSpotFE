"use client";

import React, { useState } from "react";
import { useRunDetail, useRunSelection, useLiveRunEvents, deriveLiveRunState } from "@/features/runs";
import { StreamStatusBar } from "./stream-status-bar";
import { RunHeader } from "./run-header";
import { FailureSummary } from "./failure-summary";
import { StepsPane } from "./steps-pane";
import { EvidencePane } from "./evidence-pane";
import { DetailsTabs } from "./details-tabs";
import { Button } from "@/components/ui/button";

function RunStatusLayout({ runId }: { runId: string }) {
  const { data } = useRunDetail(runId);
  const { events, streamState } = useLiveRunEvents(runId);
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

export function RunDetailContent({ runId }: { runId: string }) {
  const { data, isLoading, error } = useRunDetail(runId);
  const [revealed, setRevealed] = useState(false);
  if (isLoading) return <div className="flex items-center justify-center min-h-[400px] text-xs font-mono text-fg-tertiary">Loading run details and execution trace...</div>;
  if (error || !data) return <div role="status" className="p-6 border border-border bg-panel rounded-lg text-sm text-fg-secondary">Run details are unavailable until the project execution service is integrated.</div>;
  return (
    <div className="relative">
      <div className={revealed ? "" : "pointer-events-none select-none blur-sm"}>
        <RunStatusLayout runId={runId} />
      </div>
      {!revealed && (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-3">
          <span className="px-4 py-2 rounded-md border border-border bg-panel text-sm font-semibold text-fg shadow-overlay">
            Work in progress
          </span>
          <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>
            See page anyways
          </Button>
        </div>
      )}
    </div>
  );
}
