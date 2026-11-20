"use client";
import { useState } from "react";
import { summarizeResults } from "./result-summary";
import Link from "next/link";
import { ArrowRight, Search, CircleCheck, CircleX, CircleAlert, CircleDashed, CircleSlash, LoaderCircle, TriangleAlert } from "lucide-react";
import type { Run } from "./types";
import { RUN_OUTCOME_LIMIT, useRunOutcomes, type RunOutcome as RunOutcomeData } from "./use-run-outcomes";
import { Button } from "@/components/ui/button";
import { Select } from "@/shared/ui/Select";

const PAGE_SIZE = 10;

const VERDICT = {
  PASS: { icon: CircleCheck, tone: "bg-pass-tint text-pass", spins: false },
  FAIL: { icon: CircleX, tone: "bg-fail-tint text-fail", spins: false },
  INCONCLUSIVE: { icon: CircleAlert, tone: "bg-warn-tint text-warn", spins: false },
  QUEUED: { icon: CircleDashed, tone: "bg-neutral-tint text-neutral", spins: false },
  RUNNING: { icon: LoaderCircle, tone: "bg-accent-tint text-accent", spins: true },
  CANCELLED: { icon: CircleSlash, tone: "bg-neutral-tint text-neutral", spins: false },
  ERROR: { icon: TriangleAlert, tone: "bg-fail-tint text-fail", spins: false },
} as const;
type OutcomeVerdict = keyof typeof VERDICT;

/** A run that has not finished has no verdict to report. Reading those as
 *  INCONCLUSIVE made a run look judged and wrong seconds after it was started,
 *  so execution state is answered from the run itself and only a completed run
 *  is judged by its results. */
const EXECUTION_STATE: Partial<Record<Run["status"], OutcomeVerdict>> = {
  queued: "QUEUED",
  running: "RUNNING",
  cancelled: "CANCELLED",
  failed: "ERROR",
};

/** Only these three are read off a run's results. The rest come from the run's
 *  own status, so filtering by them costs no requests at all. */
const RESULT_VERDICTS = new Set<OutcomeVerdict>(["PASS", "FAIL", "INCONCLUSIVE"]);

const FILTERS: readonly { value: string; label: string; matches: readonly OutcomeVerdict[] }[] = [
  { value: "all", label: "All runs", matches: [] },
  { value: "IN_PROGRESS", label: "In progress", matches: ["QUEUED", "RUNNING"] },
  { value: "PASS", label: "Pass", matches: ["PASS"] },
  { value: "FAIL", label: "Fail", matches: ["FAIL"] },
  { value: "INCONCLUSIVE", label: "Inconclusive", matches: ["INCONCLUSIVE"] },
  { value: "CANCELLED", label: "Cancelled", matches: ["CANCELLED"] },
  { value: "ERROR", label: "Errored", matches: ["ERROR"] },
];

function runOutcome(run: Run, outcome: RunOutcomeData | undefined) {
  const state = EXECUTION_STATE[run.status];
  if (state) return { summary: null, outcome: state };
  const summary = outcome?.results?.length ? summarizeResults(run, outcome.results) : null;
  const verdict: OutcomeVerdict = summary?.outcome === "PASS" || summary?.outcome === "FAIL" ? summary.outcome : "INCONCLUSIVE";
  return { summary, outcome: verdict };
}

// Outcomes arrive from the parent, which owns the request budget: a row that
// fetched for itself would make the page cost one request per rendered run.
function OutcomeIcon({ verdict, loading, size }: { verdict: OutcomeVerdict; loading: boolean; size: string }) {
  if (loading) return <LoaderCircle aria-label="Loading outcome" className={`${size} animate-spin`} />;
  const { icon: Icon, spins } = VERDICT[verdict];
  return <Icon aria-label={verdict} className={`${size}${spins ? " animate-spin" : ""}`} />;
}

