"use client";
import { useState } from "react";
import { ArrowRight, Download, Plus, Search, FileText, FileCheck2, Clock, ShieldCheck, LoaderCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatTile } from "@/shared/ui/StatTile";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { categoryLabel, priorityLabel } from "@/shared/lib/labels";
import { FIELD } from "@/shared/ui/field";
import { useRequirements, RequirementsImport, RequirementDetails, RequirementEditor, ApprovalBadge, VerdictBadge, type Requirement, type RequirementEditValues } from "@/features/requirements";
import { filterRequirements } from "./requirement-filters";

const CATEGORIES = ["functional", "ux", "data", "performance", "security"] as const;
const PRIORITIES = ["critical", "high", "medium", "low"] as const;
const TABS = [{ value: "all", label: "All" }, { value: "draft", label: "Draft" }, { value: "approved", label: "Approved" }, { value: "needs_clarification", label: "Needs clarification" }];
function RequirementMetrics({ items, name }: { items: Requirement[]; name: string }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatTile label="All requirements" value={items.length} icon={FileText} detail={name} featured /><StatTile label="Draft" value={items.filter((item) => item.approvalStatus === "draft").length} icon={Clock} detail="Awaiting your review" /><StatTile label="Approved" value={items.filter((item) => item.approvalStatus === "approved").length} icon={FileCheck2} detail="Ready for validation" /><StatTile label="Requirements tested" value={items.filter((item) => item.latestVerdict).length} icon={ShieldCheck} detail="Browser checks executed" /></div>;
}
function RequirementTable({ items, onView }: { items: Requirement[]; onView: (id: string) => void }) {
  return <div className="relative overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><caption className="sr-only">Requirements, review status and latest browser test outcome</caption><thead><tr className="border-b border-border text-[11px] font-medium uppercase tracking-wider text-fg-tertiary">{["Requirement & ID", "Category", "Priority", "Approval", "Latest result", "Actions"].map((label) => <th key={label} scope="col" className={`px-5 py-5 font-medium first:pl-6 last:pr-6 ${label === "Actions" ? "text-right" : ""}`}>{label === "Actions" ? <span className="sr-only">Actions</span> : label}</th>)}</tr></thead><tbody className="divide-y divide-subtle">{items.map((item) => <tr key={item.id} className="transition-colors hover:bg-canvas/80"><td className="w-[38%] min-w-64 py-5 pl-6 pr-5"><button className="text-left font-medium leading-relaxed underline decoration-border-strong/40 underline-offset-4 hover:decoration-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50" onClick={() => onView(item.id)}>{item.title}</button><p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-fg-quaternary">{item.id.slice(0, 8)}</p>{item.source.kind === "imported" && <p className="mt-1 flex items-center gap-1 text-[11px] text-fg-tertiary"><FileText className="size-3 shrink-0" /><span className="max-w-64 truncate">{item.source.documentName || "Imported documentation"}</span></p>}</td><td className="px-5 py-5"><span className="whitespace-nowrap rounded-full bg-raised px-3 py-1.5 text-xs text-fg-secondary">{categoryLabel(item.category)}</span></td><td className="px-5 py-5"><span className="text-xs text-fg-secondary">{priorityLabel(item.priority)}</span></td><td className="px-5 py-5"><ApprovalBadge status={item.approvalStatus} /></td><td className="px-5 py-5"><VerdictBadge verdict={item.latestVerdict} /></td><td className="py-5 pl-5 pr-6"><button aria-label={`View ${item.title}`} onClick={() => onView(item.id)} className="ml-auto flex items-center gap-2 whitespace-nowrap rounded text-xs font-medium text-fg-secondary hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50">View <ArrowRight className="size-3.5" /></button></td></tr>)}</tbody></table></div>;
}
function LibraryEmpty({ filtered, canManage, onImport }: { filtered: boolean; canManage: boolean; onImport: () => void }) {
  return <div className="flex flex-col items-center px-6 py-14 text-center"><span className="mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-canvas"><FileCheck2 className="size-6 text-fg-tertiary" /></span><h3 className="text-lg font-semibold tracking-tight">{filtered ? "No matching requirements" : "Your product expectations belong here"}</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-tertiary">{filtered ? "Try changing your search or filters." : "Import documentation to extract draft requirements, or add a clear expectation manually."}</p>{!filtered && canManage && <Button className="mt-5" onClick={onImport}><Download className="size-4" />Import requirements</Button>}</div>;
}

