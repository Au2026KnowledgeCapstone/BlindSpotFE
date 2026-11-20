"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRunDetail, type Run, type Result } from "@/features/analysis";
import { useRunEvents } from "@/features/analysis";
import { workspaceApi } from "@/features/workspace";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { Button } from "@/components/ui/button";
import { ResultsList } from "./results-list";
import { ResultsSummary, ShareReport } from "@/features/analysis";

type RunDetailResult = ReturnType<typeof useRunDetail>;

function BackToRuns({ projectId, message }: { projectId: string; message: string }) {
  return (
    <div role="alert" className="space-y-3">
      <p className="text-sm text-fail">{message}</p>
      <Link href={`/projects/${projectId}/runs`} className="text-sm text-accent underline">Back to runs</Link>
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
  return <ResultsList results={items} />;
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
      <Link href={`/projects/${projectId}/runs`} className="inline-flex items-center text-sm text-accent hover:underline">← All test runs</Link>
      <PageHeader title="Testing report" actions={!results.isPending && !results.isError ? <ShareReport run={run.data} results={results.data ?? []} /> : undefined} />
      {!results.isPending && !results.isError && <ResultsSummary run={run.data} results={results.data ?? []} />}
      {active && <Button variant="outline" size="sm" disabled={cancelling || requestPending || run.data.cancelRequested} onClick={() => void cancel()}>{cancelling ? "Cancelling…" : requestPending || run.data.cancelRequested ? "Cancellation requested" : "Cancel run"}</Button>}
      {active && <p role="status" className="text-xs text-fg-tertiary">{streamState === "live" ? "Live run updates connected" : streamState === "reconnecting" ? "Reconnecting run updates…" : streamState === "connecting" ? "Connecting run updates…" : "Live updates unavailable"}</p>}
      {cancelError && <p role="alert" className="text-xs text-fail">{cancelError}</p>}
      <ResultsSection results={results} runStatus={run.data.status} />
    </div>
  );
}
