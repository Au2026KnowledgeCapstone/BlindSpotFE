"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { backendAuth } from "@/features/auth";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { Button } from "@/components/ui/button";
import { FIELD } from "@/shared/ui/field";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LoadingMark } from "@/shared/ui/LoadingMark";

const timeout = <T,>(promise: PromiseLike<T>) => Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 8000))]);

function WorkspaceLoadingCard({ onRetry }: { onRetry: () => void }) {
 return (
  <main className="mx-auto flex min-h-screen max-w-xl items-center p-8">
   <div role="status" className="w-full space-y-4 rounded-lg border border-subtle bg-panel p-8 text-center shadow-ambient">
    <LoadingMark size={40} className="mx-auto text-fg-tertiary" />
    <span className="sr-only">Loading your account</span>
    <Button type="button" variant="outline" onClick={onRetry}>Retry</Button>
   </div>
  </main>
 );
}

function WorkspaceSignedOutCard({ error }: { error: string }) {
 return (
  <main className="mx-auto flex min-h-screen max-w-xl items-center p-8">
   <div className="w-full space-y-4 rounded-lg border border-subtle bg-panel p-8 text-center shadow-ambient">
    <h1 className="text-lg font-semibold text-fg">Sign in to continue</h1>
    <p className="text-sm text-fg-secondary">Create an account and confirm your email first, if requested.</p>
    {error && <p role="alert" className="text-sm text-fail">{error}</p>}
    <Link href="/login" className="inline-block text-sm font-medium text-accent hover:underline">Sign in</Link>
   </div>
  </main>
 );
}

type WorkspaceSetupFormProps = {
 projectName: string;
 error: string;
 busy: boolean;
 onProjectNameChange: (value: string) => void;
 onSubmit: (e: React.FormEvent) => void;
};

function WorkspaceSetupForm({ projectName, error, busy, onProjectNameChange, onSubmit }: WorkspaceSetupFormProps) {
 return (
  <main className="mx-auto max-w-xl p-8">
   <div className="space-y-6 rounded-lg border border-subtle bg-panel p-8 shadow-ambient">
    <PageHeader title="Create a project" description="Give your project a name to start running tests." />
    <form className="space-y-5" onSubmit={onSubmit}>
     <label className="block space-y-2">
      <span className="text-sm font-medium text-fg">Project name</span>
      <input className={FIELD} required maxLength={120} value={projectName} onChange={e => onProjectNameChange(e.target.value)} />
     </label>
     {error && <p role="alert" className="text-sm text-fail">{error}</p>}
     <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create project"}</Button>
    </form>
   </div>
  </main>
 );
}

export default function OnboardingPage() {
 const router = useRouter();
 const [state, setState] = useState<"loading" | "ready" | "signedout">("loading");
 const [projectName, setProjectName] = useState("");
 const [error, setError] = useState("");
 const [busy, setBusy] = useState(false);
 const generation = useRef(0);
 const mounted = useRef(false);

 async function loadAccount() {
  const current = ++generation.current;
  setState("loading");
  setError("");
  try {
   const user = await timeout(backendAuth.getUser());
   if (!mounted.current || current !== generation.current) return;
   setState(user ? "ready" : "signedout");
  } catch {
   if (mounted.current && current === generation.current) {
    setError("Could not load your account. Check the connection and retry.");
    setState("signedout");
   }
  }
 }

 useEffect(() => {
  mounted.current = true;
  void loadAccount();
  const refresh = () => { generation.current++; setProjectName(""); setError(""); setBusy(false); void loadAccount(); };
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
  if (channel) channel.onmessage = refresh;
  window.addEventListener("blindspot:auth-changed", refresh);
  return () => { mounted.current = false; generation.current++; window.removeEventListener("blindspot:auth-changed", refresh); channel?.close(); };
 }, []);

 async function submit(e: React.FormEvent) {
  e.preventDefault();
  if (busy) return;
  setError("");
  const name = projectName.trim();
  if (!name) { setError("Project name must be 1–120 characters."); return; }
  const current = generation.current;
  setBusy(true);
  try {
   const created = await timeout(workspaceApi.createProject({ name }));
   if (!mounted.current || current !== generation.current) return;
   router.replace(`/projects/${encodeURIComponent(created.id)}`);
  } catch {
   if (mounted.current && current === generation.current) setError("Setup failed. Check permissions or connection; your request is safe to retry.");
  } finally {
   if (mounted.current && current === generation.current) setBusy(false);
  }
 }

 if (state === "loading") return <WorkspaceLoadingCard onRetry={() => void loadAccount()} />;
 if (state === "signedout") return <WorkspaceSignedOutCard error={error} />;

 return (
  <WorkspaceSetupForm
   projectName={projectName}
   error={error}
   busy={busy}
   onProjectNameChange={setProjectName}
   onSubmit={submit}
  />
 );
}
