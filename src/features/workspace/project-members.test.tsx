import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectMembers } from "./project-members";
import { workspaceApi } from "./workspace-api";

const ids = { a: "11111111-1111-4111-8111-111111111111", b: "22222222-2222-4222-8222-222222222222", project: "33333333-3333-4333-8333-333333333333" };
const mocks = vi.hoisted(() => ({ user: "11111111-1111-4111-8111-111111111111", role: "admin" as "owner" | "admin" | "member", invite: vi.fn() }));
vi.mock("./workspace-api", () => ({ workspaceApi: {
  identity: vi.fn(async () => ({ id: mocks.user, email: `${mocks.user}@example.test` })),
  project: vi.fn(async () => ({ id: ids.project, name: "Project", owner_id: ids.a, role: mocks.role, description: "", created_at: "2026-01-01T00:00:00Z" })),
  members: vi.fn(async () => [{ user_id: mocks.user, display_name: "User", role: mocks.role }]),
  invitations: vi.fn(async () => []), invite: mocks.invite,
} }));

function renderMembers() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return { client, ...render(<QueryClientProvider client={client}><ProjectMembers projectId={ids.project} /></QueryClientProvider>) };
}

afterEach(() => { vi.clearAllMocks(); mocks.user = ids.a; mocks.role = "admin"; });

describe("ProjectMembers access and account isolation", () => {
  it("lets project admins create pending invitations, then refreshes their own invitation key", async () => {
    mocks.role = "admin";
    mocks.invite.mockResolvedValue(undefined);
    const { client } = renderMembers();
    const key = ["workspace", ids.a, ids.project, "invitations"];
    client.setQueryData(key, []);
    const invalidate = vi.spyOn(client, "invalidateQueries");
    await screen.findByRole("heading", { name: "Members" });
    fireEvent.change(screen.getByLabelText("Verified email"), { target: { value: "person@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));
    await screen.findByText("Pending invitation created.");
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: key }));
  });

  it("does not fetch manager-only invitations or show write controls to members", async () => {
    mocks.role = "member";
    renderMembers();
    await screen.findByRole("heading", { name: "Members" });
    expect(workspaceApi.invitations).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Verified email")).toBeNull();
  });

  it("shows a project lookup error instead of an indefinite loading state", async () => {
    vi.mocked(workspaceApi.project).mockRejectedValueOnce(new Error("Project unavailable"));
    renderMembers();
    expect(await screen.findByRole("alert")).toHaveTextContent("Project unavailable");
  });

  it("switches identity immediately and ignores late account A data", async () => {
    let resolveA!: (rows: { user_id: string; display_name: string; role: "member" }[]) => void;
    const cache = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    vi.mocked(workspaceApi.members).mockImplementationOnce(() => new Promise((resolve) => { resolveA = resolve; }));
    render(<QueryClientProvider client={cache}><ProjectMembers projectId={ids.project} /></QueryClientProvider>);
    await waitFor(() => expect(resolveA).toBeDefined());
    await act(async () => { mocks.user = ids.b; window.dispatchEvent(new Event("blindspot:auth-changed")); });
    await screen.findByText("User");
    await act(async () => resolveA([{ user_id: ids.a, display_name: "Stale A", role: "member" }]));
    expect(screen.queryByText("Stale A")).toBeNull();
    expect(workspaceApi.members).toHaveBeenCalledTimes(2);
    expect(cache.getQueryData(["workspace", ids.a, ids.project, "members"])).toBeUndefined();
  });
});
