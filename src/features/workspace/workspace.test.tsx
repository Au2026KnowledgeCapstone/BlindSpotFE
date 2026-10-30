import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Workspace } from "./workspace";
import { useWorkspace } from "./use-workspace";

vi.mock("./use-workspace", () => ({ useWorkspace: vi.fn() }));
const rpc = vi.fn().mockResolvedValue({ error: null });
const mutateAsync = vi.fn(async (action: () => PromiseLike<unknown>) => await action());
const refetch = vi.fn();
const reset = vi.fn();
function setup(overrides: Record<string, unknown> = {}) {
  vi.mocked(useWorkspace).mockReturnValue({
    client: { rpc },
    identity: { data: { id: "owner", email: "owner@example.invalid" }, isPending: false, error: null },
    projects: { data: [], isPending: false, error: null, refetch },
    details: { data: { applications: [], environments: [], scans: [], results: [] }, error: null, refetch },
    inbox: { data: { invitations: [], notices: [] }, error: null, refetch },
    active: "",
    mutation: { mutateAsync, isPending: false, error: null, reset },
    ...overrides,
  } as unknown as ReturnType<typeof useWorkspace>);
}
beforeEach(() => { vi.clearAllMocks(); setup(); });
afterEach(cleanup);

describe("Workspace user flow", () => {
  it("shows an empty state and creates a project without trusting an owner supplied by the browser", async () => {
    render(<Workspace />);
    expect(screen.getByText(/No projects yet/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("New project name"), { target: { value: "My capstone" } });
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("create_project", { p_name: "My capstone" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Saved.");
  });
  it("shows sign-in instead of editable forms when logged out", () => {
    setup({ identity: { isPending: false, error: new Error("Sign in to open your workspace.") } });
    render(<Workspace />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: "Create project" })).not.toBeInTheDocument();
  });
  it("offers an explicit retry when loading fails", () => {
    setup({ projects: { data: [], error: new Error("Connection unavailable"), refetch } });
    render(<Workspace />);
    expect(screen.getByRole("alert")).toHaveTextContent("Connection unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(2);
  });
});

describe("Workspace permissions and status", () => {
  it("only offers acceptance for the signed-in email", async () => {
    setup({ inbox: { data: { invitations: [
      { id: "mine", email: "owner@example.invalid", role: "member" },
      { id: "other", email: "other@example.invalid", role: "admin" },
    ], notices: [] }, refetch } });
    render(<Workspace />);
    expect(screen.getAllByRole("button", { name: "Accept invitation" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Accept invitation" }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("accept_invitation", { p_invitation_id: "mine" }));
  });
  it("disables writes while a save is pending", () => {
    setup({ mutation: { mutateAsync, isPending: true, error: null, reset } });
    render(<Workspace />);
    expect(screen.getByRole("button", { name: "Create project" })).toBeDisabled();
  });
  it("does not present queued requests as executed scans", () => {
    setup({ active: "project", projects: { data: [{ id: "project", name: "Project" }], refetch } });
    render(<Workspace />);
    expect(screen.getByText(/queued request does not mean a test has run/)).toBeInTheDocument();
    expect(screen.getByText("No results have been recorded.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save scan request" })).toBeDisabled();
  });
});
