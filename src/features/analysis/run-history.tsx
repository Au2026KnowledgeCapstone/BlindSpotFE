"use client";
import { useQueries, useQuery } from "@tanstack/react-query";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { mapResult } from "./api/map-result";
import { summarizeResults } from "./result-summary";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, CircleCheck, CircleX, CircleAlert, LoaderCircle } from "lucide-react";
import type { Run } from "./types";
import { Button } from "@/components/ui/button";
import { Select } from "@/shared/ui/Select";

function runOutcome(run: Run, data?: Awaited<ReturnType<typeof workspaceApi.listResults>>) {
  const summary = data?.length ? summarizeResults(run, data.map(mapResult)) : null;
  const outcome = summary?.outcome === "PASS" || summary?.outcome === "FAIL" ? summary.outcome : "INCONCLUSIVE";
  return { summary, outcome };
}
// eslint-disable-next-line complexity -- Share loading, verdict, and score presentation between the row icon and badge.
function RunOutcome({ run, iconOnly = false }: { run: Run; iconOnly?: boolean }) {
  const results = useQuery({ queryKey: ["workspace", run.projectId, "runs", run.environmentId, run.id, "results", "telemetry"], queryFn: () => workspaceApi.listResults(run.projectId, run.environmentId, run.id), enabled: run.status === "completed", retry: false, staleTime: 30000 });
  const { summary, outcome } = runOutcome(run, results.data);
  const Icon = outcome === "PASS" ? CircleCheck : outcome === "FAIL" ? CircleX : CircleAlert;
  const verdictClass = outcome === "PASS" ? "bg-pass-tint text-pass" : outcome === "FAIL" ? "bg-fail-tint text-fail" : "bg-warn-tint text-warn";
  if (iconOnly) return <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${verdictClass}`}>{run.status === "completed" && results.isPending ? <LoaderCircle aria-label="Loading outcome" className="size-5 animate-spin" /> : <Icon aria-label={outcome} className="size-5" />}</span>;
  return <div className="flex items-center gap-2">{run.status === "completed" && results.isPending ? <LoaderCircle aria-label="Loading outcome" className="size-4 animate-spin text-fg-tertiary" /> : <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${verdictClass}`}>{outcome}{outcome !== "INCONCLUSIVE" && summary?.score !== null && summary?.score !== undefined ? ` (${summary.score}%)` : ""}</span>}</div>;
}

function HistoryRow({ run }: { run: Run }) {
  const href = `/projects/${run.projectId}/runs/${run.id}?environmentId=${run.environmentId}`;
  const requirementName = run.requirementSnapshots.map((item) => item.title).filter(Boolean).join(", ") || "Untitled requirement";
  return <li className="flex flex-wrap items-center gap-4 border-t border-subtle px-6 py-6"><RunOutcome run={run} iconOnly /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={href} className="rounded text-sm font-semibold hover:underline focus-visible:ring-3 focus-visible:ring-focus-ring/50">{requirementName} · Run #{run.runNumber}</Link><span className="rounded-md bg-raised px-2 py-1 font-mono text-[11px] text-fg-tertiary">{run.id.slice(0, 7)}</span><time dateTime={run.queuedAt} className="text-xs text-fg-tertiary">{new Date(run.queuedAt).toLocaleString()}</time></div></div><RunOutcome run={run} /><Link href={href} className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2.5 text-xs font-medium hover:bg-hover focus-visible:ring-3 focus-visible:ring-focus-ring/50">Inspect Report <ArrowRight className="size-3.5" /></Link></li>;
}
export function RunHistory({ runs }: { runs: Run[] }) {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("newest");
  const [page, setPage] = useState(0);
  const outcomes = useQueries({ queries: runs.map((run) => ({
    queryKey: ["workspace", run.projectId, "runs", run.environmentId, run.id, "results", "telemetry"],
    queryFn: () => workspaceApi.listResults(run.projectId, run.environmentId, run.id),
    enabled: run.status === "completed", retry: false, staleTime: 30000,
  })) });
  const filtered = runs.filter((run, index) => {
    const query = outcomes[index];
    if (status !== "all" && run.status === "completed" && query?.isPending) return false;
    const { outcome } = runOutcome(run, query?.data);
    return (status === "all" || outcome === status) && `run #${run.runNumber} ${run.id} ${run.requirementSnapshots.map((item) => item.title).join(" ")}`.toLowerCase().includes(search.trim().toLowerCase());
  });
  const sorted = [...filtered].sort((a, b) => (new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime()) * (order === "newest" ? 1 : -1));
  const pageCount = Math.max(1, Math.ceil(sorted.length / 10));
  const currentPage = Math.min(page, pageCount - 1);
  return <div className="overflow-hidden rounded-[24px] border border-border bg-panel shadow-ambient"><div className="flex flex-wrap justify-between gap-5 p-6"><div><h3 className="text-lg font-semibold tracking-tight">Execution Trail &amp; Run History</h3><p className="mt-1 text-sm text-fg-tertiary">Traceable browser logs and requirement validation.</p></div><div className="space-y-3"><label className="relative block"><span className="sr-only">Search runs</span><Search className="absolute left-4 top-3 size-4 text-fg-tertiary" /><input type="search" className="h-10 w-full rounded-full bg-raised pl-11 pr-4 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50" placeholder="Search run or requirement…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} /></label><div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor="history-status">Test outcome</label><Select id="history-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}><option value="all">All runs</option><option value="PASS">Pass</option><option value="FAIL">Fail</option><option value="INCONCLUSIVE">Inconclusive</option></Select><label className="sr-only" htmlFor="history-order">Sort by</label><Select id="history-order" value={order} onChange={(event) => { setOrder(event.target.value); setPage(0); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></Select></div></div></div>{outcomes.some((query) => query.isFetching) && <p role="status" className="px-6 pb-4 text-sm text-fg-tertiary">Loading run outcomes…</p>}{outcomes.some((query) => query.isError) && <p role="alert" className="px-6 pb-4 text-sm text-fail">Some run outcomes could not be loaded and are shown as inconclusive.</p>}<ul>{sorted.slice(currentPage * 10, currentPage * 10 + 10).map((run) => <HistoryRow key={run.id} run={run} />)}</ul>{!sorted.length && <p className="border-t border-subtle px-6 py-12 text-center text-sm text-fg-tertiary">{runs.length ? "No analyses match your filters." : "No analyses yet. Start your first test run from the project."}</p>}<div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle px-6 py-5 text-xs text-fg-tertiary"><p role="status">{filtered.length} matching runs</p><div className="flex items-center gap-3"><Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button><span>Page {currentPage + 1} of {pageCount}</span><Button variant="outline" size="sm" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div></div>;
}
