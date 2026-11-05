import { z } from "zod";
import type { LoginFormValues } from "../schemas";

const userSchema = z.object({ id: z.uuid(), email: z.email().nullable() });
const resultSchema = z.object({
  user: userSchema.nullable(),
  authenticated: z.boolean(),
  confirmation_required: z.boolean(),
});
export type BackendUser = z.infer<typeof userSchema>;

export class AuthRequestError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "AuthRequestError";
  }
}

function baseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!value) throw new AuthRequestError(0, "The authentication backend URL is not configured.");
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost"))) {
    throw new AuthRequestError(0, "The authentication backend URL is invalid. Use localhost for development.");
  }
  return url.origin;
}

async function request(path: string, method: "GET" | "POST", body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}/auth/${path}`, {
      method,
      credentials: "include",
      cache: "no-store",
      ...(method === "POST" ? {
        headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" },
        body: JSON.stringify(body ?? {}),
      } : {}),
      // Bound a stalled request so it cannot hold the session lock indefinitely.
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (error instanceof AuthRequestError) throw error;
    throw new AuthRequestError(0, "Unable to reach the authentication service. Please try again.");
  }
  if (!response.ok) {
    const message = response.status === 401
      ? "Unable to sign in. Check your email, password, and email verification."
      : response.status === 429
        ? "Too many authentication attempts. Please try again later."
        : response.status === 403
          ? "Authentication request rejected. Check your frontend origin configuration."
          : "The authentication service could not complete this request. Please try again.";
    // Do not expose or log raw upstream error bodies.
    throw new AuthRequestError(response.status, message);
  }
  try {
    return await response.json() as unknown;
  } catch {
    throw new AuthRequestError(502, "Invalid authentication service response.");
  }
}

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new AuthRequestError(502, "Invalid authentication service response.");
  // Zod strips unknown properties; raw responses, sessions and tokens never escape.
  return result.data;
}

// Login, logout and identity/refresh share a lock, including across same-origin tabs.
// The fallback serializes this tab only; automatic refresh is disabled without
// Web Locks rather than risking cross-tab reuse of a rotating refresh token.
function hasWebLocks() {
  return typeof navigator !== "undefined" && Boolean(navigator.locks);
}

function unauthorized(error: unknown) {
  return error instanceof AuthRequestError && error.status === 401;
}

let queue: Promise<unknown> = Promise.resolve();
function withSessionLock<T>(action: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    if (hasWebLocks()) {
      return await navigator.locks.request("blindspot-backend-session", action);
    }
    return action();
  };
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

function announceSessionChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("blindspot:auth-changed"));
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("blindspot-auth");
    channel.postMessage("session-changed");
    channel.close();
  }
}

let lookup: Promise<BackendUser | null> | undefined;

export const backendAuth = {
  async signIn(credentials: LoginFormValues) {
    const result = await withSessionLock(async () => {
      const data = parse(resultSchema, await request("login", "POST", {
        email: credentials.email, password: credentials.password,
      }));
      if (!data.authenticated || !data.user || data.confirmation_required) {
        throw new AuthRequestError(401, "Unable to establish a session. Please try again.");
      }
      return data;
    });
    announceSessionChange();
    return result;
  },

  getUser(): Promise<BackendUser | null> {
    if (lookup) return lookup;
    lookup = withSessionLock(async () => {
      // Check inside the cross-tab lock: a previous tab may have refreshed already.
      try {
        return parse(userSchema, await request("me", "GET"));
      } catch (error) {
        if (!unauthorized(error)) throw error;
      }
      if (!hasWebLocks()) return null;
      try {
        const result = parse(resultSchema, await request("refresh", "POST"));
        if (!result.authenticated || !result.user) return null;
        // One retry only; never recursively call getUser after refresh.
        return parse(userSchema, await request("me", "GET"));
      } catch (error) {
        if (unauthorized(error)) return null;
        throw error;
      }
    }).finally(() => { lookup = undefined; });
    return lookup;
  },

  async signOut() {
    try {
      await withSessionLock(async () => {
        parse(z.object({ message: z.string() }), await request("logout", "POST"));
      });
    } finally {
      // Backend clears local cookies even if remote revocation reports an outage.
      announceSessionChange();
    }
  },
};
