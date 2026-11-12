import { z } from "zod";
import { backendAuth } from "@/features/auth";

const uuid = z.uuid();
const project = z.object({ id: uuid, name: z.string(), owner_id: uuid, role: z.enum(["owner", "admin", "member"]).optional(), description: z.string().optional().default(""), organization_id: uuid.nullable().optional(), created_at: z.string() });
const member = z.object({ user_id: uuid, display_name: z.string(), role: z.enum(["owner", "admin", "member"]) });
const invitation = z.object({ id: uuid, project_id: uuid, email: z.email(), role: z.enum(["admin", "member"]), invited_by: uuid, expires_at: z.string(), created_at: z.string() });
const memberInvite = invitation;
const notice = z.object({ id: uuid, message: z.string(), read_at: z.string().nullable(), created_at: z.string() });
const page = <T extends z.ZodType>(item: T) => z.object({ items: z.array(item), next_cursor: z.string().nullable().optional() });
const projectPage = page(project);
const memberPage = page(member);
const invitationPage = page(invitation);
const memberInvitationPage = page(memberInvite);
const noticePage = page(notice);
const application = z.object({ id: uuid, project_id: uuid, name: z.string() });
const environment = z.object({ id: uuid, project_id: uuid, application_id: uuid.optional(), name: z.string(), kind: z.string(), base_url: z.string(), has_credentials: z.boolean(), revision: z.number(), verified_at: z.string().nullable() });
const scan = z.object({ id: uuid, project_id: uuid, environment_id: uuid, status: z.literal("queued"), created_at: z.string() });
const testResult = z.object({ id: uuid, name: z.string(), status: z.string(), summary: z.string() });
const workspace = z.object({ applications: page(application), environments: page(environment), scans: page(scan), results: page(testResult) });
const applicationReply = application.extend({ project_id: uuid.optional() });
const environmentReply = environment.extend({ project_id: uuid.optional(), application_id: uuid.optional() });
const scanReply = scan.extend({ project_id: uuid.optional(), environment_id: uuid.optional(), status: z.string() });
const applicationPage = page(application);
const environmentPage = page(environment);
const scanPage = page(scan); const testResultPage = page(testResult);
const workspaceReply = z.object({ applications: applicationPage.optional(), environments: environmentPage.optional(), scans: scanPage.optional(), results: testResultPage.optional() }); const nameSchema = z.string().trim().min(1).max(120); const urlSchema = z.url().max(2048); const environmentKind = z.enum(["development", "staging", "production"]); const credentialReference = z.string().max(256).optional();

// Mirrors BlindSpotBE app/schemas/requirements.py. Fields stay snake_case here
// (the raw wire shape); map-requirement.ts converts to the camelCase domain type.
const acceptanceCriterion = z.object({ id: z.string().nullable().optional(), text: z.string().min(1).max(2000), position: z.number().int().default(0) });
const requirementCategory = z.enum(["functional", "ux", "data", "performance", "security"]);
const requirementPriority = z.enum(["critical", "high", "medium", "low"]);
const approvalStatus = z.enum(["draft", "needs_clarification", "approved"]);
const requirementSource = z.object({ kind: z.enum(["manual", "imported"]).default("manual"), document_name: z.string().nullable().optional(), document_role: z.enum(["brd", "srs", "design_spec"]).nullable().optional(), excerpt: z.string().nullable().optional(), char_start: z.number().nullable().optional(), char_end: z.number().nullable().optional(), warnings: z.array(z.string()).default([]) });
const latestResult = z.object({ run_id: uuid, verdict: z.enum(["pass", "fail", "inconclusive"]), completed_at: z.string() }).nullable();
const requirement = z.object({ id: uuid, project_id: uuid, title: z.string(), description: z.string(), category: requirementCategory, priority: requirementPriority, approval_status: approvalStatus, acceptance_criteria: z.array(acceptanceCriterion), source: requirementSource, latest_result: latestResult.optional(), created_at: z.string(), updated_at: z.string() });
const requirementPage = page(requirement);
const requirementsPath = (projectId: string, rid?: string) => `${workspacePath(projectId)}/requirements${rid ? `/${uuid.parse(rid)}` : ""}`;

