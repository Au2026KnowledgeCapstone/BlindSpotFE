import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(), refresh: vi.fn(),
  signup: vi.fn(), recovery: vi.fn(), update: vi.fn(), createClient: vi.fn(),
}));
const router = { replace: mocks.replace, refresh: mocks.refresh };
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/projects/acme-corp" }));
vi.mock("@/lib/supabase/client", () => ({ createClient: mocks.createClient }));

const USER = { id: "11111111-1111-4111-8111-111111111111", email: "test@example.com" };
const RESULT = { user: USER, authenticated: true, confirmation_required: false };
const credentials = { email: USER.email, password: "Synthetic-pass-1!" };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;
const originalLocks = Object.getOwnPropertyDescriptor(navigator, "locks");

// A shared lock manager also lets independent module instances model separate tabs.
function installLocks() {
  let queue: Promise<unknown> = Promise.resolve();
  Object.defineProperty(navigator, "locks", { configurable: true, value: {
    request: (_name: string, action: () => Promise<unknown>) => {
      const result = queue.then(action);
      queue = result.catch(() => undefined);
      return result;
    },
  } });
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000");
  vi.stubGlobal("BroadcastChannel", undefined);
  fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
  installLocks();
  mocks.createClient.mockReturnValue({ auth: {
    signUp: mocks.signup, resetPasswordForEmail: mocks.recovery, updateUser: mocks.update,
  } });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  if (originalLocks) Object.defineProperty(navigator, "locks", originalLocks);
  else Reflect.deleteProperty(navigator, "locks");
});

