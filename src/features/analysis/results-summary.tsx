import { CircleCheck, CircleX, Activity } from "lucide-react";
import type { Result, Run } from "./types";
import { summarizeResults } from "./result-summary";

export function ResultsSummary({ run, results }: { run: Run; results: Result[] }) {
  const summary = summarizeResults(run, results);
  const tone = summary.outcome === "PASS" ? "text-pass" : summary.outcome === "FAIL" || summary.outcome === "ERROR" ? "text-fail" : "text-warn";
  const Icon = summary.outcome === "PASS" ? CircleCheck : summary.outcome === "FAIL" ? CircleX : Activity;
  return <div className="space-y-4">
    <section aria-label="Overall testing result" className="overflow-hidden rounded-xl border border-border bg-panel shadow-ambient">
      <div className={`border-t-4 border-t-current p-6 sm:p-8 ${tone}`}>
        <div className="space-y-4 text-fg"><p className="text-xs font-semibold uppercase tracking-widest text-fg-tertiary">Overall test result</p><div className={`flex items-center gap-3 ${tone}`}>{summary.outcome !== "INCONCLUSIVE" && <Icon aria-hidden className="size-9 shrink-0" />}<h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{summary.outcome}</h2></div></div>
      </div>

    </section>
  </div>;
}