function workspacePath(projectId: string) { return `/projects/${uuid.parse(projectId)}`; }

export class WorkspaceApiError extends Error {
  constructor(readonly status: number, readonly code: string | undefined, message: string) { super(message); }
}

function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => signal.removeEventListener("abort", abort);
    const finish = (action: () => void) => { if (settled) return; settled = true; cleanup(); action(); };
    const abort = () => finish(() => reject(signal.reason ?? new DOMException("Aborted", "AbortError")));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener("abort", abort, { once: true });
    promise.then((value) => finish(() => resolve(value)), (error: unknown) => finish(() => reject(error)));
  });
}

async function responseError(response: Response, signal: AbortSignal) {
  let error: { code?: string | undefined; message?: string | undefined } | undefined;
  try { error = z.object({ error: z.object({ code: z.string().optional(), message: z.string().optional() }) }).parse(await withAbort(response.json(), signal)).error; } catch { /* Ignore untrusted error bodies. */ }
  const message = response.status === 401 ? "Sign in to open your workspace." : response.status === 403 ? "You do not have permission for this action." : error?.message ?? "The request could not be completed. Retry.";
  return new WorkspaceApiError(response.status, error?.code, message);
}

function validOrigin(value: string) {
  try {
    const url = new URL(value);
    const local = url.protocol === "http:" && url.hostname === "localhost";
    return !url.username && !url.password && !url.search && !url.hash && url.pathname === "/" && (url.protocol === "https:" || local) ? url.origin : null;
  } catch { return null; }
}
function baseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!value) throw new WorkspaceApiError(0, undefined, "Workspace service is not configured.");
  const origin = validOrigin(value);
  if (!origin) throw new WorkspaceApiError(0, undefined, "Workspace service URL is invalid. Use localhost for development.");
  return origin;
}

