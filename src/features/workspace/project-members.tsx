"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { workspaceApi } from "./workspace-api";

const field = "w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-fg outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50";

// eslint-disable-next-line complexity -- Query, permission and mutation states are rendered together for one project scope.
export function ProjectMembers({ projectId }: { projectId: string }) {
  const cache = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
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
      await workspaceApi.invite(projectId, email.trim(), role);
      setEmail("");
      await cache.invalidateQueries({ queryKey: ["workspace", identity.data?.id, projectId, "invitations"] });
      setMessage("Pending invitation created.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create invitation."); }
    finally { setBusy(false); }
  }

  const error = identity.error || project.error || members.error || invitations.error;
  if (error) return <div role="alert" className="space-y-3 rounded-md border border-fail-border bg-fail-tint p-3 text-sm text-fail"><p>{error.message}</p><Button variant="outline" size="sm" onClick={() => { void identity.refetch(); void project.refetch(); void members.refetch(); if (canManage) void invitations.refetch(); }}>Retry</Button></div>;
  if (identity.isPending || project.isPending || members.isPending || (canManage && invitations.isPending)) return <p role="status" className="text-xs text-fg-tertiary">Loading project access…</p>;
  return <div className="space-y-6">
    <PageHeader title="Members" description="Project membership and invitations. Only project owners and admins can invite teammates." />
    {message && <p role={message.endsWith("created.") ? "status" : "alert"} className="text-sm text-fg-secondary">{message}</p>}
    <section className="space-y-2"><h2 className="text-sm font-semibold">Current members</h2>{members.data?.length ? <ul className="divide-y divide-subtle rounded-lg border border-border bg-panel">{members.data.map((member) => <li key={member.user_id} className="flex items-center gap-3 p-3 text-sm"><span className="min-w-0 flex-1 truncate">{member.display_name || member.user_id}</span><span className="text-xs text-fg-tertiary">{member.role}</span></li>)}</ul> : <p className="text-xs text-fg-tertiary">No members returned.</p>}</section>
    <section className="max-w-2xl space-y-3 rounded-lg border border-border bg-panel p-4"><h2 className="text-sm font-semibold">Invite a teammate</h2>{canManage ? <form onSubmit={(event) => void invite(event)} className="flex flex-wrap items-end gap-3"><label className="min-w-52 flex-1 space-y-1.5 text-xs text-fg-secondary">Verified email<input className={field} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={320} /></label><label className="space-y-1.5 text-xs text-fg-secondary">Role<select className={field} value={role} onChange={(event) => setRole(event.target.value as "member" | "admin")}><option value="member">Member</option><option value="admin">Admin</option></select></label><Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create pending invitation"}</Button></form> : <p className="text-xs text-fg-tertiary">Invite controls are available to project owners and admins.</p>}
      <p className="text-xs text-fg-tertiary">The invitation is pending in BlindSpot; email delivery is not provided.</p><ul className="divide-y divide-subtle">{invitations.data?.map((item) => <li key={item.id} className="flex flex-wrap items-center gap-2 py-2 text-xs"><span className="min-w-0 flex-1 truncate">{item.email}</span><span className="text-fg-tertiary">{item.role} · expires {new Date(item.expires_at).toLocaleDateString()}</span></li>)}</ul>
    </section>
  </div>;
}