function RunOutcomeBadge({ run, outcome, iconOnly = false }: { run: Run; outcome: RunOutcomeData | undefined; iconOnly?: boolean }) {
  const { summary, outcome: verdict } = runOutcome(run, outcome);
  const { tone } = VERDICT[verdict];
  const loading = run.status === "completed" && (outcome === undefined || outcome.isPending);
  const score = verdict !== "INCONCLUSIVE" && summary?.score != null ? ` (${summary.score}%)` : "";
  if (iconOnly) return <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}><OutcomeIcon verdict={verdict} loading={loading} size="size-5" /></span>;
  return <div className="flex items-center gap-2"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${loading ? "bg-raised text-fg-tertiary" : tone}`}><OutcomeIcon verdict={verdict} loading={loading} size="size-3.5" />{loading ? "LOADING" : `${verdict}${score}`}</span></div>;
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

  // Three cases, each reading the least it can get away with. Unfiltered, the
  // visible page is knowable without any outcome, so only those rows are read.
  // A verdict filter has to compare across runs, so it reads a bounded window.
  // An execution-state filter needs no results at all — queued and running come
  // off the run itself — so it reads nothing and can search every run.
  const selected = FILTERS.find((filter) => filter.value === status) ?? FILTERS[0]!;
  const filtering = status !== "all";
  const needsResults = selected.matches.some((verdict) => RESULT_VERDICTS.has(verdict));
  const start = lastPage(ordered.length) * PAGE_SIZE;
  const pageSlice = ordered.slice(start, start + PAGE_SIZE);
  const candidates = !filtering || !needsResults ? ordered : ordered.slice(0, RUN_OUTCOME_LIMIT);
  const outcomes = useRunOutcomes(filtering ? (needsResults ? candidates : []) : pageSlice);
  // The hook is handed an already-narrowed list, so it cannot tell that the
  // window cut anything off. Only this caller knows what it sliced away.
  const windowed = filtering && needsResults && ordered.length > RUN_OUTCOME_LIMIT;

  // Starting a check used to give no sign anything had happened: the new run
  // appeared judged rather than pending. useRuns already polls every 5s while
  // anything is unfinished, so say so instead of leaving it silent.
  const inFlight = runs.filter((run) => run.status === "queued" || run.status === "running").length;
  const filtered = filtering ? candidates.filter((run) => { const outcome = outcomes.byId.get(run.id); return !outcome?.isPending && selected.matches.includes(runOutcome(run, outcome).outcome); }) : ordered;
  const currentPage = lastPage(filtered.length);
  const visible = filtering ? filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE) : pageSlice;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return <div className="overflow-hidden rounded-[24px] border border-border bg-panel shadow-ambient"><div className="flex flex-wrap justify-between gap-5 p-6"><div><h3 className="text-lg font-semibold tracking-tight">Execution Trail &amp; Run History</h3><p className="mt-1 text-sm text-fg-tertiary">Traceable browser logs and requirement validation.</p></div><div className="space-y-3"><label className="relative block"><span className="sr-only">Search runs</span><Search className="absolute left-4 top-3 size-4 text-fg-tertiary" /><input type="search" className="h-10 w-full rounded-full bg-raised pl-11 pr-4 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50" placeholder="Search run or requirement…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} /></label><div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor="history-status">Test outcome</label><Select id="history-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>{FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</Select><label className="sr-only" htmlFor="history-order">Sort by</label><Select id="history-order" value={order} onChange={(event) => { setOrder(event.target.value); setPage(0); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></Select></div></div></div>{!!inFlight && <p role="status" className="flex items-center gap-2 border-t border-subtle bg-accent-tint px-6 py-3 text-sm font-medium text-accent"><LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin" />{inFlight === 1 ? "1 run is in progress" : `${inFlight} runs are in progress`} · this list updates automatically</p>}{outcomes.isFetching && <p role="status" className="px-6 pb-4 text-sm text-fg-tertiary">Loading run outcomes…</p>}{outcomes.isError && <p role="alert" className="px-6 pb-4 text-sm text-fail">Some run outcomes could not be loaded and are shown as inconclusive.</p>}{windowed && <p className="px-6 pb-4 text-sm text-fg-tertiary">Outcome filters cover the {RUN_OUTCOME_LIMIT} most recent runs. Search by run number to look further back.</p>}<ul>{visible.map((run) => <HistoryRow key={run.id} run={run} outcome={outcomes.byId.get(run.id)} />)}</ul>{!visible.length && <p className="border-t border-subtle px-6 py-12 text-center text-sm text-fg-tertiary">{runs.length ? "No analyses match your filters." : "No analyses yet. Start your first test run from the project."}</p>}<div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle px-6 py-5 text-xs text-fg-tertiary"><p role="status">{filtered.length} matching runs</p><div className="flex items-center gap-3"><Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button><span>Page {currentPage + 1} of {pageCount}</span><Button variant="outline" size="sm" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div></div>;
}
