import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OverviewContent } from "./overview-content";

const mocks = vi.hoisted(() => ({ project: vi.fn(), listEnvironments: vi.fn(), listRuns: vi.fn(), getUser: vi.fn() }));
vi.mock("@/features/auth", () => ({ backendAuth: { getUser: mocks.getUser } }));
vi.mock("@/features/workspace/workspace-api", () => ({ workspaceApi: { project: mocks.project, listEnvironments: mocks.listEnvironments, listRuns: mocks.listRuns } }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

function renderPage(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return { client, ...render(<QueryClientProvider client={client}><OverviewContent projectId="project-1" /></QueryClientProvider>) };
}

const run = (id: string, environmentId: string, queuedAt: string) => ({
  id, run_number: 1, project_id: "project-1", environment_id: environmentId,
  status: "completed", engine: "mvp", requirement_snapshots: [{ id: "r1", title: "Checkout", description: "", criteria: [] }],
  requested_by: "user-a", queued_at: queuedAt, started_at: null, completed_at: null,
  action_count: 2, estimated_cost_usd: null, error: null,
});

describe("project overview API boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUser.mockResolvedValue({ id: "user-a", email: "a@example.test" });
    mocks.project.mockResolvedValue({ id: "project-1", name: "Real project", description: "Project summary" });
    mocks.listEnvironments.mockResolvedValue([{ id: "env-a" }, { id: "env-b" }]);
    mocks.listRuns.mockImplementation(async (_projectId: string, environmentId: string) =>
      environmentId === "env-a" ? [run("run-a", "env-a", "2026-01-01T00:00:00Z")] : [run("run-b", "env-b", "2026-01-02T00:00:00Z")]);
  });

  it("shows real run history from every environment, newest first", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Real project" })).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "Recent runs" })).toHaveTextContent("#1");
    const links = screen.getAllByRole("link", { name: /#1/ });
    expect(links[0]).toHaveAttribute("href", "/projects/project-1/runs/run-b?environmentId=env-b");
    expect(links[1]).toHaveAttribute("href", "/projects/project-1/runs/run-a?environmentId=env-a");
    expect(mocks.listRuns).toHaveBeenCalledTimes(2);
  });

  it("does not reuse a warm project cache before checking current identity", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(["workspace", "user-a", "project", "project-1"], { id: "project-1", name: "Account A secret", description: "" });
    mocks.getUser.mockResolvedValue(null);
    renderPage(client);
    expect(await screen.findByRole("alert")).toHaveTextContent("Sign in to open this project.");
    expect(mocks.project).not.toHaveBeenCalled();
    expect(mocks.listRuns).not.toHaveBeenCalled();
    expect(screen.queryByText("Account A secret")).not.toBeInTheDocument();
  });

  it("shows a retryable error if one environment's history fails", async () => {
    mocks.listRuns.mockRejectedValue(new Error("History unavailable"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("History unavailable");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
