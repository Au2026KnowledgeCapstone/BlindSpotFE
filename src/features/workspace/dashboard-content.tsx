"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./use-dashboard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";

// eslint-disable-next-line complexity -- Keep the project list and invitation acceptance states together.
export function DashboardContent() {
  const { identity, projects, invitations, acceptInvitation } = useDashboard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function accept(id: string) {
    setBusy(true);
    setError("");
    try {
      await acceptInvitation(id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not accept invitation. Retry.");
    } finally { setBusy(false); }
  }

  if (identity.error) return <main className="space-y-3"><p role="alert" className="text-sm text-fail">{identity.error.message}</p><Button variant="outline" size="sm" onClick={() => void identity.refetch()}>Retry identity check</Button></main>;
  if (identity.isPending) return <LoadingScreen label="Checking your account" />;

  return <div className="space-y-8">
    <PageHeader title="Dashboard" />
    {error && <p role="alert" className="rounded-md border border-fail-border bg-fail-tint p-3 text-sm text-fail">{error}</p>}
    <section aria-labelledby="project-list-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="project-list-heading" className="text-sm font-semibold text-fg">Your projects</h2>
        <Link href="/onboarding" className="text-xs text-accent underline-offset-4 hover:underline">Add project</Link>
      </div>
      {projects.isPending ? <p role="status" className="text-xs text-fg-tertiary">Loading projects…</p> : projects.error ? <div role="alert" className="space-y-2 rounded-md border border-border bg-panel p-4 text-sm"><p>{projects.error.message}</p><Button variant="outline" size="sm" onClick={() => void projects.refetch()}>Retry</Button></div> : projects.data?.length ? <ul className="divide-y divide-subtle overflow-hidden rounded-lg border border-border bg-panel">{projects.data.map((project) => <li key={project.id}><Link href={`/projects/${project.id}`} className="group flex min-h-14 items-center gap-3 px-4 py-3 text-sm hover:bg-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"><FolderKanban aria-hidden className="size-4 text-fg-tertiary" /><span className="min-w-0 flex-1 truncate font-medium">{project.name}</span><span className="text-xs text-fg-tertiary">{project.role ?? "Project"}</span><ChevronRight aria-hidden className="size-4 text-fg-quaternary group-hover:text-fg-tertiary" /></Link></li>)}</ul> : <EmptyState icon={FolderKanban} title="No projects yet" description="Add your first project to start running tests." action={<Link href="/onboarding" className="text-xs text-accent underline-offset-4 hover:underline">Add project</Link>} />}
    </section>
    <section aria-labelledby="invitation-heading" className="space-y-3">
      <h2 id="invitation-heading" className="text-sm font-semibold text-fg">Invitations</h2>
      {invitations.isPending ? <p role="status" className="text-xs text-fg-tertiary">Loading invitations…</p> : invitations.error ? <div role="alert" className="space-y-2 text-sm text-fail"><p>{invitations.error.message}</p><Button variant="outline" size="sm" onClick={() => void invitations.refetch()}>Retry</Button></div> : invitations.data?.length ? <ul className="divide-y divide-subtle rounded-lg border border-border bg-panel">{invitations.data.map((item) => <li key={item.id} className="flex flex-wrap items-center gap-3 p-4"><span className="min-w-0 flex-1 text-sm">{item.email} · {item.role} invitation</span><Button variant="outline" size="sm" disabled={busy} onClick={() => void accept(item.id)}>Accept</Button></li>)}</ul> : <p className="text-xs text-fg-tertiary">No pending invitations.</p>}
    </section>
  </div>;
}
