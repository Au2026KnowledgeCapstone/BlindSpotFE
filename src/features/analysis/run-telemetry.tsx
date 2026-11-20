"use client";
import { RUN_OUTCOME_LIMIT, useRunOutcomes } from "./use-run-outcomes";
import type { Run } from "./types";

export function RunTelemetry({ runs }: { runs: Run[] }) {
  const outcomes = useRunOutcomes(runs);
  const counts = { passed: 0, failed: 0, inconclusive: 0 };
  for (const { results } of outcomes.byId.values()) {
    if (!results?.length) continue;
    if (results.some((result) => result.verdict === "fail")) counts.failed++;
    else if (results.some((result) => result.verdict === "inconclusive")) counts.inconclusive++;
    else counts.passed++;
  }
  const total = counts.passed + counts.failed + counts.inconclusive;
  const percentage = total ? Math.round(counts.passed / total * 1000) / 10 : 0;
  const segments = [{ label: "Passed", count: counts.passed, tone: "text-green-600" }, { label: "Failed", count: counts.failed, tone: "text-red-600" }, { label: "Inconclusive", count: counts.inconclusive, tone: "text-yellow-500" }];
  let offset = 0;
  return <section className="rounded-[24px] border border-border bg-panel p-6 shadow-ambient sm:p-7"><h2 className="text-lg font-semibold">Runs Summary</h2><p className="mt-1 text-sm text-fg-tertiary">{outcomes.truncated ? `The ${RUN_OUTCOME_LIMIT} most recent completed runs.` : "All completed runs."}</p>
    <div className="mt-5 grid items-center gap-8 rounded-[20px] border border-subtle bg-canvas p-6 2xl:grid-cols-2 sm:p-8"><div className="relative mx-auto size-44"><svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={`Run outcomes: ${counts.passed} passed, ${counts.failed} failed, ${counts.inconclusive} inconclusive`}><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="9" className="text-border" />{segments.map((segment) => { const length = total ? segment.count / total * 263.894 : 0; const start = offset; offset += length; return <circle key={segment.label} cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="9" strokeDasharray={`${length} ${263.894 - length}`} strokeDashoffset={-start} className={segment.tone} />; })}</svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[11px] uppercase tracking-wider text-fg-tertiary">Pass rate</span><strong className="mt-1 text-3xl tracking-tight">{total ? `${percentage}%` : "—"}</strong></div></div><ul className="space-y-5">{segments.map((segment) => <li key={segment.label} className="flex items-center gap-3 text-sm"><span className={`size-2.5 rounded-full bg-current ${segment.tone}`} /><span className="flex-1">{segment.label}</span><strong className="tabular-nums">{segment.count}</strong><span className="w-16 text-right font-mono text-xs text-fg-quaternary">({total ? (segment.count / total * 100).toFixed(1) : "0"}%)</span></li>)}</ul></div>
  </section>;
}
