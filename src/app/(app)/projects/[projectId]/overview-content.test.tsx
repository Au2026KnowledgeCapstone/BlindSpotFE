import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OverviewContent } from "./overview-content";

const mocks = vi.hoisted(() => ({ project: vi.fn(), getUser: vi.fn(), useRuns: vi.fn(), dashboard: vi.fn() }));
vi.mock("@/features/auth", () => ({ backendAuth: { getUser: mocks.getUser } }));
vi.mock("@/features/workspace/workspace-api", () => ({ workspaceApi: { project: mocks.project } }));
vi.mock("@/features/runs", () => ({ useRuns: mocks.useRuns }));
vi.mock("@/features/overview", () => ({ OverviewDashboard: mocks.dashboard }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

function renderPage(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return { client, ...render(<QueryClientProvider client={client}><OverviewContent projectId="project-1" /></QueryClientProvider>) };
}

describe("project overview API boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUser.mockResolvedValue({ id: "user-a", email: "a@example.test" });
    mocks.project.mockResolvedValue({ id: "project-1", name: "Real project", description: "Project summary" });
    mocks.useRuns.mockReturnValue({ data: [], isError: true, error: Object.assign(new Error("unavailable"), { status: 501 }), isLoading: false });
    mocks.dashboard.mockReturnValue(<div>Analysis components</div>);
  });

  it("keeps project setup and members visible when analysis returns 501", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Real project" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Project setup" })).toHaveAttribute("href", "/projects/project-1/setup");
    expect(screen.getByRole("link", { name: "Members" })).toHaveAttribute("href", "/projects/project-1/members");
    expect(screen.getByRole("heading", { name: "Analysis is not connected yet" })).toBeInTheDocument();
    expect(screen.queryByText("Analysis components")).not.toBeInTheDocument();
  });

  it("does not reuse a warm project cache before checking current identity", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(["workspace", "user-a", "project", "project-1"], { id: "project-1", name: "Account A secret", description: "" });
    mocks.getUser.mockResolvedValue(null);
    renderPage(client);
    expect(await screen.findByRole("alert")).toHaveTextContent("Sign in to open this project.");
    expect(mocks.project).not.toHaveBeenCalled();
    expect(screen.queryByText("Account A secret")).not.toBeInTheDocument();
  });

  it("preserves real analysis rendering when data is available", async () => {
    mocks.useRuns.mockReturnValue({ data: [{ id: "run-real" }], isError: false, isLoading: false });
    renderPage();
    expect(await screen.findByText("Analysis components")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Project setup" })).toBeInTheDocument();
  });
});
