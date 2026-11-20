"use client";

import { Users, Mail, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { workspaceApi } from "./workspace-api";

const field = "w-full rounded-full border border-border bg-raised px-3 py-2 text-sm text-fg outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50";

function memberName(member: { user_id: string; display_name: string }, identity?: { id: string; email: string | null }) {
  return member.display_name.trim() || (member.user_id === identity?.id ? identity.email : null) || "Name not provided";
}

// eslint-disable-next-line complexity -- Query, permission and mutation states are rendered together for one project scope.
export function ProjectMembers({ projectId }: { projectId: string }) {
  const cache = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [identityVersion, setIdentityVersion] = useState(0);
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: () => workspaceApi.identity(), retry: false, staleTime: 0, gcTime: 0 });
  const project = useQuery({ queryKey: ["workspace", identity.data?.id, "project", projectId], queryFn: () => workspaceApi.project(projectId), enabled: !!identity.data, retry: false });
  const canManage = project.data?.role === "owner" || project.data?.role === "admin";
  const members = useQuery({ queryKey: ["workspace", identity.data?.id, projectId, "members"], queryFn: () => workspaceApi.members(projectId), enabled: !!project.data, retry: false });
  const invitations = useQuery({ queryKey: ["workspace", identity.data?.id, projectId, "invitations"], queryFn: () => workspaceApi.invitations(projectId), enabled: !!identity.data && canManage, retry: false });
  useEffect(() => {
    const clear = () => { setIdentityVersion((version) => version + 1); void cache.cancelQueries({ queryKey: ["workspace"] }).then(() => cache.removeQueries({ queryKey: ["workspace"] })); };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
    if (channel) channel.onmessage = clear;
    window.addEventListener("blindspot:auth-changed", clear);
    return () => { window.removeEventListener("blindspot:auth-changed", clear); channel?.close(); };
  }, [cache]);

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !canManage) return;
    setBusy(true);
    setMessage("");
    try {
      await workspaceApi.invite(projectId, email.trim(), "member");
      setEmail("");
      await cache.invalidateQueries({ queryKey: ["workspace", identity.data?.id, projectId, "invitations"] });
      setMessage("Pending invitation created.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create invitation."); }
    finally { setBusy(false); }
  }

  const error = identity.error || project.error || members.error || invitations.error;
  if (error) return <div role="alert" className="space-y-3 rounded-md border border-fail-border bg-fail-tint p-3 text-sm text-fail"><p>{error.message}</p><Button variant="outline" size="sm" onClick={() => { void identity.refetch(); void project.refetch(); void members.refetch(); if (canManage) void invitations.refetch(); }}>Retry</Button></div>;
  if (identity.isPending || project.isPending || members.isPending || (canManage && invitations.isPending)) return <LoadingScreen label="Loading project access" />;
  return <div className="space-y-6">
    <PageHeader title="Team & Collaboration" description="Manage project members, role permissions, and access." />
    {message && <p role={message.endsWith("created.") ? "status" : "alert"} className="text-sm text-fg-secondary">{message}</p>}
    <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-[20px] border border-border bg-panel p-6 shadow-ambient"><h2 className="flex items-center gap-3 text-base font-semibold"><Users className="size-9 rounded-xl bg-pass-tint p-2 text-pass" />Team membership</h2><p className="mt-6 text-3xl font-semibold">{members.data?.length ?? 0}<span className="ml-2 text-sm font-normal text-fg-tertiary">Active members</span></p><div className="mt-5 flex h-1.5 overflow-hidden rounded-full bg-raised">{["owner", "admin", "member"].map((value, index) => <span key={value} className={["bg-contrast", "bg-infer", "bg-pass"][index]} style={{ width: `${(members.data?.filter((member) => member.role === value).length ?? 0) / Math.max(1, members.data?.length ?? 0) * 100}%` }} />)}</div><div className="mt-6 grid grid-cols-2 gap-3">{["owner", "member"].map((value) => <div key={value} className="rounded-xl border border-subtle bg-canvas p-3 text-center"><p className="text-xs capitalize text-fg-tertiary">{value}s</p><p className="mt-2 text-sm font-semibold">{members.data?.filter((member) => member.role === value).length ?? 0}</p></div>)}</div></section><section className="rounded-[20px] border border-border bg-panel p-6 shadow-ambient"><h2 className="flex items-center gap-3 text-base font-semibold"><Mail className="size-9 rounded-xl bg-infer-tint p-2 text-infer" />Active invitations <span className="ml-auto rounded-full bg-raised px-3 py-1 text-xs font-normal text-fg-secondary">{invitations.data?.length ?? 0} Pending</span></h2><div className="mt-6 space-y-3">{invitations.data?.length ? invitations.data.map((item) => <div key={item.id} className="rounded-xl border border-border bg-canvas p-4"><p className="text-sm font-medium">{item.email}</p><p className="mt-1 text-xs capitalize text-fg-tertiary">{item.role} · expires {new Date(item.expires_at).toLocaleDateString()}</p></div>) : <p className="py-6 text-sm text-fg-tertiary">No pending invitations.</p>}</div></section></div>
    <section className="overflow-hidden rounded-[20px] border border-border bg-panel shadow-ambient"><div className="flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="text-base font-semibold">Team Roster &amp; Access Roles</h2><p className="mt-1 text-sm text-fg-tertiary">Project membership and permissions</p></div><div className="flex flex-wrap gap-3"><label className="relative"><span className="sr-only">Search members</span><Search className="absolute left-3 top-3 size-4 text-fg-tertiary" /><input className="h-10 rounded-full bg-raised pl-10 pr-4 text-sm focus-visible:ring-3 focus-visible:ring-focus-ring/50" placeholder="Search member by name…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Filter members by role" className="rounded-full border border-border bg-raised px-4 py-2 text-sm" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">All roles</option><option value="owner">Owner</option><option value="member">Member</option></select></div></div><div className="grid grid-cols-[1fr_auto] border-y border-subtle px-6 py-4 text-[11px] uppercase tracking-wider text-fg-tertiary"><span>Name</span><span>Role</span></div>{members.data?.length ? <ul className="divide-y divide-subtle">{members.data.filter((member) => (roleFilter === "all" || member.role === roleFilter) && `${memberName(member, identity.data)}`.toLowerCase().includes(search.toLowerCase())).map((member) => <li key={member.user_id} className="flex items-center gap-4 px-6 py-5 text-sm"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-raised font-semibold">{memberName(member, identity.data).slice(0, 2).toUpperCase()}</span><span className="min-w-0 flex-1 truncate font-medium">{memberName(member, identity.data)}</span><span className={`rounded-lg px-3 py-1.5 text-xs capitalize ${member.role === "owner" ? "bg-contrast text-on-contrast" : member.role === "admin" ? "bg-infer-tint text-infer" : "bg-raised text-fg-secondary"}`}>{member.role}</span></li>)}</ul> : <p className="p-6 text-sm text-fg-tertiary">No members returned.</p>}</section>
    <section id="invite-teammate" className="space-y-4 rounded-[20px] border border-border bg-panel p-6 shadow-ambient"><h2 className="flex items-center gap-2 text-base font-semibold">Invite a teammate</h2>{canManage ? <form onSubmit={(event) => void invite(event)} className="flex flex-wrap items-end gap-3"><label className="flex min-w-52 flex-1 flex-col gap-2 text-xs text-fg-secondary">Email<input className={field} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={320} /></label><Button type="submit" disabled={busy}>{busy ? "Creating…" : "Invite"}</Button></form> : <p className="text-xs text-fg-tertiary">Invite controls are available to project owners and admins.</p>}
      <ul className="divide-y divide-subtle">{invitations.data?.map((item) => <li key={item.id} className="flex flex-wrap items-center gap-2 py-2 text-xs"><span className="min-w-0 flex-1 truncate">{item.email}</span><span className="text-fg-tertiary">{item.role} · expires {new Date(item.expires_at).toLocaleDateString()}</span></li>)}</ul>
    </section>
  </div>;
}
