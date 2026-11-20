import { describe, expect, it, vi, afterEach } from "vitest";
import { sampleRate, scrubEvent, scrubStreamedSpan, traceTargets } from "./telemetry";
import { telemetryFetch } from "./telemetry-fetch";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
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
