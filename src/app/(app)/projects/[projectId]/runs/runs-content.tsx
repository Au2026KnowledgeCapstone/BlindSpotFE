"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { useRuns } from "@/features/analysis";
import { workspaceApi } from "@/features/workspace";
import { RunHistory } from "@/features/analysis";
import { RunTelemetry } from "@/features/analysis/run-telemetry";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Select } from "@/shared/ui/Select";
import { RequirementPicker } from "./requirement-picker";

type UseRunsResult = ReturnType<typeof useRuns>;
type Environment = Awaited<ReturnType<typeof workspaceApi.projectWorkspace>>["environments"][number];

function EnvironmentPicker({ environments, environmentId, onChange }: { environments: Environment[]; environmentId: string | undefined; onChange: (id: string) => void }) {
  if (environments.length < 2) return null;
  return (
    <label className="flex items-center gap-2 text-xs text-fg-secondary">
      <Globe className="size-4 text-fg-tertiary" aria-hidden />
      Environment
      <Select value={environmentId ?? ""} onChange={(event) => onChange(event.target.value)}>
        {environments.map((env) => <option key={env.id} value={env.id}>{env.name}</option>)}
      </Select>
    </label>
  );
}

function RunsSection({ runsQuery, setup }: { runsQuery: UseRunsResult["runsQuery"]; setup: React.ReactNode }) {
  if (runsQuery.isPending) return <div className="grid items-start gap-6 xl:grid-cols-2">{setup}<p role="status" className="text-xs text-fg-tertiary">Loading runs…</p></div>;
  if (runsQuery.isError) return <div role="alert" className="space-y-2 rounded-xl border border-border bg-panel p-4 text-sm"><p>{runsQuery.error.message}</p><Button variant="outline" size="sm" onClick={() => void runsQuery.refetch()}>Retry</Button></div>;
  const runs = [...(runsQuery.data ?? [])].sort((a, b) => new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime());
  return <div className="space-y-7"><div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">{setup}<RunTelemetry runs={runs} /></div><section aria-label="Run history"><RunHistory runs={runs} /></section></div>;
}

function loadingOrErrorGuard({ identity, project, workspace }: Pick<UseRunsResult, "identity" | "project" | "workspace">): React.ReactNode | null {
  const error = identity.error || project.error || workspace.error;
  if (error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{error.message}</p></div>;
  if (identity.isPending || project.isPending || workspace.isPending) return <LoadingScreen label="Loading runs" />;
  return null;
}

function NoEnvironments({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Test Runs" description="Historical suite executions, browser evidence, and requirement validation." />
      <EmptyState icon={Globe} title="No environments yet" description="A run needs an environment to execute against." action={<Link href={`/projects/${projectId}/setup`} className="text-xs text-accent underline-offset-4 hover:underline">Go to project setup</Link>} />
    </div>
  );
}

export function RunsContent({ projectId }: { projectId: string }) {
  const [environmentId, setEnvironmentId] = useState<string>();
  const { identity, project, workspace, runsQuery, start } = useRuns(projectId, environmentId);
  const environments = workspace.data?.environments ?? [];

  useEffect(() => {
    if (environmentId || !environments[0]) return;
    const requested = new URLSearchParams(window.location.search).get("environmentId");
    setEnvironmentId(environments.find((environment) => environment.id === requested)?.id ?? environments[0].id);
  }, [environmentId, environments]);

  const guard = loadingOrErrorGuard({ identity, project, workspace });
  if (guard) return guard;
  if (!environments.length) return <NoEnvironments projectId={projectId} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Runs"
        description="Historical suite executions, browser evidence, and requirement validation."
        actions={<EnvironmentPicker environments={environments} environmentId={environmentId} onChange={setEnvironmentId} />}
      />
      <RunsSection key={environmentId} runsQuery={runsQuery} setup={<section className="min-w-0 rounded-[24px] border border-border bg-panel p-6 shadow-ambient"><h2 className="text-lg font-semibold">Start a new run</h2><div className="mt-5 space-y-5"><RequirementPicker projectId={projectId} environmentId={environmentId} onStart={start} /></div></section>} />
    </div>
  );
}
