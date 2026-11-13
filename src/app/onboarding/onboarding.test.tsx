import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingPage from "./page";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), createProject: vi.fn(), replace: vi.fn() }));
vi.mock("@/features/auth/services/backend-auth", () => ({ backendAuth: { getUser: mocks.getUser } }));
vi.mock("@/features/workspace/workspace-api", () => ({ workspaceApi: { createProject: mocks.createProject } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ id: "synthetic-user", email: "synthetic@example.com" });
});

const project = (id: string) => ({ id, name: "Project", owner_id: "11111111-1111-4111-8111-111111111111", description: "", created_at: "2026-01-01T00:00:00Z" });
const deferred = <T,>() => { let resolve!: (v: T) => void; const promise = new Promise<T>((r) => { resolve = r; }); return { promise, resolve }; };

describe("project onboarding", () => {
  it("keeps demo credentials out of the signed-out product flow", async () => {
    mocks.getUser.mockResolvedValue(null);
    render(<OnboardingPage />);
    expect(await screen.findByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: /demo/i })).not.toBeInTheDocument();
  });

  it("creates a project and navigates to it", async () => {
    const pending = deferred<ReturnType<typeof project>>();
    mocks.createProject.mockReturnValue(pending.promise);
    render(<OnboardingPage />);
    fireEvent.change(await screen.findByLabelText("Project name"), { target: { value: "My project" } });
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));
    expect(screen.getByRole("button", { name: "Creating…" })).toBeDisabled();
    expect(mocks.createProject).toHaveBeenCalledWith({ name: "My project" });
    await act(async () => pending.resolve(project("d7787aee-aef2-4d5d-b29c-96aafdf59e0d")));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/projects/d7787aee-aef2-4d5d-b29c-96aafdf59e0d"));
  });

  it("shows an error and stays usable when creation fails", async () => {
    mocks.createProject.mockRejectedValue(new Error("network"));
    render(<OnboardingPage />);
    fireEvent.change(await screen.findByLabelText("Project name"), { target: { value: "My project" } });
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("safe to retry");
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Create project" })).toBeEnabled();
  });

  it("reloads the account check after an auth change event", async () => {
    render(<OnboardingPage />);
    await screen.findByLabelText("Project name");
    expect(mocks.getUser).toHaveBeenCalledTimes(1);
    act(() => window.dispatchEvent(new Event("blindspot:auth-changed")));
    await waitFor(() => expect(mocks.getUser).toHaveBeenCalledTimes(2));
  });
});
