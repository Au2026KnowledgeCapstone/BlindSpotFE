"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useWorkspace } from "./use-workspace";

const input = "rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm w-full";
const button = "rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40";
const panel = "rounded-2xl border border-white/15 bg-white/5 p-5";

export function Workspace() {
  const [projectId, setProjectId] = useState("");
  const work = useWorkspace(projectId);
  const { identity, projects, details, inbox, active, mutation } = work;
  const [notice, setNotice] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>, action: (form: FormData) => PromiseLike<{ error: { code?: string } | null }>) {
    event.preventDefault();
    const form = event.currentTarget;
    setNotice("");
    try {
      await mutation.mutateAsync(() => action(new FormData(form)));
      form.reset();
      setNotice("Saved.");
    } catch { /* Mutation error is displayed below. */ }
  }

  if (identity.isPending) return <p role="status" className="p-8">Opening your workspace…</p>;
  if (identity.error) return <main className="mx-auto max-w-xl p-10"><h1 className="text-2xl font-semibold">Your BlindSpot workspace</h1><p className="my-4">{identity.error.message}</p><Link href="/login" className={button}>Sign in</Link></main>;

  const error = mutation.error || projects.error || details.error || inbox.error;
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm text-emerald-300">BlindSpot / Workspace</p><h1 className="mt-2 text-3xl font-semibold">Build your testing workspace</h1><p className="mt-2 text-sm opacity-70">{identity.data?.email}</p></div>
        <Link href="/projects" className="text-sm underline">Team presentation pages</Link>
      </header>
      {error && <div role="alert" className="rounded-lg border border-red-400/50 p-4"><p>{error.message}</p><button className="mt-2 underline" onClick={() => { mutation.reset(); void projects.refetch(); if (active) void details.refetch(); void inbox.refetch(); }}>Retry</button></div>}
      {notice && <p role="status" className="text-emerald-300">{notice}</p>}
      <ProjectsPanel work={work} submit={submit} setProjectId={setProjectId} setNotice={setNotice} />
      <InvitationsPanel work={work} setNotice={setNotice} />
      {active && <div className="grid gap-6 md:grid-cols-2">
        <ApplicationsPanel work={work} submit={submit} />
        <EnvironmentsPanel work={work} submit={submit} />
        <InvitePanel work={work} submit={submit} />
        <ScansPanel work={work} submit={submit} />
      </div>}
      <NotificationsPanel work={work} />
    </main>
  );
}
type Work = ReturnType<typeof useWorkspace>;
type Submit = (event: FormEvent<HTMLFormElement>, action: (form: FormData) => PromiseLike<{ error: { code?: string } | null }>) => Promise<void>;
type PanelProps = { work: Work; submit: Submit };

