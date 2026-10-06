import React from "react";

export function EnvironmentsContent({ projectId }: { projectId: string }) {
  const environments = [
    { name: "Production", risk: "fail", note: "Destructive runs disabled", activeRuns: 12 },
    { name: "Staging", risk: "warn", note: "Standard sync", activeRuns: 4 },
    { name: "PR Preview", risk: "accent", note: "PR #482 active", activeRuns: 2 },
    { name: "Development", risk: "neutral", note: "Local sandbox", activeRuns: 1 },
  ];

  return (
    <div className="space-y-6" data-testid="environments-view">
      <h1 className="text-lg font-bold text-primary">Environments & Risks</h1>
      <div className="grid grid-cols-2 gap-4">
        {environments.map((e) => (
          <div key={e.name} className="border border-border bg-panel rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-primary flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    e.risk === "fail"
                      ? "bg-fail"
                      : e.risk === "warn"
                      ? "bg-warn"
                      : e.risk === "accent"
                      ? "bg-accent"
                      : "bg-tertiary"
                  }`}
                />
                {e.name}
              </span>
              <span className="text-xs font-mono text-tertiary">{e.activeRuns} active runs</span>
            </div>
            <div className="text-xs text-secondary">{e.note}</div>
            {e.name === "Production" && (
              <div className="text-[10px] text-fail font-semibold uppercase tracking-wider bg-fail/10 border border-fail/30 rounded p-1.5 text-center">
                Destructive runs disabled on Production
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
