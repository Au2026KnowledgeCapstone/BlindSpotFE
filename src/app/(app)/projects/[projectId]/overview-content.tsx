"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { backendAuth } from "@/features/auth";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ProjectOverviewGrid } from "@/features/workspace/project-overview-grid";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";

export function OverviewContent({ projectId }: { projectId: string }) {
  const [identityVersion, setIdentityVersion] = useState(0);
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: () => backendAuth.getUser().then((user) => { if (!user) throw new Error("Sign in to open this project."); return user; }), retry: false, staleTime: 0, gcTime: 0 });
  useEffect(() => { const refresh = () => setIdentityVersion((version) => version + 1); window.addEventListener("blindspot:auth-changed", refresh); const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null; if (channel) channel.onmessage = refresh; return () => { window.removeEventListener("blindspot:auth-changed", refresh); channel?.close(); }; }, []);
  const project = useQuery({ queryKey: ["workspace", identity.data?.id, "project", projectId], queryFn: () => workspaceApi.project(projectId), enabled: !!identity.data, retry: false });

  if (identity.isPending) return <LoadingScreen label="Checking your account" />;
  if (identity.error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{identity.error.message}</p><Link href="/login" className="text-sm text-accent underline">Sign in</Link></div>;
  if (project.isPending) return <LoadingScreen label="Loading project" />;
  if (project.error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{project.error.message}</p><Link href="/dashboard" className="text-sm text-accent underline">Back to dashboard</Link></div>;
  const actions = <div className="flex items-center gap-3"><Link href={`/projects/${projectId}/requirements`} className="rounded-full border border-strong bg-panel px-4 py-2.5 text-sm font-medium">Import requirements</Link><Link href={`/projects/${projectId}/runs`} className="rounded-full bg-contrast px-5 py-2.5 text-sm font-medium text-on-contrast">View analysis →</Link></div>;
  return <>
    <PageHeader title={project.data.name} description="A clearer view of this product, from expectations to evidence." actions={actions} />
    <div className="mt-7 space-y-8">
      <ProjectOverviewGrid projectId={projectId} userId={identity.data!.id} name={project.data.name} description={project.data.description} />
    </div>
  </>;
}
