"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { backendAuth } from "@/features/auth";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { Button } from "@/components/ui/button";
import { FIELD } from "@/shared/ui/field";
import { PageHeader } from "@/shared/ui/PageHeader";
const name = z.string().trim().min(1).max(120);
const projectId = z.uuid();
const timeout = <T,>(promise: PromiseLike<T>) => Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 8000))]);
const REQUEST_KEY = "blindspot-onboarding-request";
type PendingRequest = { userId: string; kind: "new" | "existing"; orgId: string | null; names: { orgName: string; projectName: string }; requestId: string };
const pendingSchema = z.object({ userId: z.string().min(1), kind: z.enum(["new", "existing"]), orgId: z.string().nullable(), names: z.object({ orgName: z.string(), projectName: z.string() }), requestId: z.uuid() });
function readPending(): PendingRequest | null { try { const value = sessionStorage.getItem(REQUEST_KEY); return value ? pendingSchema.parse(JSON.parse(value)) : null; } catch { sessionStorage.removeItem(REQUEST_KEY); return null; } }
function newRequestId() { const bytes = new Uint8Array(16); crypto.getRandomValues(bytes); bytes[6] = ((bytes[6] ?? 0) & 15) | 64; bytes[8] = ((bytes[8] ?? 0) & 63) | 128; return [...bytes].map((b, i) => `${i === 4 || i === 6 || i === 8 || i === 10 ? "-" : ""}${b.toString(16).padStart(2, "0")}`).join(""); }
function sameIntent(a: PendingRequest, b: Omit<PendingRequest, "requestId">) { return a.userId === b.userId && a.kind === b.kind && a.orgId === b.orgId && a.names.orgName === b.names.orgName && a.names.projectName === b.names.projectName; }
function restoreIntent(userId: string, rows: {id:string;name:string}[]) { const pending=readPending(); if(pending?.userId===userId && (pending.kind==="new" || rows.some((o)=>o.id===pending.orgId))) return pending; if(pending?.userId===userId) sessionStorage.removeItem(REQUEST_KEY); return null; }
function storeIntent(intent: Omit<PendingRequest,"requestId">) { const old=readPending(); const pending=old&&sameIntent(old,intent)?old:{...intent,requestId:newRequestId()}; sessionStorage.setItem(REQUEST_KEY,JSON.stringify(pending)); return pending; }
async function loadAccountData() { const user=await timeout(backendAuth.getUser()); if(!user) return null; return {user,orgs:await timeout(workspaceApi.onboardingOrganizations())}; }
function applyAccount(account: NonNullable<Awaited<ReturnType<typeof loadAccountData>>>, setters: {setUserId:(value:string)=>void;setOrgs:(value:{id:string;name:string}[])=>void;setOrg:(value:string)=>void;setOrgName:(value:string)=>void;setProjectName:(value:string)=>void}) { const {user,orgs:rows}=account; setters.setUserId(user.id); setters.setOrgs(rows); const pending=restoreIntent(user.id,rows); setters.setOrg(pending?.kind==="existing"?pending.orgId!:pending?"":rows[0]?.id??""); setters.setOrgName(pending?.names.orgName??""); setters.setProjectName(pending?.names.projectName??""); }
async function restoreAccount(setters: {setState:(value:"loading"|"ready"|"signedout")=>void;setError:(value:string)=>void;setUserId:(value:string)=>void;setOrgs:(value:{id:string;name:string}[])=>void;setOrg:(value:string)=>void;setOrgName:(value:string)=>void;setProjectName:(value:string)=>void},active:()=>boolean) { setters.setState("loading"); setters.setError(""); try { const account=await loadAccountData(); if(!active())return; if(!account){setters.setUserId("");setters.setOrgs([]);setters.setOrg("");setters.setOrgName("");setters.setProjectName("");setters.setState("signedout");return;} applyAccount(account,setters); setters.setState("ready"); } catch { if(active()){setters.setError("Could not load your account. Check the connection and retry."); setters.setState("signedout");} } }
function getIntent(userId: string, org: string, orgName: string, projectName: string) { const validProject=name.safeParse(projectName); if(!validProject.success) throw new Error("Project name must be 1–120 characters."); const validOrg=org?null:name.safeParse(orgName); if(validOrg&&!validOrg.success) throw new Error("Organization name must be 1–120 characters."); if(!userId) throw new Error("Sign in again before creating a workspace."); return {userId,kind:org?"existing" as const:"new" as const,orgId:org||null,names:{orgName:org?"":validOrg!.data,projectName:validProject.data}}; }
async function createRequestedProject(request: PendingRequest) { if(request.kind==="existing") { const result=await timeout(workspaceApi.addOrganizationProject({organizationId:request.orgId!,name:request.names.projectName,description:"",requestId:request.requestId})); return projectId.parse(result.id); } const result=await timeout(workspaceApi.onboarding({organizationName:request.names.orgName,projectName:request.names.projectName,requestId:request.requestId})); return projectId.parse(result.project.id); }

