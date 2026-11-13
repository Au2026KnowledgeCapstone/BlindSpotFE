"use client";

import React, { useState } from "react";
import { Check, Clock, FileCheck2, FileText, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { StatTile } from "@/shared/ui/StatTile";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { categoryLabel, priorityLabel, approvalLabel } from "@/shared/lib/labels";
import { useRequirements, type Requirement } from "@/features/requirements";

const field = "w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-fg outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50";
type CriterionDraft = { id?: string; text: string };
type RequirementEdit = { title: string; description: string; acceptanceCriteria: CriterionDraft[] };

// eslint-disable-next-line complexity -- Keep one requirement's edit, approval, and error states together.
function RequirementRow({
  item,
  canManage,
  busy,
  onApprove,
  onUpdate,
}: {
  item: Requirement;
  canManage: boolean;
  busy: boolean;
  onApprove: (id: string) => void;
  onUpdate: (id: string, args: RequirementEdit) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [criteria, setCriteria] = useState<CriterionDraft[]>(item.acceptanceCriteria.map(({ id, text }) => ({ ...(id ? { id } : {}), text })));
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !criteria.length || criteria.some((criterion) => !criterion.text.trim())) return;
    setSaving(true); setEditError("");
    try {
      await onUpdate(item.id, { title: title.trim(), description: description.trim(), acceptanceCriteria: criteria.map((criterion) => ({ ...criterion, text: criterion.text.trim() })) });
      setEditing(false);
    } catch (cause) {
      setEditError(cause instanceof Error ? cause.message : "Could not save requirement. Retry.");
    } finally { setSaving(false); }
  }
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-panel p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-fg">{item.title}</p>
        <p className="mt-1 text-xs text-fg-tertiary">
          {categoryLabel(item.category)} · {priorityLabel(item.priority)} priority · {approvalLabel(item.approvalStatus)}
        </p>
      </div>
      {canManage && <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={busy || saving} onClick={() => setEditing((value) => !value)}>{editing ? "Cancel edit" : "Edit"}</Button>
        {item.approvalStatus !== "approved" && <Button size="sm" variant="outline" disabled={busy || saving || item.acceptanceCriteria.length === 0 || item.approvalStatus === "needs_clarification"} onClick={() => onApprove(item.id)}>
          <Check /> {busy ? "Approving…" : "Approve"}
        </Button>}
      </div>}
      {editing && <form className="w-full space-y-3 border-t border-border pt-3" onSubmit={(event) => void save(event)}>
        <label className="block space-y-1 text-xs text-fg-secondary">Edit title<input className={field} required maxLength={300} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="block space-y-1 text-xs text-fg-secondary">Edit description<textarea className={field} maxLength={10000} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <div className="space-y-2"><p className="text-xs font-medium">Acceptance criteria</p>
          {criteria.map((criterion, index) => <div key={criterion.id ?? index} className="flex items-end gap-2">
            <label className="flex-1 space-y-1 text-xs text-fg-secondary">Criterion {index + 1}<input className={field} required maxLength={2000} value={criterion.text} onChange={(event) => setCriteria(criteria.map((entry, at) => at === index ? { ...entry, text: event.target.value } : entry))} /></label>
            <Button type="button" variant="outline" size="sm" onClick={() => setCriteria(criteria.filter((_, at) => at !== index))}>Remove</Button>
          </div>)}
          <Button type="button" variant="outline" size="sm" onClick={() => setCriteria([...criteria, { text: "" }])}>Add criterion</Button>
        </div>
        <Button type="submit" disabled={saving || !title.trim() || !criteria.length || criteria.some((criterion) => !criterion.text.trim())}>{saving ? "Saving…" : "Save requirement"}</Button>
        {editError && <p role="alert" className="text-xs text-fail">{editError}</p>}
      </form>}
    </li>
  );
}

function NewRequirementForm({ onCreate }: { onCreate: (args: { title: string; description: string; acceptanceCriteria: string[] }) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [criteriaText, setCriteriaText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const acceptanceCriteria = criteriaText.split("\n").map((text) => text.trim()).filter(Boolean);
    if (busy || !title.trim() || !acceptanceCriteria.length) return;
    setBusy(true);
    setError("");
    try {
      await onCreate({ title: title.trim(), description: description.trim(), acceptanceCriteria });
      setTitle("");
      setDescription("");
      setCriteriaText("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create requirement. Retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3">
      <label className="min-w-56 flex-1 space-y-1.5 text-xs text-fg-secondary">
        Title
        <input className={field} value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={300} placeholder="What should the product do?" />
      </label>
      <label className="block space-y-1.5 text-xs text-fg-secondary">Description
        <textarea className={field} maxLength={10000} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label className="block space-y-1.5 text-xs text-fg-secondary">Acceptance criteria (one per line)
        <textarea className={field} required maxLength={20000} value={criteriaText} onChange={(event) => setCriteriaText(event.target.value)} placeholder="An observable outcome" />
      </label>
      <Button type="submit" disabled={busy || !title.trim() || !criteriaText.trim()}>
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
  onUpdate,
}: {
  items: Requirement[];
  canManage: boolean;
  approvingId: string | null;
  onApprove: (id: string) => void;
  onUpdate: (id: string, args: RequirementEdit) => Promise<void>;
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
        <RequirementRow key={item.id} item={item} canManage={canManage} busy={approvingId === item.id} onApprove={onApprove} onUpdate={onUpdate} />
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
  onUpdate,
}: {
  data: RequirementsQuery;
  unavailable: boolean;
  items: Requirement[];
  canManage: boolean;
  approvingId: string | null;
  onApprove: (id: string) => void;
  onUpdate: (id: string, args: RequirementEdit) => Promise<void>;
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
  return <RequirementsList items={items} canManage={canManage} approvingId={approvingId} onApprove={onApprove} onUpdate={onUpdate} />;
}

export function RequirementsContent({ projectId }: { projectId: string }) {
  const { identity, project, data, canManage, unavailable, create, update, approve } = useRequirements(projectId);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState("");

  async function handleApprove(id: string) {
    setApprovingId(id);
    setApprovalError("");
    try { await approve(id); }
    catch (cause) { setApprovalError(cause instanceof Error ? cause.message : "Could not approve requirement. Retry."); }
    finally { setApprovingId(null); }
  }

  const error = identity.error || project.error;
  if (error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{error.message}</p></div>;
  if (identity.isPending || project.isPending) return <LoadingScreen label="Loading requirements" />;

  const items = data.data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Requirements" description="Define what this product should do, then approve before testing." />
      <StatsRow items={items} projectName={project.data?.name} />
      {approvalError && <p role="alert" className="text-xs text-fail">{approvalError}</p>}
      {canManage && (
        <section className="rounded-2xl border border-border bg-panel p-4">
          <NewRequirementForm onCreate={create} />
        </section>
      )}
      <RequirementsBody
        data={data}
        unavailable={unavailable}
        items={items}
        canManage={!!canManage}
        approvingId={approvingId}
        onApprove={(id) => void handleApprove(id)}
        onUpdate={update}
      />
    </div>
  );
}
