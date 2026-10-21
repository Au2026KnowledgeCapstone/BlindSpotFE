"use client";

import React from "react";
import { Plus, X } from "lucide-react";

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

const RISK_DOT: Record<EnvRisk, string> = {
  fail: "bg-fail",
  warn: "bg-warn",
  accent: "bg-accent",
  neutral: "bg-tertiary",
};

const RISK_OPTIONS: { value: EnvRisk; label: string }[] = [
  { value: "neutral", label: "Neutral" },
  { value: "accent", label: "Accent" },
  { value: "warn", label: "Warning" },
  { value: "fail", label: "Critical" },
];

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
      className="border border-border bg-panel rounded-md p-4 space-y-3"
      data-testid="new-environment-form"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-primary text-sm">New environment</span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="text-tertiary hover:text-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full bg-raised border border-border rounded px-2.5 py-1.5 text-sm text-primary placeholder:text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-full bg-raised border border-border rounded px-2.5 py-1.5 text-xs text-primary placeholder:text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
      />
      <select
        value={risk}
        onChange={(e) => setRisk(e.target.value as EnvRisk)}
        className="w-full bg-raised border border-border rounded px-2.5 py-1.5 text-xs text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
      >
        {RISK_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-xs text-secondary">
        <input
          type="checkbox"
          checked={destructiveRunsDisabled}
          onChange={(e) => setDestructiveRunsDisabled(e.target.checked)}
          className="rounded border-border"
        />
        Disable destructive runs
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-secondary hover:text-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded bg-accent text-[var(--bs-bg-canvas)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
        >
          Create
        </button>
      </div>
    </form>
  );
}

export function EnvironmentCards() {
  const [environments, setEnvironments] = React.useState(INITIAL_ENVIRONMENTS);
  const [isCreating, setIsCreating] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded bg-raised text-secondary hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
        >
          <Plus className="w-3.5 h-3.5" />
          New environment
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4" data-testid="environment-cards">
        {environments.map((env) => (
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