// eslint-disable-next-line complexity -- Keep fetch deadline, cancellation, response validation and cleanup atomic.
async function request<T>(path: string, method: "GET" | "POST" | "PATCH", schema: z.ZodType<T>, body?: unknown, signal?: AbortSignal): Promise<T> {
  const base = baseUrl();
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${base}${path}`, {
      method, credentials: "include", cache: "no-store", signal: controller.signal,
      ...(method !== "GET" ? { headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" }, body: JSON.stringify(body ?? {}) } : {}),
    });
    if (!response.ok) throw await responseError(response, controller.signal);
    const raw = await withAbort(response.json(), controller.signal);
    try { return schema.parse(raw); }
    catch { throw new WorkspaceApiError(502, undefined, "Invalid workspace service response."); }
  } catch (error) {
    if (error instanceof WorkspaceApiError) throw error;
    throw new WorkspaceApiError(0, undefined, "Workspace service unavailable. Retry.");
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
}

const MAX_COLLECTION_PAGES = 20;
// eslint-disable-next-line complexity -- Cursor repeat and page-limit guards are required for bounded collection reads.
async function collection<T extends z.ZodType>(path: string, schema: T, maxPages = MAX_COLLECTION_PAGES) {
  const items: z.infer<T>[] = [];
  const cursors = new Set<string>();
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > MAX_COLLECTION_PAGES) throw new RangeError("Collection page limit must be between 1 and 20.");
  let cursor: string | null | undefined;
  for (let pageNumber = 0; pageNumber < maxPages; pageNumber++) {
    const separator = path.includes("?") ? "&" : "?";
    const result = await request(`${path}${cursor ? `${separator}cursor=${encodeURIComponent(cursor)}` : ""}`, "GET", page(schema));
    items.push(...result.items);
    cursor = result.next_cursor;
    if (!cursor) return items;
    if (cursors.has(cursor)) throw new WorkspaceApiError(502, "pagination_cursor_repeated", "Workspace service repeated a collection cursor.");
    cursors.add(cursor);
  }
  if (cursor) throw new WorkspaceApiError(502, "pagination_limit_reached", "Workspace collection exceeds the supported page limit.");
  return items;
}

export const workspaceApi = {
  async identity() { const user = await backendAuth.getUser(); if (!user) throw new WorkspaceApiError(401, undefined, "Sign in to open your workspace."); return user; },
  projectWorkspace: async (projectId: string, signal?: AbortSignal) => { const result = await request(`${workspacePath(projectId)}/workspace`, "GET", workspaceReply, undefined, signal); return { applications: result.applications?.items ?? [], environments: result.environments?.items ?? [], scans: result.scans?.items ?? [], results: result.results?.items ?? [] }; },
  createApplication: (projectId: string, name: string) => request(`${workspacePath(projectId)}/applications`, "POST", applicationReply, { name: nameSchema.parse(name) }).then((result) => ({ ...result, project_id: result.project_id ?? uuid.parse(projectId) })),
  createEnvironment: (projectId: string, args: { application_id: string; name: string; kind: string; base_url: string; credential_reference?: string }) => request(`${workspacePath(projectId)}/environments`, "POST", environmentReply, { application_id: uuid.parse(args.application_id), name: nameSchema.parse(args.name), kind: environmentKind.parse(args.kind), base_url: urlSchema.parse(args.base_url), ...(args.credential_reference ? { credential_reference: credentialReference.parse(args.credential_reference) } : {}) }).then((result) => ({ ...result, project_id: result.project_id ?? uuid.parse(projectId), application_id: result.application_id ?? uuid.parse(args.application_id) })),
  createScan: (projectId: string, environmentId: string) => request(`${workspacePath(projectId)}/scans`, "POST", scanReply, { environment_id: uuid.parse(environmentId) }).then((result) => ({ ...result, project_id: result.project_id ?? uuid.parse(projectId), environment_id: result.environment_id ?? uuid.parse(environmentId) })),
  projects: () => collection("/projects", projectPage.shape.items.element),
  project: (projectId: string) => request(`/projects/${uuid.parse(projectId)}`, "GET", project),
  myInvitations: () => collection("/invitations?limit=50", invitationPage.shape.items.element),
  notifications: () => collection("/notifications?unread=true", noticePage.shape.items.element),
  members: (projectId: string) => collection(`/projects/${uuid.parse(projectId)}/members`, memberPage.shape.items.element),
  invitations: (projectId: string) => collection(`/projects/${uuid.parse(projectId)}/invitations`, memberInvitationPage.shape.items.element),
  createProject: (args: { name: string; description?: string }) => request("/projects", "POST", project, args),
  invite: (projectId: string, email: string, role: "admin" | "member") => request(`/projects/${uuid.parse(projectId)}/invitations`, "POST", memberInvite, { email, role }),
  acceptInvitation: async (invitationId: string) => { await request(`/invitations/${uuid.parse(invitationId)}/accept`, "POST", member, {}); return { error: null }; },
  markNotificationRead: async (notificationId: string) => { await request(`/notifications/${uuid.parse(notificationId)}`, "PATCH", z.unknown(), { read: true }); return { error: null }; },
  requirements: (projectId: string) => collection(requirementsPath(projectId), requirementPage.shape.items.element),
  createRequirement: (projectId: string, args: { title: string; description?: string; category?: string; priority?: string; acceptanceCriteria?: string[] }) => request(requirementsPath(projectId), "POST", requirement, { title: args.title, description: args.description ?? "", category: args.category ?? "functional", priority: args.priority ?? "medium", acceptance_criteria: (args.acceptanceCriteria ?? []).map((text, position) => ({ text, position })) }),
  approveRequirement: (projectId: string, requirementId: string, approved = true) => request(`${requirementsPath(projectId, requirementId)}/approval`, "POST", requirement, { approved }),
};
export type WorkspaceApiTypes = { Project: z.infer<typeof project>; Member: z.infer<typeof member>; Invitation: z.infer<typeof invitation>; Notice: z.infer<typeof notice>; Requirement: z.infer<typeof requirement> };
