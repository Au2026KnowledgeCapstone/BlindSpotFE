import React from "react";
import { StabilityStrip } from "@/shared/ui/StabilityStrip";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { STATUS_CONFIG, type RunStatus } from "@/shared/ui/status-config";
import type { Flow } from "../types";

/** `lastStatus` is a plain string on the wire; only render a badge for a known state. */
const asRunStatus = (value: string): RunStatus | null =>
  value in STATUS_CONFIG ? (value as RunStatus) : null;

function FlowRow({ flow }: { flow: Flow }) {
  const status = asRunStatus(flow.lastStatus);

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-md border border-border bg-raised p-3 shadow-ambient">
      <div className="min-w-0 space-y-1.5">
        <div className="truncate font-medium text-fg">{flow.name}</div>
        <div className="flex items-center gap-2">
          {status ? (
            <StatusBadge status={status} />
          ) : (
            <span className="text-xs text-fg-tertiary">{flow.lastStatus}</span>
          )}
          <span className="text-xs text-fg-tertiary">last run {flow.lastRunAt}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StabilityStrip runs={flow.history} />
        <span className="text-[11px] text-fg-quaternary">
          last {flow.history.length} runs
        </span>
      </div>
    </li>
  );
}

export function FlowsList({ flows }: { flows: Flow[] }) {
  const areas = [...new Set(flows.map((f) => f.featureArea))];

  return (
    <section className="space-y-4" data-testid="flows-list">
      <SectionHeading
        aside={flows.length === 1 ? "1 flow" : `${flows.length} flows`}
      >
        Flows by feature area
      </SectionHeading>

      {areas.map((area) => (
        <div key={area} className="space-y-2">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.06em] text-fg-quaternary">
            {area}
          </h3>
          <ul className="space-y-2">
            {flows
              .filter((f) => f.featureArea === area)
              .map((flow) => (
                <FlowRow key={flow.id} flow={flow} />
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
