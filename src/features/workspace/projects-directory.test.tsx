import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectsDirectory } from "./projects-directory";

const mocks = vi.hoisted(() => ({ identity: { isPending: false, error: null as Error | null, refetch: vi.fn() }, projects: { isPending: true, error: null as Error | null, data: undefined as unknown[] | undefined, refetch: vi.fn() }, invitations: { isPending: true, error: null as Error | null, data: undefined as unknown[] | undefined, refetch: vi.fn() }, createProject: vi.fn(), acceptInvitation: vi.fn(), push: vi.fn() }));
vi.mock("./use-projects-directory", () => ({ useProjectsDirectory: () => mocks }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

function renderDirectory() {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}><ProjectsDirectory /></QueryClientProvider>);
}

describe("ProjectsDirectory identity state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.isPending = false;
    mocks.identity.error = null;
    mocks.projects.isPending = true;
    mocks.invitations.isPending = true;
  });

  it("renders identity failure with retry instead of stuck dependent loading", () => {
    mocks.identity.error = new Error("Sign in to open your projects.");
    renderDirectory();
    expect(screen.getByRole("alert")).toHaveTextContent("Sign in to open your projects.");
    expect(screen.getByRole("button", { name: "Retry identity check" })).toBeInTheDocument();
    expect(screen.queryByText("Loading projects…")).toBeNull();
    expect(screen.queryByText("Loading invitations…")).toBeNull();
  });
});
