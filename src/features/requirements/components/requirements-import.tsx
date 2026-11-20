"use client";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileUp, LoaderCircle, CheckCircle2, AlertTriangle, ArrowRight, FileText, RotateCw, X } from "lucide-react";
import { workspaceApi, WorkspaceApiError, type WorkspaceApiTypes } from "@/features/workspace/workspace-api";
import { Button } from "@/components/ui/button";
import { Modal } from "@/shared/ui/Modal";
import { DOCUMENT_ROLES, documentFormData, documentValidation, type DocumentSet, type DocumentRole } from "./import-documents";

const newImportKey = () => crypto.randomUUID();

/** BE's own 409 copy names an Idempotency-Key header, which is ours to manage
 *  and not something a reviewer can act on. Translate by code instead. */
function importError(cause: unknown) {
  if (!(cause instanceof WorkspaceApiError)) return "Could not import requirements. Please retry.";
  // Status 0 is an aborted or failed request: extraction may still be running.
  if (cause.status === 0) return "This import did not report back and may still be running. Retry — the upload is tracked, so retrying will not create duplicate drafts.";
  if (cause.code === "conflict") return "These documents changed since the last attempt. Retry to start a fresh import.";
  if (cause.code === "import_pending") return "This import is still being extracted. Retry in a moment to pick up its drafts.";
  return cause.message;
}

function ImportResult({ result, onClose }: { result: WorkspaceApiTypes["ImportResult"]; onClose: () => void }) {
  return <div className="space-y-4"><CheckCircle2 className="mt-3 size-9 text-pass" /><h3 className="text-xl font-semibold">{result.requirements.length} new draft{result.requirements.length === 1 ? "" : "s"} ready for review</h3><p className="text-sm text-fg-tertiary">Read {result.documents.length} source documents. Review each requirement and its supporting excerpt before approving it.</p><div className="rounded-xl border border-border bg-canvas p-4"><h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">Source documents</h4><ul className="space-y-2">{result.documents.map((document) => <li key={document.id} className="flex items-center gap-2 text-sm"><FileText className="size-4 shrink-0 text-fg-tertiary" /><span className="min-w-0 flex-1 break-words">{document.filename}</span><span className="rounded bg-raised px-2 py-1 text-[11px] uppercase text-fg-tertiary">{document.role.replace("_", " ")}</span></li>)}</ul></div>{!!result.warnings.length && <div className="rounded-xl border border-warn-border bg-warn-tint p-4 text-sm text-warn"><h4 className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4" />Import notes</h4><ul className="mt-2 list-disc space-y-1 pl-5">{result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}<div className="flex justify-end border-t border-border pt-5"><Button onClick={onClose}>Review requirements <ArrowRight className="size-4" /></Button></div></div>;
}
function DocumentUploads({ files, busy, onChange }: { files: DocumentSet; busy: boolean; onChange: (files: DocumentSet) => void }) {
  const inputs = useRef<Partial<Record<DocumentRole, HTMLInputElement>>>({});
  return <div className="space-y-3"><p className="text-sm leading-relaxed text-fg-tertiary">Attach your business and software requirements in their existing layout. Add a design specification when available.</p>{DOCUMENT_ROLES.map(({ role, label, required }) => <div key={role} className="rounded-xl border border-border bg-canvas p-4"><label className="block"><span className="flex items-center gap-2 text-xs"><FileUp className="size-4 shrink-0 text-fg-tertiary" /><strong className="font-medium">{label}</strong><span className="ml-auto shrink-0 text-[11px] text-fg-quaternary">{required ? "Required" : "Optional"}</span></span><input ref={(node) => { if (node) inputs.current[role] = node; }} aria-label={label} required={required} disabled={busy} type="file" accept=".pdf,.docx,.md,.markdown,.txt" className="mt-3 block w-full min-w-0 rounded-lg border border-border bg-panel p-2 text-xs text-fg-secondary file:mr-3 file:rounded-md file:border-0 file:bg-raised file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50" onChange={(event) => onChange({ ...files, [role]: event.target.files?.[0] ?? null })} /></label>{files[role] && <p className="mt-2 flex items-center gap-2 text-[11px] text-fg-tertiary"><CheckCircle2 className="size-3 text-pass" />{Math.ceil(files[role].size / 1024)} KB selected<button type="button" disabled={busy} aria-label={`Remove ${label}`} className="ml-auto rounded p-1 hover:bg-hover focus-visible:ring-3 focus-visible:ring-focus-ring/50" onClick={() => { const input = inputs.current[role]; if (input) input.value = ""; onChange({ ...files, [role]: null }); }}><X className="size-3" /></button></p>}</div>)}<p className="text-xs leading-relaxed text-fg-tertiary">Word (.docx), PDF, UTF-8 Markdown or text · 10 MiB combined. PDFs need selectable text.</p></div>;
}
export function RequirementsImport({ projectId, projectName, userId, onClose }: { projectId: string; projectName: string; userId: string; onClose: () => void }) {
  const cache = useQueryClient();
  const [files, setFiles] = useState<DocumentSet>({ brd: null, srs: null, design_spec: null });
  // One key per document selection, not per attempt: retrying an aborted or
  // failed submit replays that import rather than starting a second one.
  const [importKey, setImportKey] = useState(newImportKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<WorkspaceApiTypes["ImportResult"] | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const validation = documentValidation(files);
    if (validation) { setError(validation); return; }
    setBusy(true); setError("");
    try {
      const response = await workspaceApi.importRequirements(projectId, documentFormData(files), importKey);
      setResult(response);
      await Promise.all([cache.invalidateQueries({ queryKey: ["workspace", userId, projectId, "requirements"] }), cache.invalidateQueries({ queryKey: ["workspace", userId, projectId, "overview-requirements"] })]);
    } catch (cause) {
      // A rejected fingerprint means this key is spent; the next attempt needs a new one.
      if (cause instanceof WorkspaceApiError && cause.code === "conflict") setImportKey(newImportKey());
      setError(importError(cause));
    }
    finally { setBusy(false); }
  }
  return <Modal title="Import requirements" busy={busy} onClose={onClose}>{result ? <ImportResult result={result} onClose={onClose} /> : <><p className="mb-5 text-sm leading-relaxed text-fg-tertiary">Extract documented expectations for <strong className="font-medium text-fg">{projectName}</strong>. BRD and SRS are required; design specifications are optional. AI output is always saved for review.</p><form onSubmit={(event) => void submit(event)}><DocumentUploads files={files} busy={busy} onChange={(next) => { setFiles(next); setError(""); setImportKey(newImportKey()); }} /><div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-canvas p-3 text-xs leading-relaxed text-fg-tertiary"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><p>Documentation is sent to your configured AI provider. Only upload content you are authorized to share. Review source excerpts before approval.</p></div>{error && <div role="alert" className="mt-4 rounded-lg border border-fail-border bg-fail-tint p-3 text-sm text-fail"><p>{error}</p></div>}{busy && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-fg-secondary"><LoaderCircle className="size-4 shrink-0 animate-spin" />Reading sources and extracting requirements. This may take up to two minutes…</p>}<div className="mt-5 flex justify-end gap-3 border-t border-border pt-5"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy || !files.brd || !files.srs}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : error ? <RotateCw className="size-4" /> : <ArrowRight className="size-4" />}{busy ? "Importing…" : error ? "Retry import" : "Extract requirements"}</Button></div></form></>}</Modal>;
}
