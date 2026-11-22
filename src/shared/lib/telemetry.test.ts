import { describe, expect, it, vi, afterEach } from "vitest";
import { NO_RESPONSE_MESSAGE, safePath, sampleRate, scrubEvent, scrubStreamedSpan, traceTargets } from "./telemetry";
import { telemetryFetch } from "./telemetry-fetch";

// Only captureMessage is replaced; startSpan stays real so the span the
// request is traced on behaves as it does in the browser.
const mocks = vi.hoisted(() => ({ captureMessage: vi.fn() }));
vi.mock("@sentry/nextjs", async (importOriginal) => ({
  ...await importOriginal<typeof import("@sentry/nextjs")>(),
  captureMessage: mocks.captureMessage,
}));

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("telemetry boundaries", () => {
  it("only propagates to the exact configured API origin", () => {
    const target = traceTargets("https://api.example.com")[0]!;
    expect(target.test("https://api.example.com/auth/signup")).toBe(true);
    expect(target.test("https://api.example.com.attacker.test/auth")).toBe(false);
    expect(traceTargets("http://api.example.com")).toEqual([]);
    expect(traceTargets("https://name:secret@api.example.com")).toEqual([]);
    expect(traceTargets("http://localhost:8000")[0]!.test("http://localhost:8000/projects")).toBe(true);
  });
  it("validates cost sampling and fails closed for invalid rates", () => {
    expect(sampleRate(undefined)).toBe(0.1);
    expect(sampleRate("0")).toBe(0);
    expect(sampleRate("1")).toBe(1);
    expect(sampleRate("NaN")).toBe(0);
    expect(sampleRate("2")).toBe(0);
  });
  it("strips auth payloads, cookies, URLs, users and exception locals", () => {
    const event = scrubEvent({
      request: { url: "https://api.test/auth/callback/signup/secret?code=secret", data: "secret", headers: { Cookie: "secret" } },
      user: { email: "secret" }, extra: { password: "secret" }, breadcrumbs: [{ message: "secret" }],
      exception: { values: [{ type: "Error", value: "secret", stacktrace: { frames: [{ vars: { password: "secret" }, context_line: "secret", function: "signup", lineno: 4 }] } }] },
    });
    expect(JSON.stringify(event)).not.toContain("secret");
    expect(event.exception?.values?.[0]?.stacktrace?.frames?.[0]?.function).toBe("signup");
  });
  it("keeps trace linkage but strips SQL, URLs and arbitrary span data", () => {
    const span = scrubStreamedSpan({ trace_id: "trace", span_id: "span", parent_span_id: "parent", name: "secret", status: "error", is_segment: false, start_timestamp: 1, attributes: { "sentry.op": "http.client", "http.request.body": "secret", "url.full": "secret", "request_id": "request" } });
    expect(JSON.stringify(span)).not.toContain("secret");
    expect(span.parent_span_id).toBe("parent");
    expect(span.attributes.request_id).toBe("request");
  });
  it("keeps distinct static routes distinct and still redacts interpolated values", () => {
    expect(["/workspace", "/reset-password", "/forgot-password"].map(safePath))
      .toEqual(["/workspace", "/reset-password", "/forgot-password"]);
    expect(["/account/settings", "/dev/ui"].map(safePath)).toEqual(["/account/settings", "/dev/ui"]);
    expect(safePath("/projects/d7787aee-aef2-4d5d-b29c-96aafdf59e0d/setup")).toBe("/projects/{id}/setup");
    expect(safePath("/projects/[projectId]/runs/[runId]")).toBe("/projects/{id}/runs/{id}");
    expect(safePath("/invitations/42/accept")).toBe("/invitations/{id}/accept");
    expect(safePath("/u/person@example.test")).toBe("/u/{id}");
    expect(safePath("/auth/callback/signup/transaction")).toBe("/auth/callback/[redacted]");
  });
  it("preserves the HTTP verb on server transaction names", () => {
    expect(safePath("GET /projects/[projectId]/runs/[runId]")).toBe("GET /projects/{id}/runs/{id}");
    expect(safePath("POST /projects/[projectId]/imports")).toBe("POST /projects/{id}/imports");
  });
  it("names page views by route and keeps spans attached to their transaction", () => {
    const span = scrubStreamedSpan({ trace_id: "trace", span_id: "span", name: "/projects/d7787aee-aef2-4d5d-b29c-96aafdf59e0d", status: "ok", is_segment: true, start_timestamp: 1,
      attributes: { "sentry.op": "pageload", "sentry.segment.name": "/projects/d7787aee-aef2-4d5d-b29c-96aafdf59e0d", "sentry.segment.id": "segment", "sentry.trace_lifecycle": "stream" } });
    expect(span.name).toBe("pageload /projects/{id}");
    expect(span.attributes["sentry.segment.name"]).toBe("/projects/{id}");
    expect(span.attributes["sentry.segment.id"]).toBe("segment");
    expect(span.attributes["sentry.trace_lifecycle"]).toBe("stream");
  });
  it("still discards span names that are not routes", () => {
    const span = scrubStreamedSpan({ trace_id: "trace", span_id: "span", name: "SELECT secret FROM users", status: "ok", is_segment: false, start_timestamp: 1,
      attributes: { "sentry.op": "db.query" } });
    expect(span.name).toBe("db.query");
    expect(JSON.stringify(span)).not.toContain("secret");
  });
  it("does not raise an issue when a request is cancelled or times out", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    for (const name of ["AbortError", "TimeoutError"]) {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("stop", name)));
      await expect(telemetryFetch("https://api.example.com/projects", {})).rejects.toMatchObject({ name });
    }
    expect(mocks.captureMessage).not.toHaveBeenCalled();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(telemetryFetch("https://api.example.com/projects", {})).rejects.toBeInstanceOf(TypeError);
    expect(mocks.captureMessage).toHaveBeenCalledOnce();
  });
  it("keeps the messages this app authors and replaces every other one", () => {
    expect(scrubEvent({ message: NO_RESPONSE_MESSAGE }).message).toBe(NO_RESPONSE_MESSAGE);
    expect(scrubEvent({ message: "Password secret rejected for user@example.test" }).message)
      .toBe("Application error (details withheld; inspect stack and request ID).");
  });
  it("still correlates requests where randomUUID is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    // An insecure context (plain-http LAN dev host): getRandomValues, no randomUUID.
    vi.stubGlobal("crypto", { getRandomValues: (bytes: Uint8Array) => bytes.fill(7) });
    const fetcher = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetcher);
    await telemetryFetch("https://api.example.com/projects", {});
    const sent = new Headers((fetcher.mock.calls[0]![1] as RequestInit).headers).get("X-Request-ID");
    expect(sent).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it("correlates API calls while preserving CSRF, cookies and cancellation", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetcher);
    const controller = new AbortController();
    await telemetryFetch("https://api.example.com/auth/signup", { method: "POST", credentials: "include", signal: controller.signal, headers: { "X-CSRF-Protection": "1" } });
    const init = fetcher.mock.calls[0]![1] as RequestInit;
    expect(new Headers(init.headers).get("X-Request-ID")).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Headers(init.headers).get("X-CSRF-Protection")).toBe("1");
    expect(init.credentials).toBe("include");
    expect(init.signal).toBe(controller.signal);
    await telemetryFetch("https://untrusted.example.com", {});
    expect(fetcher.mock.calls[1]![1]).toEqual({});
  });
});
