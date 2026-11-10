import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationsPanel } from "./notifications-panel";
import { workspaceApi } from "./workspace-api";

const mocks = vi.hoisted(() => ({ notifications: vi.fn(), markRead: vi.fn(), getUser: vi.fn() }));
vi.mock("@/features/auth", () => ({ backendAuth: { getUser: mocks.getUser } }));
vi.mock("./workspace-api", () => ({ workspaceApi: { notifications: mocks.notifications, markNotificationRead: mocks.markRead } }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><NotificationsPanel /></QueryClientProvider>);
}

describe("NotificationsPanel", () => {
  it("lists unread notices and marks them read through the shared API", async () => {
    mocks.getUser.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" });
    mocks.notifications.mockResolvedValueOnce([{ id: "22222222-2222-4222-8222-222222222222", message: "Project invitation", read_at: null, created_at: "2026-01-01T00:00:00Z" }]).mockResolvedValueOnce([{ id: "22222222-2222-4222-8222-222222222222", message: "Project invitation", read_at: "2026-01-02T00:00:00Z", created_at: "2026-01-01T00:00:00Z" }]);
    mocks.markRead.mockResolvedValue({ error: null });
    renderPanel();
    expect(await screen.findByText("Project invitation")).toBeInTheDocument();
    expect(screen.getByLabelText("1 unread")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mark as read" }));
    await waitFor(() => expect(workspaceApi.markNotificationRead).toHaveBeenCalledWith("22222222-2222-4222-8222-222222222222"));
    expect(await screen.findByText("Read")).toBeInTheDocument();
    expect(workspaceApi.notifications).toHaveBeenCalledTimes(2);
  });
});
