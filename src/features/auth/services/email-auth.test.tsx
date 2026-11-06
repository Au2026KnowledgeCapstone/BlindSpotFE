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

describe("email verification and signup form", () => {
  it("checks server-issued recovery permission without accepting a normal login or frontend flag", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 403)).mockResolvedValueOnce(json(USER));
    const { backendAuth } = await import("./backend-auth");
    expect(await backendAuth.getRecoveryUser()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await backendAuth.getRecoveryUser()).toEqual(USER);
    expect(fetchMock).toHaveBeenLastCalledWith("http://localhost:8000/auth/recovery", expect.objectContaining({
      credentials: "include", method: "GET", cache: "no-store",
    }));
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("bounds recovery-session refresh to one retry without exposing tokens", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json({ user: USER, authenticated: true, confirmation_required: false }))
      .mockResolvedValueOnce(json(USER));
    const { backendAuth } = await import("./backend-auth");
    expect(await backendAuth.getRecoveryUser()).toEqual(USER);
    expect(fetchMock.mock.calls.map(([url]) => String(url).split("/auth/")[1])).toEqual(["recovery", "refresh", "recovery"]);
    fetchMock.mockReset().mockResolvedValue(json({}, 401));
    expect(await backendAuth.getRecoveryUser()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows confirmation-required signup without assuming a session", async () => {
    fetchMock.mockResolvedValue(json({ user: null, authenticated: false, confirmation_required: true }));
    const { SignupForm } = await import("../components/SignupForm");
    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: USER.email } });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: credentials.password } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: credentials.password } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText(/Check your email to confirm/)).toBeVisible();
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});

describe("recovery page integration", () => {
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
    expect(fetchMock.mock.calls.map(([url]) => String(url).split("/auth/")[1])).toEqual(["recovery", "password/update"]);
    expect(mocks.createClient).not.toHaveBeenCalled();
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