describe("backend cookie auth integration", () => {
  it("logs in using cookies and exact CSRF protocol, strips tokens/unknown fields", async () => {
    fetchMock.mockResolvedValue(json({ ...RESULT, access_token: "must-not-escape", session: { refresh_token: "private" } }));
    const { authService } = await import("./auth-service");
    const result = await authService.signIn(credentials);
    expect(result).toEqual(RESULT);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/auth/login", expect.objectContaining({
      method: "POST", credentials: "include", cache: "no-store",
      headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" },
      body: JSON.stringify(credentials),
    }));
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("token");
    expect(localStorage.length).toBe(0);
  });

  it("does not refresh rejected login or expose raw error detail", async () => {
    fetchMock.mockResolvedValue(json({ detail: "private upstream info" }, 401));
    const { backendAuth } = await import("./backend-auth");
    await expect(backendAuth.signIn(credentials)).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("checks identity again after page reload instead of trusting in-memory identity", async () => {
    fetchMock.mockImplementation(async () => json(USER));
    let { backendAuth } = await import("./backend-auth");
    expect(await backendAuth.getUser()).toEqual(USER);
    vi.resetModules();
    ({ backendAuth } = await import("./backend-auth"));
    expect(await backendAuth.getUser()).toEqual(USER);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith("http://localhost:8000/auth/me", expect.objectContaining({
      method: "GET", credentials: "include", cache: "no-store",
    }));
  });

  it("shares concurrent identity requests and rotates once before a single me retry", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json(RESULT)).mockResolvedValueOnce(json(USER));
    const { backendAuth } = await import("./backend-auth");
    const results = await Promise.all([backendAuth.getUser(), backendAuth.getUser(), backendAuth.getUser()]);
    expect(results).toEqual([USER, USER, USER]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:8000/auth/me", "http://localhost:8000/auth/refresh", "http://localhost:8000/auth/me",
    ]);
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      credentials: "include", method: "POST", body: "{}",
      headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" },
    });
  });

  it("serializes independent tabs and rechecks identity inside their shared lock", async () => {
    let refreshed = false;
    fetchMock.mockImplementation(async (url) => {
      if (String(url).endsWith("/refresh")) { refreshed = true; return json(RESULT); }
      return refreshed ? json(USER) : json({}, 401);
    });
    const tabA = (await import("./backend-auth")).backendAuth;
    vi.resetModules();
    const tabB = (await import("./backend-auth")).backendAuth;
    expect(await Promise.all([tabA.getUser(), tabB.getUser()])).toEqual([USER, USER]);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/refresh"))).toHaveLength(1);
  });

  it("does not loop when refresh fails or the retried me remains unauthorized", async () => {
    const { backendAuth } = await import("./backend-auth");
    fetchMock.mockImplementation(async () => json({}, 401));
    expect(await backendAuth.getUser()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockReset();
    fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json(RESULT)).mockResolvedValueOnce(json({}, 401));
    expect(await backendAuth.getUser()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not turn outages into login redirects or refresh on non-401 responses", async () => {
    fetchMock.mockResolvedValue(json({}, 503));
    const { backendAuth } = await import("./backend-auth");
    await expect(backendAuth.getUser()).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails closed without Web Locks instead of racing cross-tab refresh", async () => {
    Object.defineProperty(navigator, "locks", { configurable: true, value: undefined });
    fetchMock.mockResolvedValue(json({}, 401));
    const { backendAuth } = await import("./backend-auth");
    expect(await backendAuth.getUser()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("queues logout behind refresh so an in-flight refresh cannot restore a logged-out session", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json(RESULT))
      .mockResolvedValueOnce(json(USER)).mockResolvedValueOnce(json({ message: "Signed out of this session" }));
    const { backendAuth } = await import("./backend-auth");
    await Promise.all([backendAuth.getUser(), backendAuth.signOut()]);
    expect(fetchMock.mock.calls.map(([url]) => String(url).split("/").at(-1))).toEqual(["me", "refresh", "me", "logout"]);
    expect(fetchMock.mock.calls[3]?.[1]).toMatchObject({ credentials: "include", method: "POST", body: "{}" });
  });

  it("rejects malformed sessions, network errors and missing API configuration safely", async () => {
    const { backendAuth } = await import("./backend-auth");
    fetchMock.mockResolvedValue(json({ session: { access_token: "private" } }));
    await expect(backendAuth.signIn(credentials)).rejects.toMatchObject({ status: 502 });
    fetchMock.mockRejectedValue(new TypeError("private connection detail"));
    await expect(backendAuth.signIn(credentials)).rejects.toThrow("Unable to reach");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    await expect(backendAuth.signIn(credentials)).rejects.toThrow("not configured");
  });

  it("preserves Supabase signup and recovery without passing backend tokens", async () => {
    mocks.signup.mockResolvedValue({ data: { session: null }, error: null });
    mocks.recovery.mockResolvedValue({ error: null });
    mocks.update.mockResolvedValue({ error: null });
    const { authService } = await import("./auth-service");
    expect(await authService.signUp({ ...credentials, confirmPassword: credentials.password })).toEqual({ session: null });
    await authService.requestPasswordReset(USER.email);
    await authService.updatePassword("Synthetic-new-pass-2!");
    expect(mocks.signup).toHaveBeenCalledWith(credentials);
    expect(mocks.recovery).toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("login, reload guard and logout UI", () => {
  it("submits the unchanged form and navigates using authenticated/user without session JSON", async () => {
    fetchMock.mockResolvedValue(json(RESULT));
    const { LoginForm } = await import("../components/LoginForm");
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: USER.email } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: credentials.password } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/projects/acme-corp"));
    expect(mocks.refresh).toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("renders an outage message without incorrectly blaming the password", async () => {
    fetchMock.mockResolvedValue(json({}, 503));
    const { LoginForm } = await import("../components/LoginForm");
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: USER.email } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: credentials.password } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("authentication service");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("checks backend identity before showing application content after a reload", async () => {
    fetchMock.mockResolvedValue(json(USER));
    const { RequireSession } = await import("../components/RequireSession");
    render(<RequireSession><div>Authenticated content</div></RequireSession>);
    expect(screen.queryByText("Authenticated content")).not.toBeInTheDocument();
    expect(await screen.findByText("Authenticated content")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("redirects an expired session and does not mount application children", async () => {
    fetchMock.mockImplementation(async () => json({}, 401));
    const { RequireSession } = await import("../components/RequireSession");
    render(<RequireSession><div>Authenticated content</div></RequireSession>);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("Authenticated content")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retains a verification error during outages instead of redirecting to login", async () => {
    fetchMock.mockResolvedValue(json({}, 503));
    const { RequireSession } = await import("../components/RequireSession");
    render(<RequireSession><div>Authenticated content</div></RequireSession>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to verify");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("logs out using backend cookies and returns to the existing login URL", async () => {
    fetchMock.mockResolvedValue(json({ message: "Signed out of this session" }));
    const { LogoutButton } = await import("../components/logout-button");
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/auth/logout", expect.objectContaining({
      credentials: "include", method: "POST", body: "{}",
      headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" },
    }));
  });
});
