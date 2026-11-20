import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectInfrastructure } from "./project-infrastructure";
import { workspaceApi } from "./workspace-api";

const ids = { user: "11111111-1111-4111-8111-111111111111", project: "22222222-2222-4222-8222-222222222222" };
vi.mock("@/shared/ui/Modal", () => ({ Modal: ({ title, children }: { title: string; children: React.ReactNode }) => <div role="dialog" aria-label={title}>{children}</div> }));

const mocks = vi.hoisted(() => ({ role: "admin" as "owner" | "admin" | "member", app: vi.fn(), env: vi.fn() }));
vi.mock("./workspace-api", () => ({ workspaceApi: {
  identity: vi.fn(async () => ({ id: ids.user, email: "user@example.test" })),
  project: vi.fn(async () => ({ id: ids.project, name: "Project", owner_id: ids.user, role: mocks.role, description: "", created_at: "2026-01-01T00:00:00Z" })),
  projectWorkspace: vi.fn(async () => ({ applications: [], environments: [] })),
  createApplication: mocks.app, createEnvironment: mocks.env,
  updateEnvironment: vi.fn(), updateEnvironmentCredentials: vi.fn(), verifyEnvironment: vi.fn(),
} }));

function renderSetup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return { client, ...render(<QueryClientProvider client={client}><ProjectInfrastructure projectId={ids.project} /></QueryClientProvider>) };
}

beforeEach(() => { vi.clearAllMocks(); mocks.role = "admin"; vi.mocked(workspaceApi.projectWorkspace).mockResolvedValue({ applications: [], environments: [] }); vi.mocked(workspaceApi.verifyEnvironment).mockReset().mockResolvedValue({ status: "verified" }); vi.mocked(workspaceApi.updateEnvironmentCredentials).mockReset(); vi.mocked(workspaceApi.updateEnvironment).mockReset(); });
afterEach(() => { vi.clearAllMocks(); });

describe("ProjectInfrastructure role controls", () => {
  it("creates the required application automatically when adding the first environment", async () => {
    vi.mocked(workspaceApi.projectWorkspace).mockResolvedValue({ applications: [], environments: [] });
    mocks.app.mockResolvedValue({ id: ids.project });
    mocks.env.mockResolvedValue({ id: ids.project, project_id: ids.project, name: "Staging", kind: "staging", base_url: "https://app.example.test", has_credentials: false, revision: 1, verified_at: null });
    renderSetup();
    await screen.findByRole("heading", { name: "Project Setup & Discovery" });
    expect(screen.queryByRole("button", { name: "Add application" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New environment" }));
    expect(screen.queryByLabelText("Application")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Environment name"), { target: { value: "Staging" } });
    fireEvent.change(screen.getByLabelText("Base URL"), { target: { value: "https://app.example.test" } });
    fireEvent.click(within(screen.getByRole("dialog", { name: "New environment" })).getByRole("button", { name: "Add environment" }));
    await waitFor(() => expect(workspaceApi.createApplication).toHaveBeenCalledWith(ids.project, "Project"));
    await waitFor(() => expect(workspaceApi.createEnvironment).toHaveBeenCalledWith(ids.project, expect.objectContaining({ application_id: ids.project, name: "Staging", base_url: "https://app.example.test" })));
    await waitFor(() => expect(workspaceApi.projectWorkspace).toHaveBeenCalledTimes(2));
  });

  it("shows admin setup writes", async () => {
    mocks.role = "admin";
    renderSetup();
    await screen.findByRole("heading", { name: "Project Setup & Discovery" });
    expect(screen.getByRole("button", { name: "New environment" })).toBeEnabled();
    expect(workspaceApi.projectWorkspace).toHaveBeenCalledWith(ids.project, expect.any(AbortSignal));
  });

  it("renders project error before a dependent query can remain pending", async () => {
    vi.mocked(workspaceApi.project).mockRejectedValueOnce(new Error("Project unavailable"));
    renderSetup();
    expect(await screen.findByRole("alert")).toHaveTextContent("Project unavailable");
  });
});

const target = { id: "44444444-4444-4444-8444-444444444444", project_id: ids.project, name: "Staging", kind: "staging", base_url: "https://app.example.test", has_credentials: false, revision: 1, verified_at: null };
function withTarget(overrides: Partial<typeof target> = {}) {
  vi.mocked(workspaceApi.projectWorkspace).mockResolvedValue({ applications: [{ id: ids.project, project_id: ids.project, name: "Web" }], environments: [{ ...target, ...overrides }] });
}

describe("project setup authentication", () => {
  it("verifies public targets without requiring saved credentials", async () => {
    withTarget(); renderSetup();
    const verify = await screen.findByRole("button", { name: "Verify target" });
    expect(verify).toBeEnabled();
    fireEvent.click(verify);
    expect(await screen.findByText("Target verified. This environment is ready for browser checks.")).toBeInTheDocument();
    expect(workspaceApi.verifyEnvironment).toHaveBeenCalledWith(ids.project, target.id);
  });

  it("preserves a draft and reports failed credential saves as an error", async () => {
    withTarget();
    vi.mocked(workspaceApi.updateEnvironmentCredentials).mockRejectedValue(new Error("Credentials service unavailable"));
    renderSetup();
    fireEvent.change(await screen.findByLabelText("Login method"), { target: { value: "email_password" } });
    fireEvent.change(screen.getByLabelText("Test account username"), { target: { value: "qa@example.test" } });
    fireEvent.change(screen.getByLabelText("Test account password"), { target: { value: " a-test-password " } });
    fireEvent.change(screen.getByLabelText("Login success selector"), { target: { value: "#ready" } });
    fireEvent.click(screen.getByRole("button", { name: "Save authentication" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Credentials service unavailable");
    expect(screen.getByLabelText("Test account password")).toHaveValue(" a-test-password ");
    expect(workspaceApi.updateEnvironmentCredentials).toHaveBeenCalledWith(ids.project, target.id, { username: "qa@example.test", password: " a-test-password ", success_selector: "#ready" });
  });

  it("does not treat a failed verification response as success", async () => {
    withTarget();
    vi.mocked(workspaceApi.verifyEnvironment).mockResolvedValue({ status: "failed" });
    renderSetup();
    fireEvent.click(await screen.findByRole("button", { name: "Verify target" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Verification did not succeed (Failed)");
    expect(screen.queryByText("Your target is ready")).not.toBeInTheDocument();
  });

  it("shows configuration to members without write or verification actions", async () => {
    mocks.role = "member"; withTarget(); renderSetup();
    await screen.findByRole("heading", { name: "Test Login Credentials" });
    expect(screen.queryByRole("button", { name: "New environment" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Staging" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Verify target" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Test account password")).not.toBeInTheDocument();
  });
});
