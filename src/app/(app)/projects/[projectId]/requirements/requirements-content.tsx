"use client";

import React, { useState } from "react";
import { Check, Clock, FileCheck2, FileText, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { StatTile } from "@/shared/ui/StatTile";
import { categoryLabel, priorityLabel, approvalLabel } from "@/shared/lib/labels";
import { useRequirements, type Requirement } from "@/features/requirements";

const field = "w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-fg outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50";

function RequirementRow({
  item,
  canManage,
  busy,
  onApprove,
}: {
  item: Requirement;
  canManage: boolean;
  busy: boolean;
  onApprove: (id: string) => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-panel p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-fg">{item.title}</p>
        <p className="mt-1 text-xs text-fg-tertiary">
          {categoryLabel(item.category)} · {priorityLabel(item.priority)} priority · {approvalLabel(item.approvalStatus)}
        </p>
      </div>
      {canManage && item.approvalStatus !== "approved" && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onApprove(item.id)}>
          <Check /> {busy ? "Approving…" : "Approve"}
        </Button>
      )}
    </li>
  );
}

function NewRequirementForm({ onCreate }: { onCreate: (title: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !title.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onCreate(title.trim());
      setTitle("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create requirement. Retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-wrap items-end gap-2">
      <label className="min-w-56 flex-1 space-y-1.5 text-xs text-fg-secondary">
        Title
        <input className={field} value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={300} placeholder="What should the product do?" />
      </label>
      <Button type="submit" disabled={busy || !title.trim()}>
        <Plus /> {busy ? "Adding…" : "Add requirement"}
      </Button>
      {error && <p role="alert" className="w-full text-xs text-fail">{error}</p>}
    </form>
  );
}

function StatsRow({ items, projectName }: { items: Requirement[]; projectName: string | undefined }) {
  const approved = items.filter((r) => r.approvalStatus === "approved").length;
  const draft = items.filter((r) => r.approvalStatus === "draft").length;
  const clarification = items.filter((r) => r.approvalStatus === "needs_clarification").length;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="All requirements" value={items.length} icon={FileText} detail={projectName} featured />
      <StatTile label="Draft" value={draft} icon={Clock} detail="Awaiting review" />
      <StatTile label="Approved" value={approved} icon={FileCheck2} detail="Ready for validation" />
      <StatTile label="Needs clarification" value={clarification} icon={ShieldCheck} detail="Blocked on edits" />
    </div>
  );
}

function RequirementsList({
  items,
  canManage,
  approvingId,
  onApprove,
}: {
  items: Requirement[];
  canManage: boolean;
  approvingId: string | null;
  onApprove: (id: string) => void;
}) {
  if (!items.length) {
    return (
      <EmptyState
        icon={FileCheck2}
        title="No requirements yet"
        description={canManage ? "Add the first requirement above." : "Nothing has been documented yet."}
      />
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <RequirementRow key={item.id} item={item} canManage={canManage} busy={approvingId === item.id} onApprove={onApprove} />
      ))}
    </ul>
  );
}

type RequirementsQuery = ReturnType<typeof useRequirements>["data"];

function RequirementsBody({
  data,
  unavailable,
  items,
  canManage,
  approvingId,
  onApprove,
}: {
  data: RequirementsQuery;
  unavailable: boolean;
  items: Requirement[];
  canManage: boolean;
  approvingId: string | null;
  onApprove: (id: string) => void;
}) {
  if (data.isPending) return <p role="status" className="text-xs text-fg-tertiary">Loading requirements…</p>;
  if (unavailable) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Requirements aren't connected yet"
        description="Requirements storage is not connected to the backend yet. Nothing is shown until it is."
      />
    );
  }
  if (data.isError) {
    return (
      <div role="alert" className="space-y-2 rounded-xl border border-border bg-panel p-4 text-sm">
        <p>{data.error.message}</p>
        <Button variant="outline" size="sm" onClick={() => void data.refetch()}>Retry</Button>
      </div>
    );
  }
  return <RequirementsList items={items} canManage={canManage} approvingId={approvingId} onApprove={onApprove} />;
}

export function RequirementsContent({ projectId }: { projectId: string }) {
  const { identity, project, data, canManage, unavailable, create, approve } = useRequirements(projectId);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setApprovingId(id);
    try { await approve(id); } finally { setApprovingId(null); }
  }

  const error = identity.error || project.error;
  if (error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{error.message}</p></div>;
  if (identity.isPending || project.isPending) return <p role="status" className="text-xs text-fg-tertiary">Loading requirements…</p>;

  const items = data.data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Requirements" description="Define what this product should do, then approve before testing." />
      <StatsRow items={items} projectName={project.data?.name} />
      {canManage && (
        <section className="rounded-2xl border border-border bg-panel p-4">
          <NewRequirementForm onCreate={(title) => create({ title })} />
        </section>
      )}
      <RequirementsBody
        data={data}
        unavailable={unavailable}
        items={items}
        canManage={!!canManage}
        approvingId={approvingId}
        onApprove={(id) => void handleApprove(id)}
      />
    </div>
  );
}
