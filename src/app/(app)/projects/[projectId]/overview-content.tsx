"use client";

import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock,
  FileCheck2,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/shared/ui/StatTile";

const PROJECT = {
  name: "Acme Corp",
  description: "Clinical vitals monitoring for care teams",
  host: "vitals.acme-corp.com",
};

function PageHeading() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-fg">{PROJECT.name}</h1>
        <p className="mt-1.5 text-sm text-fg-tertiary">
          A clearer view of this product, from expectations to evidence.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline">Import requirements</Button>
        <Button>
          View analysis <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

/**
 * Literal utility classes, not `bg-${tone}-tint` interpolation — a dynamically
 * built class name would not survive Tailwind's JIT scan. See status-config.ts.
 */
const TONE_CHIP_CLASS: Record<"pass" | "fail" | "warn" | "neutral", string> = {
  pass: "bg-pass-tint text-pass border-pass-border",
  fail: "bg-fail-tint text-fail border-fail-border",
  warn: "bg-warn-tint text-warn border-warn-border",
  neutral: "bg-neutral-tint text-neutral border-neutral-border",
};

function OutcomeBadge({ icon: Icon, label, tone }: { icon: typeof CircleCheck; label: string; tone: keyof typeof TONE_CHIP_CLASS }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${TONE_CHIP_CLASS[tone]}`}>
      <Icon className="size-3" />
      {label}
    </span>
  );
}

function MetricsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Approved requirements" value={0} detail="Ready for validation" icon={FileCheck2} featured />
      <StatTile label="Documented requirements" value={0} detail="Your product expectations" icon={FileCheck2} />
      <StatTile label="Requirements tested" value={0} icon={ShieldCheck}>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <OutcomeBadge icon={CircleCheck} label="0 passed" tone="pass" />
          <OutcomeBadge icon={CircleX} label="0 failed" tone="fail" />
          <OutcomeBadge icon={CircleHelp} label="0 inconclusive" tone="warn" />
        </div>
      </StatTile>
      <StatTile label="Awaiting review" value={0} detail="Findings awaiting PM review" icon={Clock} />
    </div>
  );
}

const OUTCOME_ROWS = [
  { label: "Passed", icon: CircleCheck, tone: "pass" as const },
  { label: "Failed", icon: CircleX, tone: "fail" as const },
  { label: "Inconclusive", icon: CircleHelp, tone: "warn" as const },
  { label: "Not tested", icon: Clock, tone: "neutral" as const },
];

function ValidationStatusPanel() {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-panel p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">Validation status</h2>
        <ShieldCheck className="size-4 text-fg-tertiary" />
      </div>
      <div className="mt-5">
        <strong className="text-3xl font-medium tracking-tight tabular-nums text-fg">
          0<span className="text-xl text-fg-tertiary"> / 0</span>
        </strong>
        <p className="mt-1 text-xs text-fg-tertiary">requirements tested</p>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full border border-border bg-raised" />
      <ul className="mt-5 space-y-2.5">
        {OUTCOME_ROWS.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-2 text-xs">
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-medium ${TONE_CHIP_CLASS[row.tone]}`}>
              <row.icon className="size-3" />
              {row.label}
            </span>
            <strong className="font-semibold tabular-nums text-fg">0</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NextStepPanel() {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-panel p-6">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-tertiary">
        Your next step
      </p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-fg">Review your requirements</h2>
      <p className="mt-3 text-sm text-fg-tertiary">
        Review and approve documented requirements before starting browser checks.
      </p>
      <div className="mt-auto flex items-center gap-2 rounded-lg border border-border bg-raised px-3 py-2.5 text-xs text-fg-tertiary">
        <CircleHelp className="size-4 shrink-0" />
        <span>Approved requirements</span>
        <strong className="ml-auto font-semibold text-fg">0</strong>
      </div>
      <Button className="mt-3 w-full">
        Review requirements <ArrowRight />
      </Button>
    </section>
  );
}

function ProjectPanel() {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-panel p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">Project</h2>
        <FolderKanban className="size-4 text-fg-tertiary" />
      </div>
      <span className="mt-4 flex size-9 items-center justify-center rounded-full border border-border bg-raised text-xs font-semibold text-fg-secondary">
        {PROJECT.name.slice(0, 2).toUpperCase()}
      </span>
      <h3 className="mt-3 text-base font-semibold text-fg">{PROJECT.name}</h3>
      <p className="mt-1 text-xs text-fg-tertiary">{PROJECT.description}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-xs text-fg-tertiary">
        {PROJECT.host} <ArrowUpRight className="size-3.5" />
      </span>
      <Button variant="outline" className="mt-auto w-full">
        Project settings <ArrowRight />
      </Button>
    </section>
  );
}

export function OverviewContent(_props: { projectId: string }) {
  return (
    <div className="space-y-5">
      <PageHeading />
      <MetricsRow />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ValidationStatusPanel />
        <NextStepPanel />
        <ProjectPanel />
      </div>
    </div>
  );
}
