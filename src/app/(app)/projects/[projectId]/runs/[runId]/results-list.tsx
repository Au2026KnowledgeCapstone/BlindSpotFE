"use client";

import type { Result } from "@/features/analysis";
import { ResultCard } from "./result-card";

export function ResultsList({ results }: { results: Result[] }) {
  const sorted = [...results].sort((a, b) => ({ fail: 0, inconclusive: 1, pass: 2 })[a.verdict] - ({ fail: 0, inconclusive: 1, pass: 2 })[b.verdict]);
  return <section aria-labelledby="test-results-title" className="space-y-5">
    <h2 id="test-results-title" className="text-lg font-semibold">Test results</h2>
    {sorted.length ? sorted.map((result) => <ResultCard key={result.id} result={result} />) : <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-fg-secondary">No test results yet.</p>}
  </section>;
}
