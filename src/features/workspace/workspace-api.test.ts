import { afterEach, describe, expect, it, vi } from "vitest";
import { workspaceApi } from "./workspace-api";

const projectId = "d7787aee-aef2-4d5d-b29c-96aafdf59e0d";
const userId = "11111111-1111-4111-8111-111111111111";
const invitationId = "22222222-2222-4222-8222-222222222222";
const project = { id: projectId, name: "Project", description: "", owner_id: userId, role: "owner", organization_id: null, created_at: "2026-01-01T00:00:00Z" };
const org = { id: invitationId, name: "Org", owner_id: userId, created_at: "2026-01-01T00:00:00Z" };
const listedOrg = { ...org, role: "owner" };
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

  it("sends CSRF-protected onboarding and parses its canonical response", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    const response = { organization: org, project };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.onboarding({ organizationName: "Org", projectName: "Project", requestId: invitationId })).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/onboarding", expect.objectContaining({ method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" }, body: JSON.stringify({ organization_name: "Org", project_name: "Project", request_id: invitationId }) }));
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
    fetchMock.mockReset()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [listedOrg], next_cursor: "org-page-2" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ ...listedOrg, id: "33333333-3333-4333-8333-333333333333", name: "Second org" }], next_cursor: null }), { status: 200 }));
    await expect(workspaceApi.onboardingOrganizations()).resolves.toHaveLength(2);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["https://api.example.test/organizations", "https://api.example.test/organizations?cursor=org-page-2"]);
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
    const workspace = { applications: page([]), environments: page([]), scans: page([]), results: page([]) };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(workspace), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: invitationId, name: "App", project_id: projectId }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: invitationId, name: "Staging", kind: "staging", base_url: "https://app.example.test", has_credentials: false, revision: 1, verified_at: null }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: invitationId, status: "queued", created_at: "2026-01-01T00:00:00Z" }), { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(workspaceApi.projectWorkspace(projectId)).resolves.toEqual({ applications: [], environments: [], scans: [], results: [] });
    await workspaceApi.createApplication(projectId, "App");
    await expect(workspaceApi.createEnvironment(projectId, { application_id: invitationId, name: "Staging", kind: "staging", base_url: "https://app.example.test" })).resolves.toMatchObject({ application_id: invitationId, project_id: projectId });
    await workspaceApi.createScan(projectId, invitationId);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([`https://api.example.test/projects/${projectId}/workspace`, `https://api.example.test/projects/${projectId}/applications`, `https://api.example.test/projects/${projectId}/environments`, `https://api.example.test/projects/${projectId}/scans`]);
    expect(fetchMock.mock.calls.slice(1).every(([, init]) => (init as RequestInit).headers && (init as RequestInit).headers && ((init as RequestInit).headers as Record<string, string>)["X-CSRF-Protection"] === "1")).toBe(true);
  });
});
