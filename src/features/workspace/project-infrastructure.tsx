"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { workspaceApi } from "./workspace-api";

const field = "w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-fg outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50";
const key = (userId: string | undefined, projectId: string) => ["workspace", userId, projectId, "infrastructure"] as const;

function EnvironmentLoginControls({ projectId, environmentId, hasCredentials, onChanged }: { projectId: string; environmentId: string; hasCredentials: boolean; onChanged: () => Promise<void> }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successSelector, setSuccessSelector] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      await workspaceApi.updateEnvironmentCredentials(projectId, environmentId, { username, password, success_selector: successSelector });
      setUsername(""); setPassword(""); setSuccessSelector("");
      setMessage("Login saved."); await onChanged();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not save login."); }
    finally { setBusy(false); }
  }
  async function verify() {
    setBusy(true); setMessage("");
    try {
      const result = await workspaceApi.verifyEnvironment(projectId, environmentId);
      setMessage(result.status === "verified" ? "Login verified." : "Verification: " + result.status);
      await onChanged();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not verify login."); }
    finally { setBusy(false); }
  }
  return <div className="mt-2 space-y-2">
    <form className="grid gap-2 sm:grid-cols-3" onSubmit={(event) => void save(event)}>
      <label className="text-xs text-fg-secondary">Login email or username<input className={field} autoComplete="off" required value={username} onChange={(event) => setUsername(event.target.value)} /></label>
      <label className="text-xs text-fg-secondary">Password<input className={field} type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <label className="text-xs text-fg-secondary">Success selector<input className={field} required value={successSelector} onChange={(event) => setSuccessSelector(event.target.value)} placeholder="#signed-in" /></label>
      <Button type="submit" size="sm" disabled={busy}>Save login</Button>
    </form>
    {hasCredentials && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void verify()}>Verify saved login</Button>}
    {message && <p role="status" className="text-xs text-fg-secondary">{message}</p>}
  </div>;
}

