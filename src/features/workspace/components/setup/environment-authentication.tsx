"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Eye, EyeOff, Globe, LoaderCircle, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FIELD } from "@/shared/ui/field";
import { humanizeEnum } from "@/shared/lib/labels";
import { workspaceApi, type LoginCredentials, type WorkspaceApiTypes } from "../../workspace-api";
import { EnvironmentStatus } from "./environment-cards";

const PANEL = "rounded-2xl border border-border bg-panel p-6 shadow-ambient";
type Environment = WorkspaceApiTypes["Environment"];
function LoginFields({ values, showPassword, onChange, onToggle }: { values: LoginCredentials; showPassword: boolean; onChange: (key: keyof LoginCredentials, value: string) => void; onToggle: () => void }) {
  return <div className="space-y-4"><label className="block space-y-2 text-sm font-medium">Test account username<input className={FIELD} required autoComplete="off" maxLength={500} value={values.username} onChange={(event) => onChange("username", event.target.value)} placeholder="qa@example.com" /></label><label className="block space-y-2 text-sm font-medium">Test account password<span className="relative block"><input aria-label="Test account password" className={`${FIELD} pr-12`} required type={showPassword ? "text" : "password"} autoComplete="new-password" maxLength={2000} value={values.password} onChange={(event) => onChange("password", event.target.value)} placeholder="Enter a new test password" /><Button type="button" variant="ghost" size="icon-sm" className="absolute right-2 top-1" aria-label={showPassword ? "Hide password" : "Show password"} onClick={onToggle}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button></span></label><label className="block space-y-2 text-sm font-medium">Login success selector<input aria-label="Login success selector" className={`${FIELD} font-mono text-xs`} required maxLength={1000} value={values.success_selector} onChange={(event) => onChange("success_selector", event.target.value)} placeholder='[data-testid="dashboard"]' /><span className="block text-xs font-normal leading-relaxed text-fg-tertiary">A CSS selector visible only after sign-in succeeds.</span></label><details className="rounded-xl border border-border bg-canvas px-4 py-3"><summary className="cursor-pointer text-xs font-medium text-fg-secondary">Advanced login field selectors</summary><div className="mt-4 space-y-3">{[{ key: "username_selector", label: "Username field selector", placeholder: 'input[name="email"]' }, { key: "password_selector", label: "Password field selector", placeholder: 'input[type="password"]' }, { key: "submit_selector", label: "Submit button selector", placeholder: 'button[type="submit"]' }].map(({ key, label, placeholder }) => <label key={key} className="block space-y-1.5 text-xs text-fg-secondary">{label}<input className={`${FIELD} font-mono text-xs`} maxLength={1000} value={values[key as keyof LoginCredentials] ?? ""} onChange={(event) => onChange(key as keyof LoginCredentials, event.target.value)} placeholder={placeholder} /></label>)}</div></details></div>;
}
// eslint-disable-next-line complexity -- Public and authenticated modes share the write-only credential form and save state.
function CredentialsPanel({ environment, canManage, onChanged }: { environment: Environment; canManage: boolean; onChanged: () => Promise<void> }) {
  const [method, setMethod] = useState(environment.has_credentials ? "email_password" : "none");
  const [values, setValues] = useState<LoginCredentials>({ username: "", password: "", success_selector: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const noChange = method === "none" && !environment.has_credentials;
  const incomplete = method === "email_password" && (!values.username.trim() || !values.password || !values.success_selector.trim());
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || noChange || incomplete) return;
    setBusy(true); setError(""); setMessage("");
    try {
      if (method === "none") await workspaceApi.updateEnvironment(environment.project_id, environment.id, { credentials: null });
      else await workspaceApi.updateEnvironmentCredentials(environment.project_id, environment.id, credentialsPayload(values));
      setValues({ username: "", password: "", success_selector: "" }); setShowPassword(false);
      setMessage("Authentication saved. Verify this target before starting a run."); await onChanged();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save authentication. Please retry."); }
    finally { setBusy(false); }
  }
  return <details className={`${PANEL} self-start`}><summary className="group flex list-none cursor-pointer items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-raised"><LockKeyhole className="size-4" /></span><div><h2 className="text-base font-semibold">Test Login Credentials</h2><p className="mt-1 text-xs leading-relaxed text-fg-tertiary">Authentication for {environment.name}. Saved passwords are never returned to this form.</p></div><ChevronDown aria-hidden="true" className="ml-auto size-5 shrink-0 text-fg-tertiary transition-transform group-open:rotate-180" /></summary><div className="mt-5">{canManage ? <form onSubmit={(event) => void save(event)}><fieldset disabled={busy} className="space-y-5"><label className="block space-y-2 text-sm font-medium">Login method<select className={FIELD} value={method} onChange={(event) => { setMethod(event.target.value); setMessage(""); setError(""); }}><option value="none">Public application · no login</option><option value="email_password">Email / username and password</option></select></label>{method === "email_password" ? <><div className="rounded-xl border border-subtle bg-canvas p-3 text-xs leading-relaxed text-fg-tertiary">{environment.has_credentials ? "A test login is already saved. Enter a complete new account below only when you want to replace it." : "Use a dedicated test account that can access this environment."}</div><LoginFields values={values} showPassword={showPassword} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} onToggle={() => setShowPassword(!showPassword)} /></> : <div className="flex items-start gap-3 rounded-xl border border-subtle bg-canvas p-4 text-sm text-fg-secondary"><Globe className="mt-0.5 size-4 shrink-0" /><p className="text-sm leading-relaxed">Browser checks can open this target without signing in. {environment.has_credentials && "Saving this choice removes the saved test login for this environment."}</p></div>}</fieldset>{error && <p role="alert" className="mt-4 text-sm text-fail">{error}</p>}{message && <p role="status" className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-pass"><Check className="mt-0.5 size-3.5 shrink-0" />{message}</p>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-4"><span className="flex items-center gap-1.5 text-[11px] text-fg-tertiary"><LockKeyhole className="size-3" />{environment.has_credentials ? "Test login saved" : "No credentials stored"}</span><Button type="submit" disabled={busy || noChange || incomplete}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{busy ? "Saving…" : "Save authentication"}</Button></div></form> : <div className="rounded-xl bg-canvas p-4 text-sm leading-relaxed text-fg-tertiary">{environment.has_credentials ? "A test login is configured for this environment." : "This target uses public access."} Only project owners and admins can change authentication.</div>}</div></details>;
}
function credentialsPayload(values: LoginCredentials): LoginCredentials {
  const credentials: LoginCredentials = { username: values.username.trim(), password: values.password, success_selector: values.success_selector.trim() };
  for (const key of ["username_selector", "password_selector", "submit_selector"] as const) if (values[key]?.trim()) credentials[key] = values[key]!.trim();
  return credentials;
}
function VerificationPanel({ environment, canManage, projectId, onChanged }: { environment: Environment; canManage: boolean; projectId: string; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function verify() {
    if (busy) return; setBusy(true); setError(""); setMessage("");
    try {
      const result = await workspaceApi.verifyEnvironment(projectId, environment.id);
      if (result.status === "verified") setMessage("Target verified. This environment is ready for browser checks.");
      else setError(`Verification did not succeed (${humanizeEnum(result.status)}). Review the target URL and login settings, then retry.`);
      await onChanged();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not verify the target. Please retry."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-3" aria-label="Target verification"><div className="flex flex-wrap items-center gap-3">{canManage && <Button variant="outline" disabled={busy} onClick={() => void verify()}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}{busy ? "Verifying…" : environment.verified_at ? "Re-verify target" : "Verify target"}</Button>}<EnvironmentStatus verified={!!environment.verified_at} />{environment.verified_at && <Link href={`/projects/${projectId}/runs?environmentId=${environment.id}`} className="inline-flex items-center gap-2 text-sm font-medium hover:underline">Go to test runs <ArrowRight className="size-3.5" /></Link>}</div>{busy && <p role="status" className="text-xs text-fg-tertiary">Checking the saved configuration…</p>}{error && <p role="alert" className="text-sm text-fail">{error}</p>}{message && <p role="status" className="text-sm text-pass">{message}</p>}</div>;

}
export function EnvironmentAuthentication({ environment, projectId, canManage, onChanged }: { environment: Environment; projectId: string; canManage: boolean; onChanged: () => Promise<void> }) {
  return <section className="space-y-4" aria-labelledby="selected-target-heading"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-fg-tertiary">Selected target</p><h2 id="selected-target-heading" className="mt-1 text-lg font-semibold">{environment.name} configuration</h2></div></div><div className="space-y-4"><CredentialsPanel key={environment.id} environment={environment} canManage={canManage} onChanged={onChanged} /><VerificationPanel key={`${environment.id}:${environment.revision}`} environment={environment} canManage={canManage} projectId={projectId} onChanged={onChanged} /></div></section>;
}
