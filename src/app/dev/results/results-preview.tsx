"use client";

import { useState } from "react";
import { ResultsSummary, ShareReport, RunHistory, type Run, type Result } from "@/features/analysis";
import { PageHeader } from "@/shared/ui/PageHeader";
import { FIELD_DENSE } from "@/shared/ui/field";
import { ResultsList } from "@/app/(app)/projects/[projectId]/runs/[runId]/results-list";
import { previewRun, previewResults } from "./fixtures";

export function ResultsPreview() {
  const [scenario, setScenario] = useState("mixed");
  const run: Run = { ...previewRun, status: scenario === "running" ? "running" : "completed" };
  const results: Result[] = scenario === "pass" ? previewResults.map((result) => ({ ...result, verdict: "pass", classification: "criteria_satisfied", observedBehavior: "All acceptance criteria were satisfied." })) : scenario === "empty" ? [] : scenario === "running" ? previewResults.slice(0, 3) : previewResults;
  return <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-8">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-border bg-accent-tint p-4"><p className="text-sm text-fg-secondary"><strong className="text-accent">UI preview</strong> · Synthetic data · Development only</p><label className="flex items-center gap-2 text-sm">Scenario<select className={FIELD_DENSE} value={scenario} onChange={(event) => setScenario(event.target.value)}><option value="mixed">Failed + inconclusive</option><option value="pass">All passed</option><option value="running">In progress</option><option value="empty">No results</option></select></label></div>
    <PageHeader title="Testing report" description="Your application's results, at a glance." actions={<ShareReport run={run} results={results} />} />
    <ResultsSummary run={run} results={results} />
    <ResultsList results={results} />
    <section className="space-y-5 border-t border-border pt-8"><h2 className="text-xl font-semibold">Analysis history</h2><RunHistory runs={Array.from({ length: 14 }, (_, index) => ({ ...previewRun, id: `preview-run-${index}`, runNumber: 24 - index, queuedAt: new Date(Date.UTC(2026, 10, 17 - index, 14)).toISOString(), status: index === 1 ? "failed" : "completed" }))} /></section>
  </main>;
}
