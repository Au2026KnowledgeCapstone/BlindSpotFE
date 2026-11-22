"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Check, CircleHelp, Clock, FileText, ShieldCheck, X } from "lucide-react";
import { workspaceApi } from "./workspace-api";
import { StatTile } from "@/shared/ui/StatTile";

const card = "rounded-[20px] border border-border bg-panel p-6 shadow-ambient";
const action = "inline-flex items-center justify-center gap-2 rounded-full bg-contrast px-5 py-3 text-sm font-medium text-on-contrast hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50";
export function ProjectOverviewGrid({ projectId, userId, name, description }: { projectId: string; userId: string; name: string; description: string }) {
  const requirements = useQuery({ queryKey: ["workspace", userId, projectId, "overview-requirements"], queryFn: () => workspaceApi.requirements(projectId), retry: false });
  const workspace = useQuery({ queryKey: ["workspace", userId, projectId, "overview-workspace"], queryFn: () => workspaceApi.projectWorkspace(projectId), retry: false });
  const items = requirements.data ?? [];
  const approved = items.filter((r) => r.approval_status === "approved").length;
  const tested = items.filter((r) => r.latest_result).length;
  const groups = [
    { label: "Passed", count: items.filter((r) => r.latest_result?.verdict === "pass").length, icon: Check, tone: "text-pass border-pass-border bg-pass-tint", bar: "bg-pass" },
    { label: "Failed", count: items.filter((r) => r.latest_result?.verdict === "fail").length, icon: X, tone: "text-fail border-fail-border bg-fail-tint", bar: "bg-fail" },
    { label: "Inconclusive", count: items.filter((r) => r.latest_result?.verdict === "inconclusive").length, icon: CircleHelp, tone: "text-warn border-warn-border bg-warn-tint", bar: "bg-warn" },
    { label: "Not tested", count: items.length - tested, icon: Clock, tone: "text-fg-secondary border-border bg-raised", bar: "bg-border-strong" },
  ];
  const ready = !!requirements.data;
  const number = (value: number) => ready ? value : "—";
  return <div className="space-y-7">
    {requirements.isError && <p role="status" className="text-sm text-fg-tertiary">Requirement totals are unavailable. <button className="underline" onClick={() => void requirements.refetch()}>Retry totals</button></p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Approved requirements" value={number(approved)} icon={ArrowUpRight} detail={ready ? "Ready for validation" : "Loading requirements…"} featured />
      <StatTile label="Documented requirements" value={number(items.length)} icon={FileText} detail="Your product expectations" />
      <StatTile label="Requirements tested" value={number(tested)} icon={ShieldCheck}><div className="mt-auto flex flex-wrap gap-1.5">{groups.slice(0, 3).map((g) => <span key={g.label} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${g.tone}`}><g.icon className="size-3" />{g.count} {g.label.toLowerCase()}</span>)}</div></StatTile>
      <StatTile label="Awaiting review" value={number(items.filter((r) => r.approval_status !== "approved").length)} icon={Clock} detail="Requirements awaiting your review" />
    </div>
    <div className="grid gap-5 lg:grid-cols-12">
      <section className={`${card} space-y-5 lg:col-span-4`}><div className="flex justify-between"><h2 className="text-base font-semibold">Validation status</h2><ShieldCheck className="size-4 text-fg-tertiary" /></div><div><p className="text-3xl font-semibold">{tested} <span className="text-xl font-normal text-fg-quaternary">/ {items.length}</span></p><p className="mt-1 text-sm text-fg-tertiary">requirements tested</p></div><div aria-hidden className="flex h-2 overflow-hidden rounded-full bg-raised">{groups.map((g) => <span key={g.label} className={g.bar} style={{ width: `${items.length ? g.count / items.length * 100 : 0}%` }} />)}</div><ul className="space-y-3">{groups.map((g) => <li key={g.label} className="flex items-center justify-between text-sm"><span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${g.tone}`}><g.icon className="size-3.5" />{g.label}</span><strong className="font-medium tabular-nums">{g.count}</strong></li>)}</ul></section>
      <section className={`${card} flex flex-col lg:col-span-5`}><p className="mb-4 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">Your next step</p><h2 className="text-xl font-semibold tracking-tight">Review your requirements</h2><p className="mt-3 text-sm leading-relaxed text-fg-tertiary">Review and approve documented requirements before starting browser checks.</p><div className="mt-auto space-y-3 pt-8"><div className="flex items-center justify-between rounded-xl border border-border bg-raised/30 p-3 text-sm"><span className="flex items-center gap-2 text-fg-secondary"><CircleHelp className="size-4" />Approved requirements</span><strong>{approved}</strong></div><Link href={`/projects/${projectId}/requirements`} className={`${action} w-full`}>Review requirements <ArrowUpRight className="size-4" /></Link></div></section>
      <section className={`${card} flex flex-col lg:col-span-3`}><h2 className="text-base font-semibold">Project</h2><span className="mb-4 mt-5 flex size-11 items-center justify-center rounded-full border border-border bg-raised text-sm font-semibold">{name.slice(0, 2).toUpperCase()}</span><p className="text-base font-semibold">{name}</p><p className="mt-1 text-sm leading-relaxed text-fg-tertiary">{description || "Your product validation workspace."}</p>{workspace.data?.environments[0] && <a href={workspace.data.environments[0].base_url} target="_blank" rel="noreferrer" className="mt-3 break-all text-sm text-fg-secondary hover:underline">{workspace.data.environments[0].base_url} ↗</a>}<Link href={`/projects/${projectId}/setup`} className="mt-auto rounded-full border border-strong px-4 py-3 text-center text-sm font-medium">Project settings →</Link></section>
    </div>
  </div>;
}
