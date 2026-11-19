"use client";

import Link from "next/link";
import { useState } from "react";
import { ProjectCreateModal } from "./components/project-create-modal";
import { ChevronRight, FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./use-dashboard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";

export function DashboardContent() {
  const { identity, projects } = useDashboard();
  const [creating, setCreating] = useState(false);

  if (identity.error) return <div className="space-y-3"><p role="alert" className="text-sm text-fail">{identity.error.message}</p><Button variant="outline" size="sm" onClick={() => void identity.refetch()}>Retry identity check</Button></div>;
  if (identity.isPending) return <LoadingScreen label="Checking your account" />;

  return <div className="space-y-8">
    <div className="space-y-3"><PageHeader title="Dashboard" description="Continuous requirement verification, test health, and browser execution across your projects." actions={<Button onClick={() => setCreating(true)}><Plus className="size-4" />New project</Button>} /></div>
    <section aria-labelledby="project-list-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 id="project-list-heading" className="text-xl font-semibold tracking-tight text-fg">Your projects</h2><p className="mt-1 text-sm text-fg-tertiary">Connected applications and their testing workspaces.</p></div>
      </div>
      {projects.isPending ? <p role="status" className="text-xs text-fg-tertiary">Loading projects…</p> : projects.error ? <div role="alert" className="space-y-2 rounded-md border border-border bg-panel p-4 text-sm"><p>{projects.error.message}</p><Button variant="outline" size="sm" onClick={() => void projects.refetch()}>Retry</Button></div> : projects.data?.length ? <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{projects.data.map((project) => <li key={project.id}><Link href={`/projects/${project.id}`} className="group flex h-full min-h-36 flex-wrap items-center gap-3 rounded-xl border border-border bg-panel p-6 text-sm shadow-ambient transition-colors hover:border-accent-border focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-lg font-semibold text-accent">{project.name.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1 break-words text-base font-semibold">{project.name}</span><span className="rounded-full bg-raised px-2.5 py-1 text-xs capitalize text-fg-tertiary">{project.role ?? "Project"}</span><ChevronRight aria-hidden className="size-4 text-fg-quaternary group-hover:text-fg-tertiary" /></Link></li>)}</ul> : <EmptyState icon={FolderKanban} title="No projects yet" description="Add your first project to start running tests." action={<Button variant="outline" onClick={() => setCreating(true)}>Add project</Button>} />}
    </section>
    {creating && <ProjectCreateModal onClose={() => setCreating(false)} onCreated={() => { void projects.refetch(); }} />}
  </div>;
}
