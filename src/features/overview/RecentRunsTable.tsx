import React from "react";
import type { Run } from "@/features/runs";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { CostChip } from "@/shared/ui/CostChip";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { environmentLabel, triggerLabel } from "@/shared/lib/labels";

const TH =
  "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary";
const TD = "px-4 py-2.5";

const COLUMNS = ["Run", "Flow", "Status", "Environment", "Trigger"] as const;

function TableHead() {
  return (
    <thead className="border-b border-border">
      <tr>
        {COLUMNS.map((c) => (
          <th key={c} scope="col" className={TH}>
            {c}
          </th>
        ))}
        <th scope="col" className={`${TH} text-right`}>
          Duration / cost
        </th>
      </tr>
    </thead>
  );
}

function RunRow({ run }: { run: Run }) {
  return (
    <tr className="transition-colors hover:bg-hover">
      <td className={`${TD} font-mono tabular-nums text-fg-tertiary`}>
        #{run.runNumber}
      </td>
      <td className={`${TD} font-medium text-fg`}>{run.flowName}</td>
      <td className={TD}>
        <StatusBadge status={run.status} />
      </td>
      <td className={`${TD} text-fg-secondary`}>{environmentLabel(run.environment)}</td>
      <td className={`${TD} text-fg-secondary`}>{triggerLabel(run.trigger)}</td>
      <td className={`${TD} text-right`}>
        <CostChip
          durationSeconds={run.durationSeconds}
          actionsCount={run.actionCount}
          estimatedCostUsd={run.estimatedCostUsd}
        />
      </td>
    </tr>
  );
}

export function RecentRunsTable({ runs }: { runs: Run[] }) {
  return (
    <section className="space-y-3">
      <SectionHeading aside={runs.length > 0 ? `${runs.length} shown` : undefined}>
        Recent runs
      </SectionHeading>

      <div className="overflow-x-auto rounded-md border border-border bg-panel shadow-ambient">
        <table className="w-full text-left text-xs">
          <TableHead />
          <tbody className="divide-y divide-subtle">
            {runs.map((r) => (
              <RunRow key={r.id} run={r} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
