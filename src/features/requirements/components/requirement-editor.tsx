"use client";
import { useState } from "react";
import { Plus, Trash2, LoaderCircle } from "lucide-react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/components/ui/button";
import { FIELD, FIELD_TEXTAREA } from "@/shared/ui/field";
import { categoryLabel, priorityLabel } from "@/shared/lib/labels";
import type { Requirement, RequirementCategory, RequirementPriority } from "../types";
export type RequirementEditValues = { title: string; description: string; category: RequirementCategory; priority: RequirementPriority; acceptanceCriteria: { id?: string; text: string }[] };
type DraftCriterion = { id?: string; text: string; key: number };
function initialValues(requirement: Requirement | undefined) {
  if (!requirement) return { title: "", description: "", category: "functional" as const, priority: "medium" as const, criteria: [{ text: "", key: 0 }] };
  return { title: requirement.title, description: requirement.description, category: requirement.category, priority: requirement.priority, criteria: requirement.acceptanceCriteria.map((criterion, key) => ({ ...(criterion.id ? { id: criterion.id } : {}), text: criterion.text, key })) };
}
function invalidDraft(title: string, criteria: DraftCriterion[]) { return !title.trim() || criteria.some((criterion) => !criterion.text.trim()); }
export function RequirementEditor({ requirement, onClose, onSave }: { requirement?: Requirement; onClose: () => void; onSave: (values: RequirementEditValues) => Promise<void> }) {
  const initial = initialValues(requirement);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState<RequirementCategory>(initial.category);
  const [priority, setPriority] = useState<RequirementPriority>(initial.priority);
  const [criteria, setCriteria] = useState<DraftCriterion[]>(initial.criteria);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try { await onSave({ title: title.trim(), description: description.trim(), category, priority, acceptanceCriteria: criteria.map(({ id, text }) => ({ ...(id ? { id } : {}), text: text.trim() })) }); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save requirement. Please retry."); }
    finally { setBusy(false); }
  }
  return <Modal title={requirement ? "Edit requirement" : "Add requirement"} onClose={onClose} busy={busy} wide><p className="mb-5 text-sm leading-relaxed text-fg-tertiary">Document a clear expectation and observable acceptance criteria. {requirement ? "Changes return this requirement to draft for review." : "New requirements start as drafts."}</p><form onSubmit={(event) => void submit(event)}><fieldset disabled={busy} className="space-y-4"><label className="block space-y-2 text-sm font-medium">Title<input className={FIELD} required maxLength={300} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What should the product do?" /></label><label className="block space-y-2 text-sm font-medium">Description<textarea className={`${FIELD_TEXTAREA} min-h-24`} maxLength={10000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add context and expected behavior…" /></label><div className="grid grid-cols-2 gap-4"><label className="space-y-2 text-sm font-medium">Category<select className={FIELD} value={category} onChange={(event) => setCategory(event.target.value as RequirementCategory)}>{(["functional", "ux", "data", "performance", "security"] as const).map((value) => <option key={value} value={value}>{categoryLabel(value)}</option>)}</select></label><label className="space-y-2 text-sm font-medium">Priority<select className={FIELD} value={priority} onChange={(event) => setPriority(event.target.value as RequirementPriority)}>{(["critical", "high", "medium", "low"] as const).map((value) => <option key={value} value={value}>{priorityLabel(value)}</option>)}</select></label></div><section><h3 className="mb-3 text-sm font-medium">Acceptance criteria</h3><div className="space-y-3">{criteria.map((criterion, index) => <div key={criterion.key} className="flex items-center gap-2"><span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs text-fg-tertiary">{index + 1}</span><input aria-label={`Criterion ${index + 1}`} className={FIELD} required maxLength={2000} value={criterion.text} onChange={(event) => setCriteria(criteria.map((value) => value.key === criterion.key ? { ...value, text: event.target.value } : value))} placeholder="An observable outcome" /><Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove criterion ${index + 1}`} disabled={criteria.length === 1} onClick={() => setCriteria(criteria.filter((value) => value.key !== criterion.key))}><Trash2 className="size-4" /></Button></div>)}</div><Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setCriteria([...criteria, { text: "", key: Math.max(-1, ...criteria.map((value) => value.key)) + 1 }])}><Plus className="size-3.5" />Add criterion</Button></section></fieldset>{error && <p role="alert" className="mt-4 text-sm text-fail">{error}</p>}<div className="mt-6 flex justify-end gap-3 border-t border-border pt-5"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy || invalidDraft(title, criteria)}>{busy && <LoaderCircle className="size-4 animate-spin" />}{busy ? "Saving…" : "Save requirement"}</Button></div></form></Modal>;
}
