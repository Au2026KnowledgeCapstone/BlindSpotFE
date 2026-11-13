"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRunDetail, type Run, type Result } from "@/features/analysis";
import { useRunEvents } from "@/features/analysis";
import { workspaceApi } from "@/features/workspace";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { CostChip } from "@/shared/ui/CostChip";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { Button } from "@/components/ui/button";
import { ResultCard } from "./result-card";

type RunDetailResult = ReturnType<typeof useRunDetail>;

function durationSeconds(run: Run): number {
  if (!run.startedAt || !run.completedAt) return 0;
  return Math.max(0, (new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000);
}

function BackToRuns({ projectId, message }: { projectId: string; message: string }) {
  return (
    <div role="alert" className="space-y-3">
      <p className="text-sm text-fail">{message}</p>
      <Link href={`/projects/${projectId}/runs`} className="text-sm text-accent underline">Back to runs</Link>
    </div>
  );
}

// eslint-disable-next-line complexity -- Status, cancellation state and action belong in one run summary header.
function RunHeader({ run, onCancel, cancelling, requestPending }: { run: Run; onCancel: () => void; cancelling: boolean; requestPending: boolean }) {
  const cancellable = (run.status === "queued" || run.status === "running") && !run.cancelRequested && !requestPending;
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-panel p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-fg">Run #{run.runNumber}</h1>
          <StatusBadge status={run.status} />
        </div>
        <p className="text-xs text-fg-secondary">
          Queued {new Date(run.queuedAt).toLocaleString()}
          {run.engine && <> · engine: {run.engine}</>}
          {run.status === "queued" && <> · waiting for an analysis worker</>}
        </p>
        {run.error && <p className="text-xs text-fail">{run.error}</p>}
        {(run.cancelRequested || requestPending) && (run.status === "queued" || run.status === "running") && <p role="status" className="text-xs text-warn">Cancellation requested. Waiting for the worker to stop.</p>}
      </div>
      <div className="flex items-center gap-3">
        <CostChip durationSeconds={durationSeconds(run)} actionsCount={run.actionCount} estimatedCostUsd={run.estimatedCostUsd ?? 0} mode="Agentic" />
        {cancellable && <Button variant="outline" size="sm" disabled={cancelling} onClick={onCancel}>{cancelling ? "Cancelling…" : "Cancel run"}</Button>}
      </div>
    </div>
  );
}

function ResultsSection({ results, runStatus }: { results: RunDetailResult["results"]; runStatus: Run["status"] }) {
  if (results.isPending) return <p role="status" className="text-xs text-fg-tertiary">Loading results…</p>;
  if (results.isError) {
    return (
      <div role="alert" className="space-y-2 rounded-xl border border-border bg-panel p-4 text-sm">
        <p>{results.error.message}</p>
        <Button variant="outline" size="sm" onClick={() => void results.refetch()}>Retry</Button>
      </div>
    );
  }
  const items: Result[] = results.data ?? [];
  if (!items.length) {
    const queued = runStatus === "queued";
    return <EmptyState title={queued ? "Waiting for a worker" : "No results yet"} description={queued ? "This run is queued but hasn't started — results appear once it runs." : "Results will appear here as each requirement finishes."} />;
  }
  return <div className="space-y-4">{items.map((result) => <ResultCard key={result.id} result={result} />)}</div>;
}

function useCancel(projectId: string, environmentId: string | undefined, runId: string, onDone: () => Promise<unknown>) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [requestPending, setRequestPending] = useState(false);
  async function cancel() {
    if (cancelling || !environmentId) return;
    setCancelling(true);
    setCancelError("");
    try {
      const response = await workspaceApi.cancelRun(projectId, environmentId, runId);
      setRequestPending(response.status === "cancellation_requested");
      await onDone();
    }
    catch (cause) { setCancelError(cause instanceof Error ? cause.message : "Could not cancel the run."); }
    finally { setCancelling(false); }
  }
  return { cancelling, cancelError, requestPending, cancel };
}

// eslint-disable-next-line complexity -- Keep the run, SSE, cancellation and result states coordinated.
export function RunDetailContent({ projectId, runId, environmentId }: { projectId: string; runId: string; environmentId: string | undefined }) {
  const { run, results } = useRunDetail(projectId, environmentId, runId);
  const { cancelling, cancelError, requestPending, cancel } = useCancel(projectId, environmentId, runId, () => run.refetch());
  const active = run.data?.status === "queued" || run.data?.status === "running";
  const streamState = useRunEvents(projectId, environmentId, runId, active);

  if (!environmentId) return <BackToRuns projectId={projectId} message="This run's environment is missing from the link." />;
  if (run.isPending) return <LoadingScreen label="Loading run detail" />;
  if (run.isError || !run.data) return <BackToRuns projectId={projectId} message={run.error instanceof Error ? run.error.message : "This run could not be loaded."} />;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader title="Run detail" description="One result per requirement, with the evidence behind each verdict." />
      <RunHeader run={run.data} onCancel={() => void cancel()} cancelling={cancelling} requestPending={requestPending} />
      {active && <p role="status" className="text-xs text-fg-tertiary">{streamState === "live" ? "Live run updates connected" : streamState === "reconnecting" ? "Reconnecting run updates…" : streamState === "connecting" ? "Connecting run updates…" : "Live updates unavailable"}</p>}
      {cancelError && <p role="alert" className="text-xs text-fail">{cancelError}</p>}
      <ResultsSection results={results} runStatus={run.data.status} />
    </div>
  );
}
