"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Globe } from "lucide-react";
import { useRuns, type Run } from "@/features/analysis";
import { workspaceApi } from "@/features/workspace";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { Button } from "@/components/ui/button";
import { FIELD_DENSE } from "@/shared/ui/field";
import { RequirementPicker } from "./requirement-picker";

type UseRunsResult = ReturnType<typeof useRuns>;
type Environment = Awaited<ReturnType<typeof workspaceApi.projectWorkspace>>["environments"][number];

function RunRow({ run, projectId }: { run: Run; projectId: string }) {
  const requirementCount = run.requirementSnapshots.length;
  return (
    <tr className="hover:bg-hover">
      <td className="p-3 font-mono font-medium text-fg">#{run.runNumber}</td>
      <td className="p-3"><StatusBadge status={run.status} /></td>
      <td className="p-3 text-fg-secondary">{requirementCount} requirement{requirementCount === 1 ? "" : "s"}</td>
      <td className="p-3 font-mono text-fg-tertiary">{new Date(run.queuedAt).toLocaleString()}</td>
      <td className="p-3">
        <Link href={`/projects/${projectId}/runs/${run.id}?environmentId=${run.environmentId}`} className="text-accent font-medium hover:underline">
          View run →
        </Link>
      </td>
    </tr>
  );
}

function EnvironmentPicker({ environments, environmentId, onChange }: { environments: Environment[]; environmentId: string | undefined; onChange: (id: string) => void }) {
  if (environments.length < 2) return null;
  return (
    <label className="flex items-center gap-2 text-xs text-fg-secondary">
      <Globe className="size-4 text-fg-tertiary" aria-hidden />
      Environment
      <select className={`${FIELD_DENSE} w-auto`} value={environmentId ?? ""} onChange={(event) => onChange(event.target.value)}>
        {environments.map((env) => <option key={env.id} value={env.id}>{env.name}</option>)}
      </select>
    </label>
  );
}

function RunsTable({ runs, projectId }: { runs: Run[]; projectId: string }) {
  if (!runs.length) return <EmptyState icon={Clock} title="No runs yet" description="Select approved requirements above and start the first run." />;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-raised text-xs shadow-ambient">
      <table className="w-full text-left">
        <thead className="border-b border-border bg-panel text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">
          <tr>
            <th className="p-3">Run</th>
            <th className="p-3">Status</th>
            <th className="p-3">Requirements</th>
            <th className="p-3">Queued</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {runs.map((run) => <RunRow key={run.id} run={run} projectId={projectId} />)}
        </tbody>
      </table>
    </div>
  );
}

function RunsSection({ runsQuery, projectId }: { runsQuery: UseRunsResult["runsQuery"]; projectId: string }) {
  if (runsQuery.isPending) return <p role="status" className="text-xs text-fg-tertiary">Loading runs…</p>;
  if (runsQuery.isError) return <div role="alert" className="space-y-2 rounded-xl border border-border bg-panel p-4 text-sm"><p>{runsQuery.error.message}</p><Button variant="outline" size="sm" onClick={() => void runsQuery.refetch()}>Retry</Button></div>;
  return <RunsTable runs={runsQuery.data ?? []} projectId={projectId} />;
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
      <PageHeader title="Runs" description="Every analysis run the agent has made, with its evidence per requirement." />
      <EmptyState icon={Globe} title="No environments yet" description="A run needs an environment to execute against." action={<Link href={`/projects/${projectId}/setup`} className="text-xs text-accent underline-offset-4 hover:underline">Go to project setup</Link>} />
    </div>
  );
}

export function RunsContent({ projectId }: { projectId: string }) {
  const [environmentId, setEnvironmentId] = useState<string>();
  const { identity, project, workspace, runsQuery, start } = useRuns(projectId, environmentId);
  const environments = workspace.data?.environments ?? [];

  useEffect(() => {
    if (!environmentId && environments[0]) setEnvironmentId(environments[0].id);
  }, [environmentId, environments]);

  const guard = loadingOrErrorGuard({ identity, project, workspace });
  if (guard) return guard;
  if (!environments.length) return <NoEnvironments projectId={projectId} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Runs"
        description="Every analysis run the agent has made, with its evidence per requirement."
        actions={<EnvironmentPicker environments={environments} environmentId={environmentId} onChange={setEnvironmentId} />}
      />
      <section className="space-y-3 rounded-2xl border border-border bg-panel p-4">
        <h2 className="text-sm font-semibold">Start a run</h2>
        <RequirementPicker projectId={projectId} environmentId={environmentId} onStart={start} />
      </section>
      <RunsSection runsQuery={runsQuery} projectId={projectId} />
    </div>
  );
}
