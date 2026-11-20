import { CircleCheck, CircleX, Activity, LoaderCircle } from "lucide-react";
import type { Result, Run } from "./types";
import { summarizeResults, type ResultSummary } from "./result-summary";

/** An unfinished run is the one state that should look alive. Rendering it as a
 *  still heading made a working run read as a finished, ambiguous one. */
function presentation(summary: ResultSummary) {
  if (summary.active) return { tone: "text-accent", Icon: LoaderCircle, spin: true, show: true };
  if (summary.outcome === "PASS") return { tone: "text-pass", Icon: CircleCheck, spin: false, show: true };
  if (summary.outcome === "FAIL") return { tone: "text-fail", Icon: CircleX, spin: false, show: true };
  if (summary.outcome === "ERROR") return { tone: "text-fail", Icon: Activity, spin: false, show: true };
  return { tone: "text-warn", Icon: Activity, spin: false, show: summary.outcome !== "INCONCLUSIVE" };
}

function Progress({ run, summary }: { run: Run; summary: ResultSummary }) {
  if (!summary.active) return null;
  const checked = `Checking ${summary.total} ${summary.total === 1 ? "requirement" : "requirements"} in a browser — ${summary.executed} done so far.`;
  return <p role="status" className="text-sm leading-relaxed text-fg-tertiary">{run.status === "queued" ? "Queued and waiting for an analysis worker." : checked}</p>;
}

export function ResultsSummary({ run, results }: { run: Run; results: Result[] }) {
  const summary = summarizeResults(run, results);
  const { tone, Icon, spin, show } = presentation(summary);
  return <div className="space-y-4">
    <section aria-label="Overall testing result" className="overflow-hidden rounded-xl border border-border bg-panel shadow-ambient">
      <div className={`border-t-4 border-t-current p-6 sm:p-8 ${tone}`}>
        <div className="space-y-4 text-fg">
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-tertiary">Overall test result</p>
          <div className={`flex items-center gap-3 ${tone}`}>
            {show && <Icon aria-hidden className={`size-9 shrink-0${spin ? " animate-spin" : ""}`} />}
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{summary.outcome}</h2>
          </div>
          <Progress run={run} summary={summary} />
        </div>
      </div>
    </section>
  </div>;
}
