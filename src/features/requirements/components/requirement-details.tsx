"use client";
import { useState } from "react";
import { Check, LoaderCircle, Pencil, Undo2, FileText, AlertTriangle } from "lucide-react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/components/ui/button";
import { categoryLabel, priorityLabel } from "@/shared/lib/labels";
import type { Requirement } from "../types";
import { ApprovalBadge, VerdictBadge } from "./requirement-badges";

function SourceDocumentation({ requirement }: { requirement: Requirement }) {
  const source = requirement.source;
  return <section className="rounded-xl border border-border bg-canvas p-4"><h4 className="mb-2 flex items-center gap-2 text-sm font-semibold"><FileText className="size-4 text-fg-tertiary" />Source documentation</h4>{source.excerpt ? <><p className="text-xs text-fg-tertiary">{source.documentRole?.toUpperCase()} · {source.documentName}</p><blockquote className="mt-3 max-h-52 overflow-y-auto whitespace-pre-wrap border-l-2 border-border-strong pl-3 text-sm leading-relaxed text-fg-secondary">{source.excerpt}</blockquote></> : <p className="text-sm text-fg-tertiary">{source.kind === "manual" ? "Manually documented" : source.documentName || "Source excerpt unavailable"}</p>}</section>;
}
function AcceptanceCriteria({ requirement }: { requirement: Requirement }) {
  return <section><h4 className="mb-3 text-sm font-semibold">Acceptance criteria</h4>{requirement.acceptanceCriteria.length ? <ol className="space-y-3">{requirement.acceptanceCriteria.map((criterion, index) => <li key={criterion.id ?? index} className="flex items-start gap-3 text-sm leading-relaxed text-fg-secondary"><span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px]">{index + 1}</span>{criterion.text}</li>)}</ol> : <p className="text-sm text-fg-tertiary">Add acceptance criteria before approving this requirement.</p>}</section>;
}
function ReviewActions({ busy, approved, blocked, canManage, onClose, onEdit, onReview }: { busy: boolean; approved: boolean; blocked: boolean; canManage: boolean; onClose: () => void; onEdit: () => void; onReview: () => void }) {
  return <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5"><Button variant="outline" disabled={busy} onClick={onClose}>Close</Button>{canManage && <><Button variant="outline" disabled={busy} onClick={onEdit}><Pencil className="size-4" />Edit</Button><Button disabled={busy || (!approved && blocked)} onClick={onReview}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : approved ? <Undo2 className="size-4" /> : <Check className="size-4" />}{approved ? "Return to draft" : "Approve"}</Button></>}</div>;
}
export function RequirementDetails({ requirement, canManage, onClose, onEdit, onApprove }: { requirement: Requirement; canManage: boolean; onClose: () => void; onEdit: () => void; onApprove: (id: string, approved: boolean) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const approved = requirement.approvalStatus === "approved";
  const blocked = requirement.approvalStatus === "needs_clarification" || !requirement.acceptanceCriteria.length;
  async function review() {
    setBusy(true); setError("");
    try { await onApprove(requirement.id, !approved); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update review status. Please retry."); }
    finally { setBusy(false); }
  }
  return <Modal title="Requirement details" onClose={onClose} busy={busy} wide><div className="space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-fg-tertiary">{requirement.id.slice(0, 8)}</span><ApprovalBadge status={requirement.approvalStatus} /><VerdictBadge verdict={requirement.latestVerdict} /></div><div><h3 className="text-xl font-semibold leading-snug tracking-tight">{requirement.title}</h3>{requirement.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg-secondary">{requirement.description}</p>}</div><AcceptanceCriteria requirement={requirement} /><div className="flex gap-3 text-xs text-fg-tertiary"><span>{categoryLabel(requirement.category)}</span><span>·</span><span>{priorityLabel(requirement.priority)} priority</span></div><SourceDocumentation requirement={requirement} />{!!requirement.source.warnings.length && <div className="flex gap-2 rounded-lg border border-warn-border bg-warn-tint p-3 text-xs leading-relaxed text-warn"><AlertTriangle className="size-4 shrink-0" /><ul className="space-y-1">{requirement.source.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}{error && <p role="alert" className="text-sm text-fail">{error}</p>}<ReviewActions busy={busy} approved={approved} blocked={blocked} canManage={canManage} onClose={onClose} onEdit={onEdit} onReview={() => void review()} /></div></Modal>;
}
