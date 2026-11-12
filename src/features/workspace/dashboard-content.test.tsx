import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardContent } from "./dashboard-content";

const mocks = vi.hoisted(() => ({
  identity: { isPending: false, error: null as Error | null, refetch: vi.fn() },
  projects: { isPending: true, error: null as Error | null, data: undefined as unknown[] | undefined, refetch: vi.fn() },
  invitations: { isPending: true, error: null as Error | null, data: undefined as unknown[] | undefined, refetch: vi.fn() },
  acceptInvitation: vi.fn(),
}));
vi.mock("./use-dashboard", () => ({ useDashboard: () => mocks }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

function renderDashboard() {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}><DashboardContent /></QueryClientProvider>);
}

describe("DashboardContent identity state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.isPending = false;
    mocks.identity.error = null;
    mocks.projects.isPending = true;
    mocks.invitations.isPending = true;
  });

  it("renders identity failure with retry instead of stuck dependent loading", () => {
    mocks.identity.error = new Error("Sign in to open your dashboard.");
    renderDashboard();
    expect(screen.getByRole("alert")).toHaveTextContent("Sign in to open your dashboard.");
    expect(screen.getByRole("button", { name: "Retry identity check" })).toBeInTheDocument();
    expect(screen.queryByText("Loading projects…")).toBeNull();
    expect(screen.queryByText("Loading invitations…")).toBeNull();
  });

  it("links the projects section's add-project action to onboarding", () => {
    mocks.projects.isPending = false;
    mocks.projects.data = [];
    mocks.invitations.isPending = false;
    mocks.invitations.data = [];
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.queryByText("Organizations")).toBeNull();
    expect(screen.queryByText("Organization setup")).toBeNull();
    const addProjectLinks = screen.getAllByRole("link", { name: "Add project" });
    expect(addProjectLinks.length).toBeGreaterThan(0);
    for (const link of addProjectLinks) expect(link).toHaveAttribute("href", "/onboarding");
  });
});
