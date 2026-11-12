"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { backendAuth } from "@/features/auth";
import { useRuns } from "@/features/runs";
import { OverviewDashboard } from "@/features/overview";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";

// eslint-disable-next-line complexity -- Keep project identity and execution availability states together.
export function OverviewContent({ projectId }: { projectId: string }) {
  const [identityVersion, setIdentityVersion] = useState(0);
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: () => backendAuth.getUser().then((user) => { if (!user) throw new Error("Sign in to open this project."); return user; }), retry: false, staleTime: 0, gcTime: 0 });
  useEffect(() => { const refresh = () => setIdentityVersion((version) => version + 1); window.addEventListener("blindspot:auth-changed", refresh); const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null; if (channel) channel.onmessage = refresh; return () => { window.removeEventListener("blindspot:auth-changed", refresh); channel?.close(); }; }, []);
  const project = useQuery({ queryKey: ["workspace", identity.data?.id, "project", projectId], queryFn: () => workspaceApi.project(projectId), enabled: !!identity.data, retry: false });
  const { data: runs, isLoading, error, isError } = useRuns(projectId);
  const runUnavailable = isError && error instanceof Error && "status" in error && error.status === 501;

  if (identity.isPending) return <LoadingScreen label="Checking your account" />;
  if (identity.error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{identity.error.message}</p><Link href="/login" className="text-sm text-accent underline">Sign in</Link></div>;
  if (project.isPending) return <LoadingScreen label="Loading project" />;
  if (project.error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{project.error.message}</p><Link href="/dashboard" className="text-sm text-accent underline">Back to dashboard</Link></div>;
  if (isLoading) return <LoadingScreen label="Loading overview" />;
  const actions = <div className="flex items-center gap-4"><Link href={`/projects/${projectId}/setup`} className="text-sm text-accent underline">Project setup</Link><Link href={`/projects/${projectId}/members`} className="text-sm text-accent underline">Members</Link></div>;
  if (isError && error && !runUnavailable) return <><PageHeader title={project.data.name} description={project.data.description || "Project overview"} actions={actions} /><div role="alert" className="mt-6 space-y-4"><p className="text-sm text-fail">Failed to load overview data</p><Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button></div></>;

  return <><PageHeader title={project.data.name} description={project.data.description || "Project overview"} actions={actions} />{runUnavailable ? <section aria-label="Analysis availability" className="mt-6 rounded-xl border border-border bg-panel p-5"><h2 className="text-sm font-semibold">Analysis is not connected yet</h2><p className="mt-2 text-xs text-fg-tertiary">Project run history is not connected to the execution service yet. No sample or inferred runs are shown.</p></section> : <OverviewDashboard runs={runs ?? []} projectId={projectId} />}</>;
}
