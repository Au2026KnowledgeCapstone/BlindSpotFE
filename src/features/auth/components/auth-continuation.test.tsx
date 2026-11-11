import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "./SignupForm";
import { LoginForm } from "./LoginForm";
const mocks = vi.hoisted(() => ({ signUp: vi.fn(), signIn: vi.fn(), replace: vi.fn(), refresh: vi.fn(), projects: vi.fn() }));
vi.mock("../services/auth-service", () => ({ authService: { signUp: mocks.signUp, signIn: mocks.signIn } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));
vi.mock("@/features/workspace/workspace-api", () => ({ workspaceApi: { projects: mocks.projects } }));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());
async function fillSignup() {
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.invalid" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPass1!" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "StrongPass1!" } });
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
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
    expect(await screen.findByText(/Check your email to confirm/)).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
  it("routes a returning user with existing projects to the projects directory", async () => {
    mocks.signIn.mockResolvedValue({ authenticated: true, confirmation_required: false, user: { id: "synthetic-user", email: "new@example.com" } });
    mocks.projects.mockResolvedValue([{ id: "p1" }]);
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.invalid" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Pass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/projects"));
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
});
