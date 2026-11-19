"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/shared/ui/Modal";
import { FIELD } from "@/shared/ui/field";
import { workspaceApi } from "../workspace-api";

export function ProjectCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true); setError("");
    try {
      const project = await workspaceApi.createProject({ name: name.trim() });
      onCreated(); onClose(); router.push(`/projects/${encodeURIComponent(project.id)}/setup`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create project. Please retry.");
      setBusy(false);
    }
  }
  return <Modal title="New project" onClose={onClose} busy={busy}><div className="mb-6 flex items-start gap-3 rounded-xl border border-subtle bg-canvas p-4"><FolderPlus className="mt-0.5 size-5 shrink-0 text-fg-tertiary" /><p className="text-sm leading-relaxed text-fg-secondary">Create a project to organize your requirements and browser checks.</p></div><form onSubmit={(event) => void submit(event)}><label className="flex flex-col gap-2 text-sm font-medium">Project name<input className={FIELD} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Customer portal" required maxLength={120} disabled={busy} autoFocus /></label>{error && <p role="alert" className="mt-4 text-sm text-fail">{error}</p>}<div className="mt-6 flex justify-end gap-3 border-t border-border pt-5"><Button type="button" variant="outline" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy || !name.trim()}>{busy && <LoaderCircle className="size-4 animate-spin" />}{busy ? "Creating…" : "Create project"}</Button></div></form></Modal>;
}
