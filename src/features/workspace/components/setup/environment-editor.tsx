"use client";
import { useState } from "react";
import { Globe, LoaderCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FIELD } from "@/shared/ui/field";
import { Modal } from "@/shared/ui/Modal";
import { workspaceApi, type WorkspaceApiTypes } from "../../workspace-api";
import { environmentLabel } from "@/shared/lib/labels";

type Environment = WorkspaceApiTypes["Environment"];
function EnvironmentFields({ name, kind, url, setName, setKind, setUrl }: { name: string; kind: string; url: string; setName: (value: string) => void; setKind: (value: string) => void; setUrl: (value: string) => void }) {
  return <><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Environment name<input className={FIELD} required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Staging" /></label><label className="space-y-2 text-sm font-medium">Environment type<select aria-label="Environment type" className={FIELD} value={kind} onChange={(event) => setKind(event.target.value)}>{["development", "staging", "production"].map((value) => <option key={value} value={value}>{environmentLabel(value)}</option>)}</select></label></div><label className="block space-y-2 text-sm font-medium">Base URL<input aria-label="Base URL" className={FIELD} type="url" required maxLength={2048} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://staging.example.com" /><span className="block text-xs font-normal leading-relaxed text-fg-tertiary">The exact starting URL for browser checks. Include your application’s base path.</span></label></>;
}
// eslint-disable-next-line complexity -- Create and edit share validation, application selection, and the same modal lifecycle.
export function EnvironmentEditor({ projectId, applications, projectName, environment, onClose, onSaved }: { projectId: string; applications: WorkspaceApiTypes["Application"][]; projectName: string; environment?: Environment; onClose: () => void; onSaved: (environment: Environment) => Promise<void> }) {
  const [name, setName] = useState(environment?.name ?? "");
  const [kind, setKind] = useState(environment?.kind ?? "staging");
  const [url, setUrl] = useState(environment?.base_url ?? "");
  const [application, setApplication] = useState(applications[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      const changes = { name: name.trim(), kind, base_url: url.trim() };
      let applicationId = application;
      if (!environment && !applicationId) {
        const created = await workspaceApi.createApplication(projectId, projectName);
        applicationId = created.id; setApplication(applicationId);
      }
      const saved = environment ? await workspaceApi.updateEnvironment(projectId, environment.id, changes) : await workspaceApi.createEnvironment(projectId, { ...changes, application_id: applicationId });
      await onSaved({ ...saved, project_id: projectId }); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save environment. Please retry."); }
    finally { setBusy(false); }
  }
  return <Modal title={environment ? "Edit environment" : "New environment"} onClose={onClose} busy={busy}><p className="mb-6 text-sm leading-relaxed text-fg-tertiary">{environment ? "Update this target’s name, type, or starting URL. Changing the URL clears its verification." : "Connect a target to your application. You can configure its test login after saving."}</p><form onSubmit={(event) => void save(event)}><fieldset disabled={busy} className="space-y-5"><EnvironmentFields name={name} kind={kind} url={url} setName={setName} setKind={setKind} setUrl={setUrl} /><div className="flex items-start gap-3 rounded-xl border border-border bg-canvas p-4 text-xs leading-relaxed text-fg-tertiary"><Globe className="mt-0.5 size-4 shrink-0" /><p>Each environment keeps its own target URL, test credentials, and verification status.</p></div></fieldset>{error && <p role="alert" className="mt-4 text-sm text-fail">{error}</p>}<div className="mt-6 flex justify-end gap-3 border-t border-border pt-5"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy || !name.trim() || !url.trim()}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}{busy ? "Saving…" : environment ? "Save environment" : "Add environment"}</Button></div></form></Modal>;
}
