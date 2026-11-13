import { afterEach, describe, expect, it, vi } from "vitest";
import { workspaceApi } from "./workspace-api";

const projectId = "d7787aee-aef2-4d5d-b29c-96aafdf59e0d";
const userId = "11111111-1111-4111-8111-111111111111";
const invitationId = "22222222-2222-4222-8222-222222222222";
const project = { id: projectId, name: "Project", description: "", owner_id: userId, role: "owner", organization_id: null, created_at: "2026-01-01T00:00:00Z" };
const page = (items: unknown[]) => ({ items, next_cursor: null });

afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("canonical workspace API adapter", () => {
  it("uses no-prefix project collections with session cookies", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(page([project])), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.projects()).resolves.toEqual([project]);
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/projects", expect.objectContaining({ credentials: "include", cache: "no-store" }));
  });

  it("sends CSRF-protected project creation and parses its canonical response", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(project), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.createProject({ name: "Project" })).resolves.toEqual(project);
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/projects", expect.objectContaining({ method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" }, body: JSON.stringify({ name: "Project" }) }));
  });

  it("loads authenticated pending invites and accepts via canonical endpoint", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const invite = { id: invitationId, project_id: projectId, email: "member@example.test", role: "member", invited_by: userId, expires_at: "2026-02-01T00:00:00Z", created_at: "2026-01-01T00:00:00Z" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(page([invite])), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ user_id: userId, display_name: "Member", role: "member" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.myInvitations()).resolves.toEqual([invite]);
    await workspaceApi.acceptInvitation(invitationId);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["https://api.example.test/invitations?limit=50", `https://api.example.test/invitations/${invitationId}/accept`]);
  });

  it("supports explicitly configured localhost API for an isolated production-mode preview", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:43037");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(page([project])), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await workspaceApi.projects();
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:43037/projects", expect.objectContaining({ credentials: "include" }));
  });

  it("follows subsequent pages and rejects a repeated cursor", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const second = { ...project, id: "33333333-3333-4333-8333-333333333333", name: "Second" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [project], next_cursor: "next / page" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [second], next_cursor: null }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.projects()).resolves.toEqual([project, second]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["https://api.example.test/projects", "https://api.example.test/projects?cursor=next%20%2F%20page"]);
    fetchMock.mockReset()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [project], next_cursor: "repeat" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [second], next_cursor: "repeat" }), { status: 200 }));
    await expect(workspaceApi.projects()).rejects.toMatchObject({ code: "pagination_cursor_repeated" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const invite = { id: invitationId, project_id: projectId, email: "member@example.test", role: "member", invited_by: userId, expires_at: "2026-02-01T00:00:00Z", created_at: "2026-01-01T00:00:00Z" };
    fetchMock.mockReset()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [invite], next_cursor: "invite-page-2" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ ...invite, id: "33333333-3333-4333-8333-333333333333" }], next_cursor: null }), { status: 200 }));
    await expect(workspaceApi.myInvitations()).resolves.toHaveLength(2);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["https://api.example.test/invitations?limit=50", "https://api.example.test/invitations?limit=50&cursor=invite-page-2"]);
  });

  it("enforces deadline through body parsing and caller cancellation", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    vi.useFakeTimers();
    let bodySignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_url: string, init: RequestInit) => {
      bodySignal = init.signal as AbortSignal;
      return Promise.resolve({ ok: true, status: 200, json: () => new Promise((_, reject) => {
        bodySignal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
      }) } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    const request = workspaceApi.projectWorkspace(projectId, controller.signal);
    const rejected = expect(request).rejects.toMatchObject({ status: 0 });
    await vi.advanceTimersByTimeAsync(15000);
    await rejected;
    expect(bodySignal?.aborted).toBe(true);

    const cancelController = new AbortController();
    fetchMock.mockClear();
    const cancelled = workspaceApi.projectWorkspace(projectId, cancelController.signal);
    const cancellation = expect(cancelled).rejects.toMatchObject({ status: 0 });
    await Promise.resolve();
    cancelController.abort();
    await cancellation;
    expect(bodySignal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects non-local HTTP and malformed API origins", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:8000");
    await expect(workspaceApi.projects()).rejects.toThrow("Workspace service URL is invalid");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://example.test");
    await expect(workspaceApi.projects()).rejects.toThrow("Workspace service URL is invalid");
  });

  it("uses canonical workspace paths and collection envelopes", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const workspace = { applications: page([]), environments: page([]) };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(workspace), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: invitationId, name: "App", project_id: projectId }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: invitationId, name: "Staging", kind: "staging", base_url: "https://app.example.test", has_credentials: false, revision: 1, verified_at: null }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.projectWorkspace(projectId)).resolves.toEqual({ applications: [], environments: [] });
    await workspaceApi.createApplication(projectId, "App");
    await expect(workspaceApi.createEnvironment(projectId, { application_id: invitationId, name: "Staging", kind: "staging", base_url: "https://app.example.test" })).resolves.toMatchObject({ application_id: invitationId, project_id: projectId });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([`https://api.example.test/projects/${projectId}/workspace`, `https://api.example.test/projects/${projectId}/applications`, `https://api.example.test/projects/${projectId}/environments`]);
    expect(fetchMock.mock.calls.slice(1).every(([, init]) => (init as RequestInit).headers && (init as RequestInit).headers && ((init as RequestInit).headers as Record<string, string>)["X-CSRF-Protection"] === "1")).toBe(true);
  });
});

