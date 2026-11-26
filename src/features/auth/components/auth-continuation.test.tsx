import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "./SignupForm";
import { LoginForm } from "./LoginForm";
import LoginPage from "@/app/(auth)/login/page";
import { WorkspaceApiError } from "@/features/workspace";
const mocks = vi.hoisted(() => ({ signUp: vi.fn(), signIn: vi.fn(), getUser: vi.fn(), replace: vi.fn(), refresh: vi.fn(), projects: vi.fn() }));
vi.mock("../services/auth-service", () => ({ authService: { signUp: mocks.signUp, signIn: mocks.signIn, getUser: mocks.getUser } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));
vi.mock("@/features/workspace/workspace-api", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/features/workspace/workspace-api")>(),
  workspaceApi: { projects: mocks.projects },
}));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());
async function fillSignup() {
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.invalid" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPass1!" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "StrongPass1!" } });
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
}
function submitLogin() {
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.invalid" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Pass" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}
describe("auth continuation", () => {
  it("routes signup with an immediate session to onboarding", async () => {
    mocks.signUp.mockResolvedValue({ authenticated: true, confirmation_required: false, user: { id: "synthetic-user", email: "new@example.com" } });
    render(<SignupForm />); await fillSignup();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/onboarding"));
  });
  it("explains confirmation when signup has no session and does not start onboarding", async () => {
    mocks.signUp.mockResolvedValue({ authenticated: false, confirmation_required: true, user: null });
    render(<SignupForm />); await fillSignup();
    expect(await screen.findByRole("status")).toHaveTextContent(/If confirmation is still needed/);
    expect(mocks.replace).not.toHaveBeenCalled();
  });
  it("routes a returning user with existing projects to the dashboard", async () => {
    mocks.signIn.mockResolvedValue({ authenticated: true, confirmation_required: false, user: { id: "synthetic-user", email: "new@example.com" } });
    mocks.projects.mockResolvedValue([{ id: "p1" }]);
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: "Resend confirmation email" })).toHaveAttribute("href", "/resend-confirmation");
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.invalid" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Pass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
  });
  it("routes a first-time login with no projects yet to onboarding", async () => {
    mocks.signIn.mockResolvedValue({ authenticated: true, confirmation_required: false, user: { id: "synthetic-user", email: "new@example.com" } });
    mocks.projects.mockResolvedValue([]);
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.invalid" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Pass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/onboarding"));
  });
  it.each([
    [0, "Could not load your workspaces"],
    [401, "session could not be verified"],
    [403, "could not access its workspaces"],
    [503, "Could not load your workspaces"],
  ])("keeps workspace error %s separate from successful empty results", async (status, text) => {
    mocks.signIn.mockResolvedValue({ authenticated: true, user: { id: "user" } });
    mocks.projects.mockRejectedValueOnce(new WorkspaceApiError(status, undefined, "private provider detail"))
      .mockResolvedValueOnce([{ id: "project" }]);
    render(<LoginForm />);
    submitLogin();
    expect(await screen.findByRole("alert")).toHaveTextContent(text);
    expect(mocks.replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry workspace lookup" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.signIn).toHaveBeenCalledOnce();
  });
  it.each([
    ["expired", "has expired"],
    ["invalid", "could not be verified"],
    ["failed", "could not complete"],
  ])("shows privacy-safe feedback and recovery actions for %s", async (confirmation, text) => {
    mocks.getUser.mockResolvedValue(null);
    render(await LoginPage({ searchParams: Promise.resolve({ confirmation }) }));
    expect(screen.getByRole("alert")).toHaveTextContent(text);
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Resend confirmation email" })).toBeVisible();
  });
  it("shows confirmation feedback and offers continuation for an existing session", async () => {
    mocks.getUser.mockResolvedValue({ id: "user" });
    mocks.projects.mockResolvedValue([{ id: "project" }]);
    render(await LoginPage({ searchParams: Promise.resolve({ confirmation: "confirmed" }) }));
    const next = await screen.findByRole("button", { name: "Continue to workspace" });
    expect(screen.getByRole("status")).toHaveTextContent("Email confirmation completed");
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    fireEvent.click(next);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
});
