import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectInfrastructure } from "./project-infrastructure";
import { workspaceApi } from "./workspace-api";

const ids = { user: "11111111-1111-4111-8111-111111111111", project: "22222222-2222-4222-8222-222222222222" };
const mocks = vi.hoisted(() => ({ role: "admin" as "owner" | "admin" | "member", app: vi.fn(), env: vi.fn(), scan: vi.fn() }));
vi.mock("./workspace-api", () => ({ workspaceApi: {
  identity: vi.fn(async () => ({ id: ids.user, email: "user@example.test" })),
  project: vi.fn(async () => ({ id: ids.project, name: "Project", owner_id: ids.user, role: mocks.role, description: "", created_at: "2026-01-01T00:00:00Z" })),
  projectWorkspace: vi.fn(async () => ({ applications: [], environments: [], scans: [], results: [] })),
  createApplication: mocks.app, createEnvironment: mocks.env, createScan: mocks.scan,
} }));

function renderSetup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return { client, ...render(<QueryClientProvider client={client}><ProjectInfrastructure projectId={ids.project} /></QueryClientProvider>) };
}

afterEach(() => { vi.clearAllMocks(); mocks.role = "admin"; });

describe("ProjectInfrastructure role controls", () => {
  it("clicking manager form buttons submits valid application and environment data", async () => {
    vi.mocked(workspaceApi.projectWorkspace).mockResolvedValue({ applications: [{ id: ids.project, project_id: ids.project, name: "Web" }], environments: [], scans: [], results: [] });
    mocks.app.mockResolvedValue({});
    mocks.env.mockResolvedValue({});
    renderSetup();
    await screen.findByRole("heading", { name: "Project setup" });
    fireEvent.change(screen.getByLabelText("Application name"), { target: { value: "API" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(workspaceApi.createApplication).toHaveBeenCalledWith(ids.project, "API"));
    await screen.findAllByText("Web");
    fireEvent.change(screen.getByLabelText("Application"), { target: { value: ids.project } });
    fireEvent.change(screen.getByLabelText("Environment name"), { target: { value: "Staging" } });
    fireEvent.change(screen.getByLabelText("Base URL"), { target: { value: "https://app.example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Add environment" }));
    await waitFor(() => expect(workspaceApi.createEnvironment).toHaveBeenCalledWith(ids.project, expect.objectContaining({ application_id: ids.project, name: "Staging", base_url: "https://app.example.test" })));
    await waitFor(() => expect(workspaceApi.projectWorkspace).toHaveBeenCalledTimes(3));
  });

  it("clicking the member scan button queues and refreshes saved requests", async () => {
    vi.mocked(workspaceApi.projectWorkspace).mockResolvedValueOnce({ applications: [], environments: [{ id: ids.project, project_id: ids.project, application_id: ids.project, name: "Staging", kind: "staging", base_url: "https://app.example.test", has_credentials: false, revision: 1, verified_at: null }], scans: [], results: [] });
    mocks.role = "member";
    mocks.scan.mockResolvedValue({});
    renderSetup();
    await screen.findByRole("heading", { name: "Project setup" });
    fireEvent.change(screen.getByLabelText("Environment", { selector: "select" }), { target: { value: ids.project } });
    fireEvent.click(screen.getByRole("button", { name: "Save scan request" }));
    await waitFor(() => expect(workspaceApi.createScan).toHaveBeenCalledWith(ids.project, ids.project));
    await waitFor(() => expect(workspaceApi.projectWorkspace).toHaveBeenCalledTimes(2));
  });

  it("shows admin setup writes and queued scan controls", async () => {
    mocks.role = "admin";
    renderSetup();
    await screen.findByRole("heading", { name: "Project setup" });
    expect(screen.getByLabelText("Application name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save scan request" })).toBeInTheDocument();
    expect(workspaceApi.projectWorkspace).toHaveBeenCalledWith(ids.project, expect.any(AbortSignal));
  });

  it("renders project error before a dependent query can remain pending", async () => {
    vi.mocked(workspaceApi.project).mockRejectedValueOnce(new Error("Project unavailable"));
    renderSetup();
    expect(await screen.findByRole("alert")).toHaveTextContent("Project unavailable");
  });
});
