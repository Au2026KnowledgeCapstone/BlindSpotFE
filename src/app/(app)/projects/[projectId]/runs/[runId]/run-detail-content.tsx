"use client";

import React, { useState } from "react";
import { useRunDetail, useRunSelection } from "@/features/runs";
import { RunHeader } from "./run-header";
import { FailureSummary } from "./failure-summary";
import { StepsPane } from "./steps-pane";
import { EvidencePane } from "./evidence-pane";
import { DetailsTabs } from "./details-tabs";

function RunLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px] text-xs font-mono text-[var(--bs-text-tertiary)]">
      Loading run details and execution trace...
    </div>
  );
}

function RunErrorState() {
  return (
    <div className="p-6 border border-[var(--bs-fail-border)] bg-[var(--bs-fail-tint)] rounded-lg text-xs text-[var(--bs-fail)]">
      Failed to load run details. Please check connection or run ID.
    </div>
  );
}

export function RunDetailContent({ runId }: { runId: string }) {
  const { data, isLoading, error } = useRunDetail(runId);
  const steps = data?.steps ?? [];
  const selection = useRunSelection(steps);
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

  if (isLoading) return <RunLoadingState />;
  if (error || !data) return <RunErrorState />;

  const toggleStepExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <RunHeader run={data.run} />
      <FailureSummary
        failure={data.failure}
        lastPassingRunNumber={data.run.runNumber - 1}
        firstFailingRunNumber={data.run.runNumber}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)_400px] gap-4 items-start">
        <StepsPane
          steps={steps}
          selection={selection}
          collapsedIds={collapsedIds}
          onToggleExpand={toggleStepExpand}
        />
        <EvidencePane steps={steps} selection={selection} />
        <DetailsTabs
          steps={steps}
          currentStep={selection.currentStep}
          failure={data.failure}
          activeTab={selection.tab}
          onSelectTab={selection.selectTab}
        />
      </div>
    </div>
  );
}
