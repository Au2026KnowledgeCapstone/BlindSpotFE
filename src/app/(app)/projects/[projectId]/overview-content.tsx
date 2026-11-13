"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { backendAuth } from "@/features/auth";
import type { Run } from "@/features/analysis";
import { useProjectRuns } from "@/features/analysis";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { StatusBadge } from "@/shared/ui/StatusBadge";

function RecentRuns({ projectId, runs }: { projectId: string; runs: Run[] }) {
  const recent = runs.slice(0, 10);
  return <section className="mt-6 space-y-3" aria-label="Recent runs">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold">Recent runs</h2>
      <Link href={`/projects/${projectId}/runs`} className="text-xs text-accent underline">All runs</Link>
    </div>
    {recent.length ? <ul className="divide-y divide-subtle rounded-xl border border-border bg-panel">
      {recent.map((run) => <li key={run.id}>
        <Link className="flex flex-wrap items-center gap-3 p-3 text-sm hover:bg-hover" href={`/projects/${projectId}/runs/${run.id}?environmentId=${run.environmentId}`}>
          <span className="font-mono">#{run.runNumber}</span>
          <StatusBadge status={run.status} />
          <span className="min-w-0 flex-1 truncate text-fg-secondary">{run.requirementSnapshots.length} requirement{run.requirementSnapshots.length === 1 ? "" : "s"}</span>
          <time className="text-xs text-fg-tertiary" dateTime={run.queuedAt}>{new Date(run.queuedAt).toLocaleString()}</time>
        </Link>
      </li>)}
    </ul> : <p className="rounded-xl border border-border bg-panel p-4 text-sm text-fg-secondary">No runs yet. Create an environment and approve a requirement to start one.</p>}
  </section>;
}

// eslint-disable-next-line complexity -- Keep identity, project and run query states together.
export function OverviewContent({ projectId }: { projectId: string }) {
  const [identityVersion, setIdentityVersion] = useState(0);
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: () => backendAuth.getUser().then((user) => { if (!user) throw new Error("Sign in to open this project."); return user; }), retry: false, staleTime: 0, gcTime: 0 });
  useEffect(() => { const refresh = () => setIdentityVersion((version) => version + 1); window.addEventListener("blindspot:auth-changed", refresh); const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null; if (channel) channel.onmessage = refresh; return () => { window.removeEventListener("blindspot:auth-changed", refresh); channel?.close(); }; }, []);
  const project = useQuery({ queryKey: ["workspace", identity.data?.id, "project", projectId], queryFn: () => workspaceApi.project(projectId), enabled: !!identity.data, retry: false });
  const runs = useProjectRuns(projectId, identity.data?.id, !!project.data);

  if (identity.isPending) return <LoadingScreen label="Checking your account" />;
  if (identity.error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{identity.error.message}</p><Link href="/login" className="text-sm text-accent underline">Sign in</Link></div>;
  if (project.isPending) return <LoadingScreen label="Loading project" />;
  if (project.error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{project.error.message}</p><Link href="/dashboard" className="text-sm text-accent underline">Back to dashboard</Link></div>;
  const actions = <div className="flex items-center gap-4"><Link href={`/projects/${projectId}/setup`} className="text-sm text-accent underline">Project setup</Link><Link href={`/projects/${projectId}/members`} className="text-sm text-accent underline">Members</Link></div>;
  if (runs.isPending) return <LoadingScreen label="Loading overview" />;
  if (runs.isError) return <><PageHeader title={project.data.name} description={project.data.description || "Project overview"} actions={actions} /><div role="alert" className="mt-6 space-y-4"><p className="text-sm text-fail">Could not load run history: {runs.error.message}</p><Button variant="outline" size="sm" onClick={() => void runs.refetch()}>Retry</Button></div></>;

  const all = runs.data;
  const active = all.filter((run) => run.status === "queued" || run.status === "running").length;
  const completed = all.filter((run) => run.status === "completed").length;
  const failed = all.filter((run) => run.status === "failed").length;
  return <>
    <PageHeader title={project.data.name} description={project.data.description || "Project overview"} actions={actions} />
    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Run summary">
      {[["Total runs", all.length], ["Active", active], ["Completed", completed], ["Failed", failed]].map(([label, value]) =>
        <div key={label} className="rounded-xl border border-border bg-panel p-4"><div className="text-xs text-fg-tertiary">{label}</div><div className="mt-2 font-mono text-2xl text-fg">{value}</div></div>)}
    </section>
    <RecentRuns projectId={projectId} runs={all} />
  </>;
}