function WorkspaceLoadingCard({ onRetry }: { onRetry: () => void }) {
 return (
  <main className="mx-auto flex min-h-screen max-w-xl items-center p-8">
   <div className="w-full space-y-4 rounded-lg border border-subtle bg-panel p-8 text-center shadow-ambient">
    <p role="status" aria-busy="true" className="text-sm text-fg-secondary">Loading your account…</p>
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

function workspaceHeaderCopy(hasOrganizations: boolean) {
 return hasOrganizations
  ? { title: "Add a project", description: "Add a project to an organization you administer, or create a new one." }
  : { title: "Create your workspace", description: "You'll need an organization and one project to start running tests." };
}

type WorkspaceSetupFormProps = {
 orgs: { id: string; name: string }[];
 org: string;
 orgName: string;
 projectName: string;
 error: string;
 busy: boolean;
 onOrgChange: (value: string) => void;
 onOrgNameChange: (value: string) => void;
 onProjectNameChange: (value: string) => void;
 onSubmit: (e: React.FormEvent) => void;
};

function WorkspaceSetupForm({ orgs, org, orgName, projectName, error, busy, onOrgChange, onOrgNameChange, onProjectNameChange, onSubmit }: WorkspaceSetupFormProps) {
 const hasOrganizations = orgs.length > 0;
 const submitLabel = busy ? "Creating…" : org ? "Add project" : "Create workspace";
 const { title, description } = workspaceHeaderCopy(hasOrganizations);
 return (
  <main className="mx-auto max-w-xl p-8">
   <div className="space-y-6 rounded-lg border border-subtle bg-panel p-8 shadow-ambient">
    <PageHeader title={title} description={description} />
    <form className="space-y-5" onSubmit={onSubmit}>
     {hasOrganizations && (
      <label className="block space-y-2">
       <span className="text-sm font-medium text-fg">Organization</span>
       <select className={FIELD} value={org} onChange={e => onOrgChange(e.target.value)}>
        <option value="">Create a new organization</option>
        {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
       </select>
      </label>
     )}
     {!org && (
      <label className="block space-y-2">
       <span className="text-sm font-medium text-fg">Organization name</span>
       <input className={FIELD} required maxLength={120} value={orgName} onChange={e => onOrgNameChange(e.target.value)} />
      </label>
     )}
     <label className="block space-y-2">
      <span className="text-sm font-medium text-fg">Project name</span>
      <input className={FIELD} required maxLength={120} value={projectName} onChange={e => onProjectNameChange(e.target.value)} />
     </label>
     {error && <p role="alert" className="text-sm text-fail">{error}</p>}
     <Button type="submit" disabled={busy}>{submitLabel}</Button>
    </form>
    {hasOrganizations && (
     <p className="text-sm text-fg-secondary">
      <Link href="/workspace" className="font-medium text-accent hover:underline">Open existing projects or accept an invitation</Link>
     </p>
    )}
   </div>
  </main>
 );
}

export default function OnboardingPage() {
 const router=useRouter(); const [state,setState]=useState<"loading"|"ready"|"signedout">("loading"); const [userId,setUserId]=useState(""); const [orgs,setOrgs]=useState<{id:string;name:string}[]>([]); const [org,setOrg]=useState(""); const [orgName,setOrgName]=useState(""); const [projectName,setProjectName]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 const generation = useRef(0); const mounted = useRef(false); const busyRef = useRef(false);
 async function loadAccount() { const current = ++generation.current; await restoreAccount({setState,setError,setUserId,setOrgs,setOrg,setOrgName,setProjectName},()=>mounted.current&&current===generation.current); }
 useEffect(()=>{ mounted.current=true; void loadAccount(); const refresh=()=>{generation.current++;setUserId("");setOrgs([]);setOrg("");setOrgName("");setProjectName("");setError("");busyRef.current=false;setBusy(false);void loadAccount();}; const channel=typeof BroadcastChannel!=="undefined"?new BroadcastChannel("blindspot-auth"):null;if(channel)channel.onmessage=refresh;window.addEventListener("blindspot:auth-changed",refresh);return()=>{mounted.current=false;generation.current++;window.removeEventListener("blindspot:auth-changed",refresh);channel?.close();};},[]);
 function updateIntent(kind:PendingRequest["kind"],orgId:string|null,names:PendingRequest["names"]) { if(!userId)return; storeIntent({userId,kind,orgId,names}); }
 // eslint-disable-next-line complexity -- Keep validation and auth-scoped submit guards together.
 async function submit(e:React.FormEvent) { e.preventDefault(); if(busyRef.current)return; setError(""); let pending:PendingRequest; try { pending=storeIntent(getIntent(userId,org,orgName,projectName)); } catch(error) { setError(error instanceof Error?error.message:"Invalid setup request.");return; } const current=generation.current; busyRef.current=true;setBusy(true); try { const id=await createRequestedProject(pending); if(!mounted.current||current!==generation.current)return; busyRef.current=false;sessionStorage.removeItem(REQUEST_KEY); router.replace(`/projects/${encodeURIComponent(id)}`); } catch { if(mounted.current&&current===generation.current)setError("Setup failed. Check permissions or connection; your request is safe to retry."); } finally {if(mounted.current&&current===generation.current){busyRef.current=false;setBusy(false);}} }
 if (state === "loading") return <WorkspaceLoadingCard onRetry={() => void loadAccount()} />;
 if (state === "signedout") return <WorkspaceSignedOutCard error={error} />;

 return (
  <WorkspaceSetupForm
   orgs={orgs}
   org={org}
   orgName={orgName}
   projectName={projectName}
   error={error}
   busy={busy}
   onOrgChange={value => { setOrg(value); updateIntent(value ? "existing" : "new", value || null, { orgName: value ? "" : orgName, projectName }); }}
   onOrgNameChange={value => { setOrgName(value); updateIntent("new", null, { orgName: value, projectName }); }}
   onProjectNameChange={value => { setProjectName(value); updateIntent(org ? "existing" : "new", org || null, { orgName: org ? "" : orgName, projectName: value }); }}
   onSubmit={submit}
  />
 );
}
