import React from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import type { Run } from "@/features/runs";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { environmentLabel, triggerLabel } from "@/shared/lib/labels";

const ROW =
  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md border border-fail-border bg-fail-tint p-3";

function Dot() {
  return (
    <span aria-hidden className="text-fg-quaternary">
      ·
    </span>
  );
}

function RegressionBody({ run }: { run: Run }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        <StatusBadge status="regression" />
        <span className="truncate font-medium text-fg">{run.flowName}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-fg-secondary">
        <span className="tabular-nums">#{run.runNumber}</span>
        <Dot />
        <span>{environmentLabel(run.environment)}</span>
        <Dot />
        <span>{triggerLabel(run.trigger)}</span>
      </div>
    </>
  );
}

function RegressionRow({ run, projectId }: { run: Run; projectId?: string | undefined }) {
  if (!projectId) {
    return (
      <li className={ROW}>
        <RegressionBody run={run} />
      </li>
    );
  }
  return (
    <li>
      <Link
        href={`/projects/${projectId}/runs/${run.id}`}
        className={`${ROW} transition-colors hover:border-fail focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50`}
      >
        <RegressionBody run={run} />
      </Link>
    </li>
  );
}

function NoRegressions() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-subtle bg-panel p-3 text-xs text-fg-secondary shadow-ambient">
      <CircleCheck aria-hidden className="w-3.5 h-3.5 shrink-0 text-pass" />
      No active regressions.
    </div>
  );
}

/**
 * Failure-first: regressions lead the overview.
 *
 * This previously rendered one hardcoded sentence — "Regression detected in
 * Checkout Flow (PR #482)" — no matter what the data said, so a second
 * regression was invisible and a stale one kept claiming to be live. It now
 * renders the actual regressing runs, each linking to its evidence.
 */
export function RegressionsFirst({
  runs,
  projectId,
}: {
  runs: Run[];
  projectId?: string | undefined;
}) {
  const regressions = runs.filter((r) => r.status === "regression");

  return (
    <section className="space-y-3" data-testid="regressions">
      <SectionHeading
        aside={regressions.length > 0 ? `${regressions.length} needing triage` : undefined}
      >
        Regressions
      </SectionHeading>

      {regressions.length === 0 ? (
        <NoRegressions />
      ) : (
        <ul className="space-y-2">
          {regressions.map((run) => (
            <RegressionRow key={run.id} run={run} projectId={projectId} />
          ))}
        </ul>
      )}
    </section>
  );
}
