import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationsBell } from "./notifications-bell";
import { workspaceApi } from "./workspace-api";

const mocks = vi.hoisted(() => ({ notifications: vi.fn(), markRead: vi.fn(), getUser: vi.fn() }));
vi.mock("@/features/auth", () => ({ backendAuth: { getUser: mocks.getUser } }));
vi.mock("./workspace-api", () => ({ workspaceApi: { notifications: mocks.notifications, markNotificationRead: mocks.markRead } }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function renderBell() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><NotificationsBell /></QueryClientProvider>);
}

describe("NotificationsBell", () => {
  it("shows a plain dot for exactly one unread notice, with no number", async () => {
    mocks.getUser.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" });
    mocks.notifications.mockResolvedValue([{ id: "a", message: "Project invitation", read_at: null, created_at: "2026-01-01T00:00:00Z" }]);
    renderBell();
    expect(await screen.findByRole("button", { name: "Notifications, 1 unread" })).toBeInTheDocument();
  });

  it("shows the count once there are two or more unread notices", async () => {
    mocks.getUser.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" });
    mocks.notifications.mockResolvedValue([
      { id: "a", message: "First", read_at: null, created_at: "2026-01-01T00:00:00Z" },
      { id: "b", message: "Second", read_at: null, created_at: "2026-01-01T00:00:01Z" },
    ]);
    renderBell();
    const trigger = await screen.findByRole("button", { name: "Notifications, 2 unread" });
    expect(trigger.parentElement).toHaveTextContent("2");
  });

  it("lists notices in the dropdown and marks every unread one read when it closes", async () => {
    mocks.getUser.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" });
    mocks.notifications.mockResolvedValue([{ id: "a", message: "Project invitation", read_at: null, created_at: "2026-01-01T00:00:00Z" }]);
    mocks.markRead.mockResolvedValue({ error: null });
    renderBell();

    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 1 unread" }));
    expect(await screen.findByText("Project invitation")).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: "Escape" });
    await waitFor(() => expect(workspaceApi.markNotificationRead).toHaveBeenCalledWith("a"));
  });

  it("shows no badge and does not mark anything read when there are no unread notices", async () => {
    mocks.getUser.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" });
    mocks.notifications.mockResolvedValue([{ id: "a", message: "Already read", read_at: "2026-01-02T00:00:00Z", created_at: "2026-01-01T00:00:00Z" }]);
    renderBell();

    const trigger = await screen.findByRole("button", { name: "Notifications" });
    fireEvent.click(trigger);
    expect(await screen.findByText("Already read")).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(workspaceApi.markNotificationRead).not.toHaveBeenCalled();
  });
});