// eslint-disable-next-line complexity -- Keep project permissions, query states, and modal selection in one scoped page.
export function RequirementsContent({ projectId }: { projectId: string }) {
  const { identity, project, data, canManage, create, update, approve } = useRequirements(projectId);
  const [filters, setFilters] = useState({ search: "", category: "all", priority: "all", tab: "all" });
  const [page, setPage] = useState(0);
  const [importing, setImporting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Requirement | "new" | null>(null);
  function filter(key: keyof typeof filters, value: string) { setFilters((current) => ({ ...current, [key]: value })); setPage(0); }
  async function save(values: RequirementEditValues) {
    if (editing && editing !== "new") await update(editing.id, values);
    else await create({ ...values, acceptanceCriteria: values.acceptanceCriteria.map((criterion) => criterion.text) });
  }
  const identityError = identity.error || project.error;
  if (identityError) return <div role="alert" className="rounded-xl border border-fail-border bg-fail-tint p-5 text-sm text-fail">{identityError.message}</div>;
  if (identity.isPending || project.isPending) return <LoadingScreen label="Loading requirements" />;
  const items = data.data ?? [];
  const visible = filterRequirements(items, filters);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(visible.length / 5) - 1));
  const selected = items.find((item) => item.id === selectedId);
  return <div className="space-y-6">
    <PageHeader title="Requirements" description="Define what your product should do." actions={canManage && <><Button onClick={() => setImporting(true)}><Download className="size-4" />Import requirements</Button><Button variant="outline" onClick={() => setEditing("new")}><Plus className="size-4" />Add requirement</Button></>} />
    {data.isSuccess && <RequirementMetrics items={items} name={project.data?.name ?? "Project"} />}
    <section aria-label="Requirements library" className="overflow-hidden rounded-[20px] border border-border bg-panel shadow-ambient"><div className="px-6 pt-6"><div className="flex flex-wrap items-end gap-4"><label className="relative min-w-44 flex-1"><span className="sr-only">Search requirements</span><Search className="absolute left-4 top-3 size-4 text-fg-tertiary" /><input type="search" className="h-10 w-full rounded-full bg-raised pl-11 pr-4 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50" placeholder="Search requirements or IDs…" value={filters.search} onChange={(event) => filter("search", event.target.value)} /></label><label className="space-y-1.5 text-xs text-fg-tertiary">Category<select className={`${FIELD} block min-w-36 bg-panel text-xs`} value={filters.category} onChange={(event) => filter("category", event.target.value)}><option value="all">All categories</option>{CATEGORIES.map((value) => <option key={value} value={value}>{categoryLabel(value)}</option>)}</select></label><label className="space-y-1.5 text-xs text-fg-tertiary">Priority<select className={`${FIELD} block min-w-32 bg-panel text-xs`} value={filters.priority} onChange={(event) => filter("priority", event.target.value)}><option value="all">All priorities</option>{PRIORITIES.map((value) => <option key={value} value={value}>{priorityLabel(value)}</option>)}</select></label></div><div className="mt-4 flex gap-6 overflow-x-auto border-b border-border" role="group" aria-label="Filter review status">{TABS.map(({ value, label }) => <button key={value} aria-pressed={filters.tab === value} onClick={() => filter("tab", value)} className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 ${filters.tab === value ? "border-fg font-semibold text-fg" : "border-transparent text-fg-tertiary"}`}>{label}<span className="rounded bg-raised px-1.5 py-0.5 text-[11px] font-normal">{data.isSuccess ? value === "all" ? items.length : items.filter((item) => item.approvalStatus === value).length : "—"}</span></button>)}</div></div>
      {data.isPending ? <p role="status" className="flex items-center justify-center gap-2 p-12 text-sm text-fg-tertiary"><LoaderCircle className="size-4 animate-spin" />Loading requirements…</p> : data.isError ? <div role="alert" className="space-y-4 p-10 text-center"><p className="text-sm text-fail">{data.error.message}</p><Button variant="outline" onClick={() => void data.refetch()}><RotateCw className="size-4" />Try again</Button></div> : visible.length ? <RequirementTable items={visible.slice(currentPage * 5, currentPage * 5 + 5)} onView={setSelectedId} /> : <LibraryEmpty filtered={!!items.length} canManage={!!canManage} onImport={() => setImporting(true)} />}
      {data.isSuccess && !!visible.length && <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-5 text-xs text-fg-tertiary"><span>Showing {currentPage * 5 + 1}–{Math.min((currentPage + 1) * 5, visible.length)} of {visible.length} requirements</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={(currentPage + 1) * 5 >= visible.length} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div>}
    </section>
    {importing && canManage && <RequirementsImport projectId={projectId} projectName={project.data?.name ?? "this project"} userId={identity.data!.id} onClose={() => setImporting(false)} />}
    {selected && <RequirementDetails requirement={selected} canManage={!!canManage} onClose={() => setSelectedId(null)} onEdit={() => { setSelectedId(null); setEditing(selected); }} onApprove={approve} />}
    {editing && canManage && <RequirementEditor key={editing === "new" ? "new" : editing.id} {...(editing !== "new" ? { requirement: editing } : {})} onSave={save} onClose={() => setEditing(null)} />}
  </div>;
}