describe("analysis runs", () => {
  const environmentId = "44444444-4444-4444-8444-444444444444";
  const runId = "55555555-5555-4555-8555-555555555555";
  const requirementId = "66666666-6666-4666-8666-666666666666";
  const run = { id: runId, run_number: 1, project_id: projectId, environment_id: environmentId, status: "queued", cancel_requested: false, engine: null, requirement_snapshots: [{ id: requirementId, title: "Sign up", description: "", criteria: [] }], requested_by: userId, queued_at: "2026-01-01T00:00:00Z", started_at: null, completed_at: null, action_count: 0, estimated_cost_usd: null, error: null };
  const result = { id: runId, run_id: runId, requirement_id: requirementId, requirement_title: "Sign up", verdict: "inconclusive", classification: "locator_failure", observed_behavior: "Could not find the submit button.", criterion_assessments: [], actions: [], evidence: [], duration_ms: 1200 };

  it("rejects an empty or over-length requirement selection before making a request", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    expect(() => workspaceApi.createRun(projectId, environmentId, [])).toThrow();
    expect(() => workspaceApi.createRun(projectId, environmentId, Array.from({ length: 11 }, () => requirementId))).toThrow();
  });

  it("queues a run against the environment-scoped endpoint", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(run), { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.createRun(projectId, environmentId, [requirementId])).resolves.toMatchObject({ id: runId, status: "queued" });
    expect(fetchMock).toHaveBeenCalledWith(`https://api.example.test/projects/${projectId}/environments/${environmentId}/runs`, expect.objectContaining({ method: "POST", body: JSON.stringify({ requirement_ids: [requirementId] }) }));
  });

  it("lists runs, fetches one, lists and fetches its results, and cancels it", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(page([run])), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(run), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page([result])), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(result), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "cancelled" }), { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.listRuns(projectId, environmentId)).resolves.toEqual([run]);
    await expect(workspaceApi.getRun(projectId, environmentId, runId)).resolves.toEqual(run);
    await expect(workspaceApi.listResults(projectId, environmentId, runId)).resolves.toEqual([result]);
    await expect(workspaceApi.getResult(projectId, environmentId, runId, runId)).resolves.toEqual(result);
    await expect(workspaceApi.cancelRun(projectId, environmentId, runId)).resolves.toEqual({ status: "cancelled" });
    const base = `https://api.example.test/projects/${projectId}/environments/${environmentId}/runs`;
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([base, `${base}/${runId}`, `${base}/${runId}/results`, `${base}/${runId}/results/${runId}`, `${base}/${runId}/cancel`]);
  });

  it("builds an evidence URL without fetching it", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    expect(workspaceApi.evidenceUrl("evidence-1")).toBe("https://api.example.test/evidence/evidence-1");
  });
});

describe("runnable requirements and environment login", () => {
  const environmentId = "44444444-4444-4444-8444-444444444444";
  const requirementId = "66666666-6666-4666-8666-666666666666";
  const criterionId = "77777777-7777-4777-8777-777777777777";
  const requirement = {
    id: requirementId, project_id: projectId, title: "Checkout", description: "Complete a purchase",
    category: "functional", priority: "medium", approval_status: "draft",
    acceptance_criteria: [{ id: criterionId, text: "Confirmation is visible", position: 0 }],
    source: { kind: "manual", warnings: [] }, latest_result: null,
    created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z",
  };

  it("creates and edits requirements with criterion IDs and text", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(requirement), { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);
    await workspaceApi.createRequirement(projectId, { title: "Checkout", acceptanceCriteria: ["Confirmation is visible"] });
    await workspaceApi.updateRequirement(projectId, requirementId, { title: "Checkout", description: "Complete a purchase", acceptanceCriteria: [{ id: criterionId, text: "Confirmation is visible" }] });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).acceptance_criteria).toEqual([{ text: "Confirmation is visible", position: 0 }]);
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("PATCH");
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)).acceptance_criteria).toEqual([{ id: criterionId, text: "Confirmation is visible", position: 0 }]);
  });

  it("sends write-only login data and invokes BE verification", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const environment = { id: environmentId, project_id: projectId, name: "Staging", kind: "staging", base_url: "https://app.example.test", has_credentials: true, revision: 1, verified_at: null };
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(environment), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(environment), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "verified" }), { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    const credentials = { username: "demo", password: "test-secret", success_selector: "#signed-in" };
    const created = await workspaceApi.createEnvironment(projectId, { application_id: environmentId, name: "Staging", kind: "staging", base_url: "https://app.example.test", credentials });
    expect(created).not.toHaveProperty("credentials");
    await workspaceApi.updateEnvironmentCredentials(projectId, environmentId, credentials);
    await expect(workspaceApi.verifyEnvironment(projectId, environmentId)).resolves.toEqual({ status: "verified" });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).credentials).toEqual(credentials);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)).credentials).toEqual(credentials);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(`https://api.example.test/projects/${projectId}/environments/${environmentId}/verify`);
  });
});