function ProjectsPanel({ work, submit, setProjectId, setNotice }: PanelProps & { setProjectId: (id: string) => void; setNotice: (text: string) => void }) {
 const { client,projects,active,mutation }=work; const busy=mutation.isPending;
 return (<section className={panel}>
        <h2 className="text-lg font-semibold">Projects</h2>
        {projects.isPending ? <p role="status">Loading projects…</p> : !projects.data?.length ? <p className="my-3 text-sm opacity-70">No projects yet. Create one or accept an invitation below.</p> : <label className="my-4 block max-w-md text-sm">Current project<select aria-label="Current project" className={input} value={active} onChange={(e) => { setProjectId(e.target.value); setNotice(""); mutation.reset(); }}>{projects.data.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
        <form className="mt-4 flex flex-wrap gap-3" onSubmit={(e) => void submit(e, (f) => client.rpc("create_project", { p_name: String(f.get("name")) }))}>
          <label className="min-w-52 grow text-sm">New project name<input className={input} name="name" required maxLength={120} placeholder="My BlindSpot project" /></label>
          <button className={button} disabled={busy}>Create project</button>
        </form>
      </section>);
}

function InvitationsPanel({work,setNotice}: {work:Work;setNotice:(text:string)=>void}) {
 const {client,identity,inbox,mutation}=work; const busy=mutation.isPending;
 const ownInvitations=inbox.data?.invitations.filter((i)=>i.email===identity.data?.email?.toLowerCase()) ?? [];
 return <>{!!ownInvitations.length && <section className={panel}><h2 className="text-lg font-semibold">Your invitations</h2>{ownInvitations.map((i) => <div key={i.id} className="mt-3 flex items-center justify-between gap-4"><span>Join as {i.role}</span><button disabled={busy} className={button} onClick={() => { setNotice(""); void mutation.mutateAsync(() => client.rpc("accept_invitation", { p_invitation_id: i.id })).then(() => setNotice("Invitation accepted.")).catch(() => {}); }}>Accept invitation</button></div>)}</section>}</>;
}

function ApplicationsPanel({work,submit}:PanelProps) {
 const {client,details,active,mutation}=work; const busy=mutation.isPending;
 return (<section className={panel}><h2 className="text-lg font-semibold">Applications</h2>
          {details.isFetching && <p role="status">Refreshing workspace…</p>}
          <ul className="my-4 space-y-2">{details.data?.applications.map((a) => <li key={a.id}>{a.name}</li>)}</ul>
          {!details.data?.applications.length && <p className="my-3 text-sm opacity-70">Add the application you want to test.</p>}
          <form className="space-y-3" onSubmit={(e) => void submit(e, (f) => client.from("applications").insert({ project_id: active, name: String(f.get("name")) }))}>
            <label className="block text-sm">Application name<input className={input} name="name" required maxLength={120} /></label><button className={button} disabled={busy}>Add application</button>
          </form>
        </section>);
}

function EnvironmentsPanel({work,submit}:PanelProps) {
 const {client,details,active,mutation}=work; const busy=mutation.isPending;
 return (<section className={panel}><h2 className="text-lg font-semibold">Environments</h2>
          <ul className="my-4 space-y-2">{details.data?.environments.map((e) => <li key={e.id}><strong>{e.name}</strong><span className="ml-2 text-xs opacity-60">{e.kind}</span><p className="break-all text-sm opacity-70">{e.base_url}</p></li>)}</ul>
          <form className="space-y-3" onSubmit={(e) => void submit(e, (f) => client.from("environments").insert({ project_id: active, application_id: String(f.get("application")), name: String(f.get("name")), kind: String(f.get("kind")), base_url: String(f.get("url")) }))}>
            <label className="block text-sm">Application<select aria-label="Application" className={input} name="application" required defaultValue=""><option value="" disabled>Choose application</option>{details.data?.applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            <label className="block text-sm">Environment name<input className={input} name="name" required maxLength={120} /></label>
            <label className="block text-sm">Kind<select aria-label="Kind" className={input} name="kind"><option value="development">Development</option><option value="staging">Staging</option><option value="production">Production</option></select></label>
            <label className="block text-sm">Application URL<input className={input} name="url" type="url" required pattern="https?://.+" maxLength={2048} placeholder="https://app.example.com" /></label>
            <button className={button} disabled={busy || !details.data?.applications.length}>Add environment</button>
          </form>
        </section>);
}

function InvitePanel({work,submit}:PanelProps) {
 const {client,identity,inbox,active,mutation}=work; const busy=mutation.isPending;
 return (<section className={panel}><h2 className="text-lg font-semibold">Invite a teammate</h2><p className="my-3 text-sm opacity-70">Owners and admins can invite members. Ask your teammate to sign in with this verified email and open Workspace to accept.</p>
          <form className="space-y-3" onSubmit={(e) => void submit(e, (f) => client.rpc("invite_member", { p_project_id: active, p_email: String(f.get("email")), p_role: String(f.get("role")) }))}>
            <label className="block text-sm">Email<input className={input} name="email" type="email" required maxLength={254} /></label>
            <label className="block text-sm">Role<select aria-label="Role" className={input} name="role"><option value="member">Member</option><option value="admin">Admin</option></select></label><button className={button} disabled={busy}>Create invitation</button>
          </form>
          <ul className="mt-4 text-sm">{inbox.data?.invitations.filter((i) => i.project_id === active && i.email !== identity.data?.email?.toLowerCase()).map((i) => <li key={i.id} className="py-1">{i.email} · {i.role} · pending</li>)}</ul>
        </section>);
}

function ScansPanel({work,submit}:PanelProps) {
 const {client,details,active,mutation}=work; const busy=mutation.isPending;
 return (<section className={panel}><h2 className="text-lg font-semibold">Scans and results</h2>
          <p className="my-3 text-sm opacity-70">Scan requests are saved here. Execution and classification are handled by the team’s scan service; a queued request does not mean a test has run.</p>
          <form className="space-y-3" onSubmit={(e) => void submit(e, (f) => client.from("scans").insert({ project_id: active, environment_id: String(f.get("environment")) }))}>
            <label className="block text-sm">Environment<select aria-label="Environment" className={input} name="environment" required defaultValue=""><option value="" disabled>Choose environment</option>{details.data?.environments.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
            <button className={button} disabled={busy || !details.data?.environments.length}>Save scan request</button>
          </form>
          <ul className="mt-4 space-y-2 text-sm">{details.data?.scans.map((s) => <li key={s.id}>{s.status} · {new Date(s.created_at).toLocaleString()}</li>)}</ul>
          <h3 className="mt-4 font-medium">Latest saved results</h3><ul className="text-sm">{details.data?.results.map((r) => <li key={r.id} className="mt-2"><strong>{r.name} · {r.status}</strong><p className="opacity-70">{r.summary}</p></li>)}</ul>
          {!details.data?.results.length && <p className="mt-2 text-sm opacity-70">No results have been recorded.</p>}
        </section>);
}

function NotificationsPanel({work}:{work:Work}) {
 const {client,inbox,mutation}=work; const busy=mutation.isPending;
 return (<section className={panel}><h2 className="text-lg font-semibold">Notifications</h2>
        {!inbox.data?.notices.length && <p className="mt-3 text-sm opacity-70">You’re all caught up.</p>}
        <ul>{inbox.data?.notices.map((n) => <li key={n.id} className="mt-3 flex justify-between gap-4"><span>{n.message}</span>{!n.read_at && <button disabled={busy} className="text-sm underline" onClick={() => { void mutation.mutateAsync(() => client.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id)).catch(() => {}); }}>Mark read</button>}</li>)}</ul>
      </section>);
}
