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
      <input type="checkbox" className={`${FIELD_CHECKBOX} mt-0.5`} checked={checked} disabled={disabled} onChange={onToggle} aria-label={item.title} />
      <span className="min-w-0 flex-1 text-xs text-fg">{item.title}</span>
    </li>
  );
}

// eslint-disable-next-line complexity -- Coordinate approved selection, the launch summary, and asynchronous form states.
export function RequirementPicker({ projectId, environmentId, onStart }: { projectId: string; environmentId: string | undefined; onStart: (requirementIds: string[]) => Promise<unknown> }) {
  const { data } = useRequirements(projectId);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (data.isPending) return <p role="status" className="text-xs text-fg-tertiary">Loading requirements…</p>;
  const approved = (data.data ?? []).filter((item) => item.approvalStatus === "approved");

  const chosen = approved.filter((item) => selected.includes(item.id));
  const visible = approved;
  const available = visible.filter((item) => !selected.includes(item.id)).slice(0, MAX_SELECTABLE - chosen.length);

  if (data.isError) return <div role="alert" className="space-y-2 text-sm text-fail"><p>{data.error.message}</p><Button variant="outline" onClick={() => void data.refetch()}>Retry requirements</Button></div>;
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
      await onStart(chosen.map((item) => item.id));
      setSelected([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start the run. Retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs"><h3 className="font-semibold">Choose requirements</h3><div className="flex gap-3 text-fg-tertiary"><button type="button" disabled={!available.length || busy} className="font-medium text-fg hover:underline disabled:opacity-40" onClick={() => setSelected([...chosen.map((item) => item.id), ...available.map((item) => item.id)])}>Select all</button><button type="button" disabled={!chosen.length || busy} className="hover:underline disabled:opacity-40" onClick={() => setSelected([])}>Clear</button></div></div>
      <ul className="max-h-64 space-y-2 overflow-y-auto">
        {visible.map((item) => <RequirementCheckbox key={item.id} item={item} checked={selected.includes(item.id)} disabled={busy || (!selected.includes(item.id) && chosen.length >= MAX_SELECTABLE)} onToggle={() => setSelected((prev) => toggle(prev, item.id))} />)}
      </ul>
      {!visible.length && <p className="py-4 text-center text-sm text-fg-tertiary">No matching requirements.</p>}
      <aside aria-label="Run selection summary" className="space-y-4 rounded-xl border border-subtle bg-canvas p-4"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-fg-tertiary">Ready to check</p><p className="mt-2 text-sm"><strong className="text-xl">{chosen.length}</strong> requirements selected</p></div>{chosen.length > 0 && <ul className="max-h-32 space-y-2 overflow-y-auto">{chosen.map((item) => <li key={item.id} className="flex items-center gap-2 text-xs"><span className="min-w-0 flex-1">{item.title}</span></li>)}</ul>}<Button className="w-full" disabled={!chosen.length || !environmentId || busy} onClick={() => void start()}><Play />{busy ? "Starting…" : chosen.length ? `Start ${chosen.length === 1 ? "check" : `${chosen.length} checks`}` : "Select requirements"}</Button></aside>
      {error && <p role="alert" className="text-xs text-fail">{error}</p>}
    </div>
  );
}
