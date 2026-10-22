"use client";

import React from "react";
import { Plus, X, ShieldAlert, AlertTriangle, Eye, Minus, type LucideIcon } from "lucide-react";
import { FIELD_DENSE, FIELD_CHECKBOX } from "@/shared/ui/field";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";

type EnvRisk = "fail" | "warn" | "accent" | "neutral";

type EnvironmentCard = {
  name: string;
  risk: EnvRisk;
  note: string;
  destructiveRunsDisabled: boolean;
};

const INITIAL_ENVIRONMENTS: EnvironmentCard[] = [
  { name: "Production", risk: "fail", note: "Live customer traffic", destructiveRunsDisabled: true },
  { name: "Staging", risk: "warn", note: "Pre-release verification", destructiveRunsDisabled: false },
  { name: "Preview", risk: "accent", note: "PR #482", destructiveRunsDisabled: false },
  { name: "Development", risk: "neutral", note: "Local sandbox", destructiveRunsDisabled: false },
];

/**
 * Risk is never communicated by colour alone: each level carries an icon and
 * its text label as well as its hue. The dot this replaced was `aria-hidden`,
 * so the risk level reached neither a colourblind reader nor a screen reader.
 */
const RISK_CONFIG: Record<EnvRisk, { chipClass: string; icon: LucideIcon; label: string }> = {
  fail: { chipClass: "bg-fail-tint text-fail border-fail-border", icon: ShieldAlert, label: "Critical" },
  warn: { chipClass: "bg-warn-tint text-warn border-warn-border", icon: AlertTriangle, label: "Warning" },
  accent: { chipClass: "bg-accent-tint text-accent border-accent-border", icon: Eye, label: "Accent" },
  neutral: { chipClass: "bg-neutral-tint text-neutral border-neutral-border", icon: Minus, label: "Neutral" },
};

function RiskBadge({ risk }: { risk: EnvRisk }) {
  const { chipClass, icon: Icon, label } = RISK_CONFIG[risk];
  return (
    <span
      className={`${chipClass} inline-flex items-center gap-1.5 h-5 px-2 rounded-full border text-xs font-medium`}
    >
      <Icon aria-hidden className="w-3.5 h-3.5 shrink-0" />
      {label}
    </span>
  );
}

// Single vocabulary: the picker and the badge read the same labels.
const RISK_OPTIONS: { value: EnvRisk; label: string }[] = (
  ["neutral", "accent", "warn", "fail"] as const
).map((value) => ({ value, label: RISK_CONFIG[value].label }));

function NewEnvironmentForm({
  onCreate,
  onCancel,
}: {
  onCreate: (env: EnvironmentCard) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [risk, setRisk] = React.useState<EnvRisk>("neutral");
  const [destructiveRunsDisabled, setDestructiveRunsDisabled] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), note: note.trim(), risk, destructiveRunsDisabled });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border bg-panel rounded-md p-4 space-y-3 shadow-ambient"
      data-testid="new-environment-form"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-fg text-sm">New environment</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onCancel}
          aria-label="Cancel"
        >
          <X />
        </Button>
      </div>

      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className={FIELD_DENSE}
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className={FIELD_DENSE}
      />
      <select
        value={risk}
        onChange={(e) => setRisk(e.target.value as EnvRisk)}
        className={FIELD_DENSE}
      >
        {RISK_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-xs text-fg-secondary">
        <input
          type="checkbox"
          checked={destructiveRunsDisabled}
          onChange={(e) => setDestructiveRunsDisabled(e.target.checked)}
          className={FIELD_CHECKBOX}
        />
        Disable destructive runs
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!name.trim()}>
          Create
        </Button>
      </div>
    </form>
  );
}

export function EnvironmentCards() {
  const [environments, setEnvironments] = React.useState(INITIAL_ENVIRONMENTS);
  const [isCreating, setIsCreating] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environments"
        description="Where flows run, and what they are allowed to do there."
        actions={
          !isCreating && (
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus />
              New environment
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4" data-testid="environment-cards">
        {environments.map((env) => (
          <div key={env.name} className="border border-border bg-panel rounded-md p-4 space-y-3 shadow-ambient">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-fg">{env.name}</span>
              <RiskBadge risk={env.risk} />
            </div>
            <div className="text-xs text-fg-secondary">{env.note}</div>
            {env.destructiveRunsDisabled && (
              <div className="inline-flex items-center gap-1.5 rounded border border-fail-border bg-fail-tint px-2 py-1 text-[11px] font-semibold text-fail">
                <ShieldAlert aria-hidden className="w-3.5 h-3.5 shrink-0" />
                Destructive runs disabled
              </div>
            )}
          </div>
        ))}

        {isCreating && (
          <NewEnvironmentForm
            onCreate={(env) => {
              setEnvironments((prev) => [...prev, env]);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </div>
    </div>
  );
}
