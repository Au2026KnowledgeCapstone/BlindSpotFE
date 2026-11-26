import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), replace: vi.fn(), refresh: vi.fn() }));
const router = { replace: mocks.replace, refresh: mocks.refresh };
vi.mock("@/lib/supabase/client", () => ({ createClient: mocks.createClient }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
const USER = { id: "11111111-1111-4111-8111-111111111111", email: "test@example.com" };
const credentials = { email: USER.email, password: "Synthetic-pass-1!" };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;
const originalLocks = Object.getOwnPropertyDescriptor(navigator, "locks");

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000");
  vi.stubGlobal("BroadcastChannel", undefined);
  fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(navigator, "locks", { configurable: true,
    value: { request: (_name: string, action: () => Promise<unknown>) => action() } });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  if (originalLocks) Object.defineProperty(navigator, "locks", originalLocks);
  else Reflect.deleteProperty(navigator, "locks");
});

function submitSignup() {
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: USER.email } });
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: credentials.password } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: credentials.password } });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
}

describe("email verification and signup form", () => {
  it("checks server-issued recovery permission without accepting a normal login or frontend flag", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json(USER));
    const { backendAuth } = await import("./backend-auth");
    expect(await backendAuth.getRecoveryUser()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await backendAuth.getRecoveryUser()).toEqual(USER);
    expect(fetchMock).toHaveBeenLastCalledWith("http://localhost:8000/auth/recovery", expect.objectContaining({
      credentials: "include", method: "GET", cache: "no-store",
    }));
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("never upgrades an expired recovery grant through ordinary session refresh", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401));
    const { backendAuth } = await import("./backend-auth");
    expect(await backendAuth.getRecoveryUser()).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => String(url).split("/auth/")[1])).toEqual(["recovery"]);
  });

  it("shows confirmation-required signup without assuming a session", async () => {
    fetchMock.mockResolvedValue(json({ user: null, authenticated: false, confirmation_required: true }));
    const { SignupForm } = await import("../components/SignupForm");
    render(<SignupForm />);
    submitSignup();
    expect(await screen.findByRole("status")).toHaveTextContent(/If confirmation is still needed/);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: "Resend confirmation email" })).toHaveAttribute("href", "/resend-confirmation");
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it.each([
    [400, /Check your email address and password requirements/],
    [422, /Check your email address and password requirements/],
    [403, /frontend origin configuration/],
    [429, /Too many authentication attempts/],
    [503, /authentication service is unavailable/],
    [0, /Unable to reach the authentication service/],
  ])("shows safe actionable signup feedback for status %s", async (status, message) => {
    if (status) fetchMock.mockResolvedValue(json({ error: { message: "Private provider detail" } }, status));
    else fetchMock.mockRejectedValue(new TypeError("Private transport detail"));
    const { SignupForm } = await import("../components/SignupForm");
    render(<SignupForm />);
    submitSignup();
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByText(/Private/)).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each([
    [null, true, false], [USER, true, true], [null, true, true],
    [USER, false, true], [USER, false, false], [null, false, false],
  ])("rejects inconsistent signup responses (%j, %s, %s)", async (user, authenticated, confirmation_required) => {
    fetchMock.mockResolvedValue(json({ user, authenticated, confirmation_required }));
    const { backendAuth } = await import("./backend-auth");
    await expect(backendAuth.signUp({ ...credentials, confirmPassword: credentials.password }))
      .rejects.toMatchObject({ status: 502, message: "Invalid authentication service response." });
  });

  it("resends from the confirmation form using cookies and displays only conditional copy", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 429))
      .mockResolvedValueOnce(json({ message: "Provider message is not used as UI copy" }));
    const { default: ResendConfirmationPage } = await import("@/app/(auth)/resend-confirmation/page");
    render(<ResendConfirmationPage />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: USER.email } });
    const submit = screen.getByRole("button", { name: "Resend confirmation email" });
    fireEvent.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent(/Too many authentication attempts/);
    fireEvent.click(submit);
    expect(await screen.findByRole("status")).toHaveTextContent(/If confirmation is still needed/);
    expect(fetchMock).toHaveBeenLastCalledWith("http://localhost:8000/auth/confirmation/resend", expect.objectContaining({
      credentials: "include", method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" },
      body: JSON.stringify({ email: USER.email }),
    }));
  });
});

describe("recovery page integration", () => {
  it("shows actionable request throttling and conditional reset email feedback", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: { message: "private diagnostic" } }, 429))
      .mockResolvedValueOnce(json({ message: "receipt" }));
    const { default: ForgotPasswordPage } = await import("@/app/(auth)/forgot-password/page");
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: USER.email } });
    const submit = screen.getByRole("button", { name: "Send Reset Link" });
    fireEvent.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many authentication attempts");
    expect(screen.queryByText(/private diagnostic/)).not.toBeInTheDocument();
    fireEvent.click(submit);
    expect(await screen.findByRole("status")).toHaveTextContent("If this address is eligible for password reset");
  });

  it("loads recovery identity and updates the password through cookies, then clears the form", async () => {
    window.history.replaceState({}, "", "/reset-password");
    fetchMock.mockResolvedValueOnce(json(USER))
      .mockResolvedValueOnce(json({ message: "Password updated. Sign in again." }));
    const { default: ResetPasswordPage } = await import("@/app/(auth)/reset-password/page");
    render(<ResetPasswordPage />);
    const password = await screen.findByLabelText("New password");
    fireEvent.change(password, { target: { value: "Synthetic-new-pass-2!" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Synthetic-new-pass-2!" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Password updated. Sign in again.");
    expect(fetchMock.mock.calls[1]?.[1]?.body).toBe(JSON.stringify({ password: "Synthetic-new-pass-2!", user_id: USER.id }));
    expect(fetchMock.mock.calls.map(([url]) => String(url).split("/auth/")[1])).toEqual(["recovery", "password/update"]);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("closes an expired reset form and offers a fresh link", async () => {
    window.history.replaceState({}, "", "/reset-password");
    fetchMock.mockResolvedValueOnce(json(USER)).mockResolvedValueOnce(json({}, 401));
    const { default: ResetPasswordPage } = await import("@/app/(auth)/reset-password/page");
    render(<ResetPasswordPage />);
    fireEvent.change(await screen.findByLabelText("New password"), { target: { value: "Synthetic-new-pass-2!" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Synthetic-new-pass-2!" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid or expired");
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request another reset link" })).toHaveAttribute("href", "/forgot-password");
  });

  it("lets verification retry after a temporary failure", async () => {
    window.history.replaceState({}, "", "/reset-password");
    fetchMock.mockResolvedValueOnce(json({}, 503)).mockResolvedValueOnce(json(USER));
    const { default: ResetPasswordPage } = await import("@/app/(auth)/reset-password/page");
    render(<ResetPasswordPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to verify your reset link");
    fireEvent.click(screen.getByRole("button", { name: "Retry verification" }));
    expect(await screen.findByLabelText("New password")).toBeVisible();
  });

  it("does not expose an earlier recovery grant when the latest callback failed", async () => {
    window.history.replaceState({}, "", "/reset-password?recovery=failed");
    const { default: ResetPasswordPage } = await import("@/app/(auth)/reset-password/page");
    render(<ResetPasswordPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("could not complete this reset link");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not expose the password form without a valid backend session", async () => {
    window.history.replaceState({}, "", "/reset-password");
    fetchMock.mockResolvedValue(json({}, 401));
    const { default: ResetPasswordPage } = await import("@/app/(auth)/reset-password/page");
    render(<ResetPasswordPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid or expired reset link");
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

});
