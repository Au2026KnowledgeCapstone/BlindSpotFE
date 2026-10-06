import React from "react";

type EnvRisk = "fail" | "warn" | "accent" | "neutral";

type EnvironmentCard = {
  name: string;
  risk: EnvRisk;
  note: string;
  destructiveRunsDisabled: boolean;
};

const ENVIRONMENTS: EnvironmentCard[] = [
  { name: "Production", risk: "fail", note: "Live customer traffic", destructiveRunsDisabled: true },
  { name: "Staging", risk: "warn", note: "Pre-release verification", destructiveRunsDisabled: false },
  { name: "Preview", risk: "accent", note: "PR #482", destructiveRunsDisabled: false },
  { name: "Development", risk: "neutral", note: "Local sandbox", destructiveRunsDisabled: false },
];

const RISK_DOT: Record<EnvRisk, string> = {
  fail: "bg-fail",
  warn: "bg-warn",
  accent: "bg-accent",
  neutral: "bg-tertiary",
};

export function EnvironmentCards() {
  return (
    <div className="grid grid-cols-2 gap-4" data-testid="environment-cards">
      {ENVIRONMENTS.map((env) => (
        <div key={env.name} className="border border-border bg-panel rounded-md p-4 space-y-3">
          <span className="font-medium text-primary flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${RISK_DOT[env.risk]}`} aria-hidden />
            {env.name}
          </span>
          <div className="text-xs text-secondary">{env.note}</div>
          {env.destructiveRunsDisabled && (
            <div className="text-[11px] text-fail font-semibold bg-fail/10 border border-fail/30 rounded p-1.5 text-center">
              Destructive runs disabled
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
