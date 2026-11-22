"use client";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import type { WorkspaceApiTypes } from "./workspace-api";
import { useProjectInfrastructure } from "./use-project-infrastructure";
import { EnvironmentEditor } from "./components/setup/environment-editor";
import { EnvironmentCards } from "./components/setup/environment-cards";
import { EnvironmentAuthentication } from "./components/setup/environment-authentication";

// eslint-disable-next-line complexity -- Project guards and permission-gated dialogs belong to this single setup scope.
export function ProjectInfrastructure({ projectId, environmentOnly = false }: { projectId: string; environmentOnly?: boolean }) {
  const { identity, project, data, canManage, refresh } = useProjectInfrastructure(projectId);
  const [selectedId, setSelectedId] = useState("");
  const [editor, setEditor] = useState<WorkspaceApiTypes["Environment"] | "new" | null>(null);
  const error = identity.error || project.error || data.error;
  if (error) return <div role="alert" className="space-y-4 rounded-2xl border border-fail-border bg-fail-tint p-6"><p className="text-sm text-fail">{error.message}</p><Button variant="outline" onClick={() => { void identity.refetch(); void project.refetch(); void data.refetch(); }}>Retry</Button></div>;
  if (identity.isPending || project.isPending || data.isPending) return <LoadingScreen label="Loading project setup" />;
  const workspace = data.data!;
  const selected = workspace.environments.find((environment) => environment.id === selectedId) ?? workspace.environments[0];
  return <div className="space-y-7"><PageHeader title={environmentOnly ? "Environments" : "Project Setup & Discovery"} />
    {!canManage && <p className="flex items-center gap-2 rounded-xl border border-border bg-panel px-4 py-3 text-xs text-fg-tertiary"><LockKeyhole className="size-4 shrink-0" />You have view access. Project owners and admins can update configuration.</p>}
    <EnvironmentCards environments={workspace.environments} selectedId={selected?.id} canManage={canManage} onSelect={setSelectedId} onEdit={setEditor} onCreate={() => setEditor("new")} />
    {selected && <EnvironmentAuthentication key={selected.id} environment={selected} projectId={projectId} canManage={canManage} onChanged={refresh} />}
    {editor && canManage && <EnvironmentEditor projectId={projectId} applications={workspace.applications} projectName={project.data!.name} {...(editor !== "new" ? { environment: editor } : {})} onClose={() => setEditor(null)} onSaved={async (environment) => { setSelectedId(environment.id); await refresh(); }} />}
  </div>;
}
