"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileCheck2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FIELD_CHECKBOX } from "@/shared/ui/field";
import { useRequirements, type Requirement } from "@/features/requirements";

const MAX_SELECTABLE = 10;

function toggle(selected: string[], id: string): string[] {
  if (selected.includes(id)) return selected.filter((existing) => existing !== id);
  if (selected.length >= MAX_SELECTABLE) return selected;
  return [...selected, id];
}

function RequirementCheckbox({ item, checked, disabled, onToggle }: { item: Requirement; checked: boolean; disabled: boolean; onToggle: () => void }) {
  return (
    <li className="flex items-start gap-2 rounded-lg border border-border bg-raised p-2.5">
      <input type="checkbox" className={`${FIELD_CHECKBOX} mt-0.5`} checked={checked} disabled={!checked && disabled} onChange={onToggle} aria-label={item.title} />
      <span className="min-w-0 flex-1 text-xs text-fg">{item.title}</span>
    </li>
  );
}

export function RequirementPicker({ projectId, environmentId, onStart }: { projectId: string; environmentId: string | undefined; onStart: (requirementIds: string[]) => Promise<unknown> }) {
  const { data } = useRequirements(projectId);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (data.isPending) return <p role="status" className="text-xs text-fg-tertiary">Loading requirements…</p>;
  const approved = (data.data ?? []).filter((item) => item.approvalStatus === "approved");

  if (!approved.length) {
    return (
      <EmptyState
        icon={FileCheck2}
        title="No approved requirements yet"
        description="A run needs at least one approved requirement. Write or import requirements, then approve them."
        action={<Link href={`/projects/${projectId}/requirements`} className="text-xs text-accent underline-offset-4 hover:underline">Go to requirements</Link>}
      />
    );
  }

  async function start() {
    if (!selected.length || busy) return;
    setBusy(true);
    setError("");
    try {
      await onStart(selected);
      setSelected([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start the run. Retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <ul className="max-h-64 space-y-1.5 overflow-y-auto">
        {approved.map((item) => (
          <RequirementCheckbox key={item.id} item={item} checked={selected.includes(item.id)} disabled={selected.length >= MAX_SELECTABLE} onToggle={() => setSelected((prev) => toggle(prev, item.id))} />
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-fg-tertiary">{selected.length} / {MAX_SELECTABLE} selected</span>
        <Button size="sm" disabled={!selected.length || !environmentId || busy} onClick={() => void start()}>
          <Play /> {busy ? "Starting…" : "Start run"}
        </Button>
      </div>
      {error && <p role="alert" className="text-xs text-fail">{error}</p>}
    </div>
  );
}
