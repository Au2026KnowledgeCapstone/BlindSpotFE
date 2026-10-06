import React from "react";
import { StabilityStrip } from "@/shared/ui/StabilityStrip";
import type { Flow } from "../types";

export function FlowsList({ flows }: { flows: Flow[] }) {
  const areas = [...new Set(flows.map((f) => f.featureArea))];

  return (
    <div className="border border-border bg-panel rounded-md p-4 space-y-4" data-testid="flows-list">
      <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Flows by feature area</h2>
      {areas.map((area) => (
        <section key={area} className="space-y-2">
          <h3 className="text-[11px] font-mono text-tertiary uppercase tracking-wider">{area}</h3>
          {flows
            .filter((f) => f.featureArea === area)
            .map((flow) => (
              <div
                key={flow.id}
                className="border border-border bg-raised rounded-md p-3 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="font-medium text-primary">{flow.name}</div>
                  <div className="text-xs text-secondary">
                    {flow.lastStatus} · last run {flow.lastRunAt}
                  </div>
                </div>
                <StabilityStrip runs={flow.history} />
              </div>
            ))}
        </section>
      ))}
    </div>
  );
}
