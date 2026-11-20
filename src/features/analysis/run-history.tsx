"use client";
import { useState } from "react";
import { summarizeResults } from "./result-summary";
import Link from "next/link";
import { ArrowRight, Search, CircleCheck, CircleX, CircleAlert, LoaderCircle } from "lucide-react";
import type { Run } from "./types";
import { RUN_OUTCOME_LIMIT, useRunOutcomes, type RunOutcome as RunOutcomeData } from "./use-run-outcomes";
import { Button } from "@/components/ui/button";
import { Select } from "@/shared/ui/Select";

const PAGE_SIZE = 10;

const VERDICT = {
  PASS: { icon: CircleCheck, tone: "bg-pass-tint text-pass" },
  FAIL: { icon: CircleX, tone: "bg-fail-tint text-fail" },
  INCONCLUSIVE: { icon: CircleAlert, tone: "bg-warn-tint text-warn" },
} as const;
type OutcomeVerdict = keyof typeof VERDICT;

/** A run reads as inconclusive until its results say otherwise, so a pending
 *  or errored read degrades the same way an ambiguous result does. */
function runOutcome(run: Run, outcome: RunOutcomeData | undefined) {
  const summary = outcome?.results?.length ? summarizeResults(run, outcome.results) : null;
  const verdict: OutcomeVerdict = summary?.outcome === "PASS" || summary?.outcome === "FAIL" ? summary.outcome : "INCONCLUSIVE";
  return { summary, outcome: verdict };
}

// Outcomes arrive from the parent, which owns the request budget: a row that
// fetched for itself would make the page cost one request per rendered run.
function RunOutcomeBadge({ run, outcome, iconOnly = false }: { run: Run; outcome: RunOutcomeData | undefined; iconOnly?: boolean }) {
  const { summary, outcome: verdict } = runOutcome(run, outcome);
  const { icon: Icon, tone } = VERDICT[verdict];
  const loading = run.status === "completed" && (outcome === undefined || outcome.isPending);
  const score = verdict !== "INCONCLUSIVE" && summary?.score != null ? ` (${summary.score}%)` : "";
  if (iconOnly) return <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}>{loading ? <LoaderCircle aria-label="Loading outcome" className="size-5 animate-spin" /> : <Icon aria-label={verdict} className="size-5" />}</span>;
  return <div className="flex items-center gap-2">{loading ? <LoaderCircle aria-label="Loading outcome" className="size-4 animate-spin text-fg-tertiary" /> : <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>{verdict}{score}</span>}</div>;
}

function HistoryRow({ run, outcome }: { run: Run; outcome: RunOutcomeData | undefined }) {
  const href = `/projects/${run.projectId}/runs/${run.id}?environmentId=${run.environmentId}`;
  const requirementName = run.requirementSnapshots.map((item) => item.title).filter(Boolean).join(", ") || "Untitled requirement";
  return <li className="flex flex-wrap items-center gap-4 border-t border-subtle px-6 py-6"><RunOutcomeBadge run={run} outcome={outcome} iconOnly /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={href} className="rounded text-sm font-semibold hover:underline focus-visible:ring-3 focus-visible:ring-focus-ring/50">{requirementName} · Run #{run.runNumber}</Link><span className="rounded-md bg-raised px-2 py-1 font-mono text-[11px] text-fg-tertiary">{run.id.slice(0, 7)}</span><time dateTime={run.queuedAt} className="text-xs text-fg-tertiary">{new Date(run.queuedAt).toLocaleString()}</time></div></div><RunOutcomeBadge run={run} outcome={outcome} /><Link href={href} className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2.5 text-xs font-medium hover:bg-hover focus-visible:ring-3 focus-visible:ring-focus-ring/50">Inspect Report <ArrowRight className="size-3.5" /></Link></li>;
}

// eslint-disable-next-line complexity -- Keep the request-scope decision beside the filtering and paging it exists to bound.
export function RunHistory({ runs }: { runs: Run[] }) {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("newest");
  const [page, setPage] = useState(0);

  // Text and order need no outcomes, so narrow by them before spending requests.
  const query = search.trim().toLowerCase();
  const matched = runs.filter((run) => `run #${run.runNumber} ${run.id} ${run.requirementSnapshots.map((item) => item.title).join(" ")}`.toLowerCase().includes(query));
  const ordered = [...matched].sort((a, b) => (new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime()) * (order === "newest" ? 1 : -1));
  const lastPage = (count: number) => Math.min(page, Math.max(0, Math.ceil(count / PAGE_SIZE) - 1));

  // An outcome filter has to compare across runs, so it reads a bounded window.
  // Unfiltered, the visible page is knowable without any outcome at all, so it
  // reads only the rows it is about to draw.
  const filtering = status !== "all";
  const start = lastPage(ordered.length) * PAGE_SIZE;
  const scope = filtering ? ordered.slice(0, RUN_OUTCOME_LIMIT) : ordered.slice(start, start + PAGE_SIZE);
  const outcomes = useRunOutcomes(scope);
  // The hook is handed an already-narrowed list, so it cannot tell that the
  // window cut anything off. Only this caller knows what it sliced away.
  const windowed = filtering && ordered.length > RUN_OUTCOME_LIMIT;

  const filtered = filtering ? scope.filter((run) => { const outcome = outcomes.byId.get(run.id); return !outcome?.isPending && runOutcome(run, outcome).outcome === status; }) : ordered;
  const currentPage = lastPage(filtered.length);
  const visible = filtering ? filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE) : scope;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return <div className="overflow-hidden rounded-[24px] border border-border bg-panel shadow-ambient"><div className="flex flex-wrap justify-between gap-5 p-6"><div><h3 className="text-lg font-semibold tracking-tight">Execution Trail &amp; Run History</h3><p className="mt-1 text-sm text-fg-tertiary">Traceable browser logs and requirement validation.</p></div><div className="space-y-3"><label className="relative block"><span className="sr-only">Search runs</span><Search className="absolute left-4 top-3 size-4 text-fg-tertiary" /><input type="search" className="h-10 w-full rounded-full bg-raised pl-11 pr-4 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50" placeholder="Search run or requirement…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} /></label><div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor="history-status">Test outcome</label><Select id="history-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}><option value="all">All runs</option><option value="PASS">Pass</option><option value="FAIL">Fail</option><option value="INCONCLUSIVE">Inconclusive</option></Select><label className="sr-only" htmlFor="history-order">Sort by</label><Select id="history-order" value={order} onChange={(event) => { setOrder(event.target.value); setPage(0); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></Select></div></div></div>{outcomes.isFetching && <p role="status" className="px-6 pb-4 text-sm text-fg-tertiary">Loading run outcomes…</p>}{outcomes.isError && <p role="alert" className="px-6 pb-4 text-sm text-fail">Some run outcomes could not be loaded and are shown as inconclusive.</p>}{windowed && <p className="px-6 pb-4 text-sm text-fg-tertiary">Outcome filters cover the {RUN_OUTCOME_LIMIT} most recent runs. Search by run number to look further back.</p>}<ul>{visible.map((run) => <HistoryRow key={run.id} run={run} outcome={outcomes.byId.get(run.id)} />)}</ul>{!visible.length && <p className="border-t border-subtle px-6 py-12 text-center text-sm text-fg-tertiary">{runs.length ? "No analyses match your filters." : "No analyses yet. Start your first test run from the project."}</p>}<div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle px-6 py-5 text-xs text-fg-tertiary"><p role="status">{filtered.length} matching runs</p><div className="flex items-center gap-3"><Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button><span>Page {currentPage + 1} of {pageCount}</span><Button variant="outline" size="sm" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div></div>;
}
