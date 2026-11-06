import React from "react";
import { TrendingDown } from "lucide-react";
import type { Run } from "@/features/runs";
import { SectionHeading } from "@/shared/ui/SectionHeading";

interface CounterProps {
  label: string;
  value: string;
  /** Secondary line: what the number is counted over. */
  note?: string;
  /** Raised when the number is itself bad news, so failure reads first. */
  alarm?: boolean;
}

function Counter({ label, value, note, alarm = false }: CounterProps) {
  return (
    <div
      className={`rounded-md border p-4 shadow-ambient ${
        alarm ? "border-fail-border bg-fail-tint" : "border-border bg-panel"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {alarm && <TrendingDown aria-hidden className="w-3 h-3 shrink-0 text-fail" />}
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${
            alarm ? "text-fail" : "text-fg-tertiary"
          }`}
        >
          {label}
        </span>
      </div>
      <div
        className={`mt-2 font-mono text-2xl leading-none font-medium tabular-nums ${
          alarm ? "text-fail" : "text-fg"
        }`}
      >
        {value}
      </div>
      {note && <div className="mt-1.5 text-[11px] text-fg-quaternary">{note}</div>}
    </div>
  );
}

function summarise(runs: Run[]) {
  const passed = runs.filter(
    (r) => r.status === "passed" || r.status === "passed_healed",
  ).length;
  const healed = runs.filter((r) => r.status === "passed_healed").length;
  const flows = new Set(runs.map((r) => r.flowName)).size;
  return {
    passed,
    healed,
    flows,
    passRate: runs.length === 0 ? "—" : `${((passed / runs.length) * 100).toFixed(1)}%`,
    regressions: runs.filter((r) => r.status === "regression").length,
    costThisWeek: runs.reduce((sum, r) => sum + r.estimatedCostUsd, 0),
  };
}

export function OverviewCounters({ runs }: { runs: Run[] }) {
  const { passed, healed, flows, passRate, regressions, costThisWeek } = summarise(runs);

  return (
    <section className="space-y-3">
      <SectionHeading>This week</SectionHeading>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Counter
          label="Runs"
          value={String(runs.length)}
          note={flows === 1 ? "across 1 flow" : `across ${flows} flows`}
        />
        <Counter
          label="Pass rate"
          value={passRate}
          note={
            healed > 0
              ? `${passed} of ${runs.length} · ${healed} healed`
              : `${passed} of ${runs.length} passing`
          }
        />
        <Counter
          label="New regressions"
          value={String(regressions)}
          note={regressions > 0 ? "Needs triage" : "None since last deploy"}
          alarm={regressions > 0}
        />
        <Counter
          label="Agent cost"
          value={`$${costThisWeek.toFixed(2)}`}
          note="Estimated from usage"
        />
      </div>
    </section>
  );
}