// eslint-disable-next-line complexity -- Keep the small project setup forms in the existing shell and scope.
export function ProjectInfrastructure({ projectId }: { projectId: string }) {
  const cache = useQueryClient();
  const [identityVersion, setIdentityVersion] = useState(0);
  const [name, setName] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [environmentName, setEnvironmentName] = useState("");
  const [kind, setKind] = useState("staging");
  const [baseUrl, setBaseUrl] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [successSelector, setSuccessSelector] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: () => workspaceApi.identity(), retry: false, staleTime: 0, gcTime: 0 });
  const project = useQuery({ queryKey: ["workspace", identity.data?.id, "project", projectId], queryFn: () => workspaceApi.project(projectId), enabled: !!identity.data, retry: false });
  const canManage = project.data?.role === "owner" || project.data?.role === "admin";
  const data = useQuery({ queryKey: key(identity.data?.id, projectId), queryFn: ({ signal }) => workspaceApi.projectWorkspace(projectId, signal), enabled: !!project.data, retry: false });

  useEffect(() => {
    const clear = () => { setIdentityVersion((version) => version + 1); void cache.cancelQueries({ queryKey: ["workspace"] }).then(() => cache.removeQueries({ queryKey: ["workspace"] })); };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
    if (channel) channel.onmessage = clear;
    window.addEventListener("blindspot:auth-changed", clear);
    return () => { window.removeEventListener("blindspot:auth-changed", clear); channel?.close(); };
  }, [cache]);

  async function mutate(action: () => Promise<unknown>, reset: () => void) {
    if (busy) return;
    setBusy(true); setMessage("");
    try { await action(); reset(); setMessage("Saved."); await cache.invalidateQueries({ queryKey: key(identity.data?.id, projectId) }); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save. Retry."); }
    finally { setBusy(false); }
  }

  const error = identity.error || project.error || data.error;
  if (error) return <div role="alert" className="space-y-3"><p className="text-sm text-fail">{error.message}</p><Button variant="outline" size="sm" onClick={() => { void identity.refetch(); void project.refetch(); void data.refetch(); }}>Retry</Button></div>;
  if (identity.isPending || project.isPending || data.isPending) return <LoadingScreen label="Loading project setup" />;
  const workspace = data.data!;
  return <div className="space-y-6">
    <PageHeader title="Project setup" description="Applications and environments for this project. Lists show up to 20 pages of records. Start runs from the Runs tab once an environment is verified." />
    {message && <p role={message === "Saved." ? "status" : "alert"} className="text-sm text-fg-secondary">{message}</p>}
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-lg border border-border bg-panel p-4">
        <h2 className="text-sm font-semibold">Applications</h2>
        {workspace.applications.length ? <ul className="space-y-2 text-sm">{workspace.applications.map((app) => <li key={app.id}>{app.name}</li>)}</ul> : <p className="text-xs text-fg-tertiary">No applications yet.</p>}
        {canManage ? <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void mutate(() => workspaceApi.createApplication(projectId, name), () => setName("")); }}>
          <label className="sr-only" htmlFor="application-name">Application name</label><input id="application-name" className={field} required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Application name" /><Button type="submit" disabled={busy || !name.trim()}>Add</Button>
        </form> : <p className="text-xs text-fg-tertiary">Only project owners and admins can add applications.</p>}
      </div>
      <div className="space-y-3 rounded-lg border border-border bg-panel p-4">
        <h2 className="text-sm font-semibold">Environments</h2>
        {workspace.environments.length ? <ul className="space-y-2 text-sm">{workspace.environments.map((env) => <li key={env.id}><strong>{env.name}</strong> · {env.kind}<p className="break-all text-xs text-fg-tertiary">{env.base_url} · {env.has_credentials ? "Credentials configured" : "No credentials"} · {env.verified_at ? "Verified" : "Not verified"}</p>{canManage && <EnvironmentLoginControls projectId={projectId} environmentId={env.id} hasCredentials={env.has_credentials} onChanged={() => cache.invalidateQueries({ queryKey: key(identity.data?.id, projectId) }).then(() => undefined)} />}</li>)}</ul> : <p className="text-xs text-fg-tertiary">No environments yet.</p>}
        {canManage ? <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); void mutate(() => workspaceApi.createEnvironment(projectId, { application_id: applicationId, name: environmentName, kind, base_url: baseUrl, ...(loginUsername && loginPassword && successSelector ? { credentials: { username: loginUsername, password: loginPassword, success_selector: successSelector } } : {}) }), () => { setEnvironmentName(""); setBaseUrl(""); setLoginUsername(""); setLoginPassword(""); setSuccessSelector(""); }); }}>
          <label className="block space-y-1 text-xs text-fg-secondary">Application<select className={field} required value={applicationId} onChange={(event) => setApplicationId(event.target.value)}><option value="">Choose application</option>{workspace.applications.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}</select></label>
          <label className="block space-y-1 text-xs text-fg-secondary">Environment name<input className={field} required maxLength={120} value={environmentName} onChange={(event) => setEnvironmentName(event.target.value)} /></label>
          <label className="block space-y-1 text-xs text-fg-secondary">Kind<select className={field} value={kind} onChange={(event) => setKind(event.target.value)}><option value="development">Development</option><option value="staging">Staging</option><option value="production">Production</option></select></label>
          <label className="block space-y-1 text-xs text-fg-secondary">Base URL<input className={field} type="url" required maxLength={2048} value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://app.example.com" /></label>
          <label className="block space-y-1 text-xs text-fg-secondary">Login email or username (optional)<input className={field} autoComplete="off" required={!!loginPassword || !!successSelector} value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} /></label>
          <label className="block space-y-1 text-xs text-fg-secondary">Login password<input className={field} type="password" autoComplete="new-password" required={!!loginUsername || !!successSelector} value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} /></label>
          <label className="block space-y-1 text-xs text-fg-secondary">Login success selector<input className={field} required={!!loginUsername || !!loginPassword} value={successSelector} onChange={(event) => setSuccessSelector(event.target.value)} placeholder="#signed-in" /></label>
          <Button type="submit" disabled={busy || !workspace.applications.length}>Add environment</Button>
        </form> : <p className="text-xs text-fg-tertiary">Only project owners and admins can add environments.</p>}
      </div>
    </section>
  </div>;
}
