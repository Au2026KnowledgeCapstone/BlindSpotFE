"use client";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, RotateCw } from "lucide-react";
import { workspaceApi, type WorkspaceApiTypes } from "@/features/workspace/workspace-api";
import { Button } from "@/components/ui/button";

const CIRCUMFERENCE = 263.894;

function Donut({ counts }: { counts: WorkspaceApiTypes["Dashboard"]["runs"] }) {
  const segments = [
    { label: "Passed", count: counts.runs_passed, tone: "text-green-600" },
    { label: "Failed", count: counts.runs_failed, tone: "text-red-600" },
    { label: "Inconclusive", count: counts.runs_inconclusive, tone: "text-yellow-500" },
  ];
  const total = counts.total_runs;
  const percentage = total ? Math.round((counts.runs_passed / total) * 1000) / 10 : 0;
  let offset = 0;
  return <div className="mt-5 grid items-center gap-8 rounded-[20px] border border-subtle bg-canvas p-6 2xl:grid-cols-2 sm:p-8"><div className="relative mx-auto size-44"><svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={`Run outcomes: ${counts.runs_passed} passed, ${counts.runs_failed} failed, ${counts.runs_inconclusive} inconclusive`}><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="9" className="text-border" />{segments.map((segment) => { const length = total ? (segment.count / total) * CIRCUMFERENCE : 0; const start = offset; offset += length; return <circle key={segment.label} cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="9" strokeDasharray={`${length} ${CIRCUMFERENCE - length}`} strokeDashoffset={-start} className={segment.tone} />; })}</svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[11px] uppercase tracking-wider text-fg-tertiary">Pass rate</span><strong className="mt-1 text-3xl tracking-tight">{total ? `${percentage}%` : "—"}</strong></div></div><ul className="space-y-5">{segments.map((segment) => <li key={segment.label} className="flex items-center gap-3 text-sm"><span className={`size-2.5 rounded-full bg-current ${segment.tone}`} /><span className="flex-1">{segment.label}</span><strong className="tabular-nums">{segment.count}</strong><span className="w-16 text-right font-mono text-xs text-fg-quaternary">({total ? ((segment.count / total) * 100).toFixed(1) : "0"}%)</span></li>)}</ul></div>;
}

/**
 * Counted by BE in one request. Reading it from the run list instead would
 * cost a results request per run, so this panel used to cover only the most
 * recent 50 — these figures span the project's whole history.
 */
export function RunTelemetry({ projectId }: { projectId: string }) {
  const dashboard = useQuery({
    queryKey: ["workspace", projectId, "dashboard"],
    queryFn: ({ signal }) => workspaceApi.projectDashboard(projectId, signal),
    retry: false,
    staleTime: 30000,
  });
  return <section className="rounded-[24px] border border-border bg-panel p-6 shadow-ambient sm:p-7"><h2 className="text-lg font-semibold">Runs Summary</h2><p className="mt-1 text-sm text-fg-tertiary">Every completed run in this project, across all environments.</p>
    {dashboard.isPending && <p role="status" className="mt-5 flex items-center gap-2 text-sm text-fg-tertiary"><LoaderCircle className="size-4 shrink-0 animate-spin" />Counting run outcomes…</p>}
    {dashboard.isError && <div role="alert" className="mt-5 space-y-3 rounded-[20px] border border-subtle bg-canvas p-6 text-sm"><p className="text-fail">{dashboard.error.message}</p><Button variant="outline" size="sm" onClick={() => void dashboard.refetch()}><RotateCw className="size-4" />Try again</Button></div>}
    {dashboard.isSuccess && <Donut counts={dashboard.data.runs} />}
  </section>;
}
