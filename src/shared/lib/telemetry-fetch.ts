import * as Sentry from "@sentry/nextjs";
import { NO_RESPONSE_MESSAGE, safePath, traceTargets } from "./telemetry";

// randomUUID needs a secure context, so it is absent on a plain-http dev host
// reached over the LAN -- where getRandomValues is still available. Correlation
// ids must never throw: that would fail the request this only means to trace.
function requestIdentifier(): string {
  const source = typeof crypto === "undefined" ? undefined : crypto;
  if (typeof source?.randomUUID === "function") return source.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof source?.getRandomValues === "function") source.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Existing API clients keep their session, CSRF, validation and timeout policies.
export function telemetryFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const trusted = traceTargets(process.env.NEXT_PUBLIC_API_BASE_URL).some((target) => target.test(url));
  if (!trusted) return fetch(url, init);
  const headers = new Headers(init.headers);
  const requestId = requestIdentifier();
  headers.set("X-Request-ID", requestId);
  return Sentry.startSpan({ op: "api.request", name: `${init.method ?? "GET"} ${safePath(url)}` }, async (span) => {
    span.setAttribute("request_id", requestId);
    span.setAttribute("http.route", safePath(url));
    try {
      const response = await fetch(url, { ...init, headers });
      span.setAttribute("http.response.status_code", response.status);
      if (!response.ok) span.setStatus({ code: 2, message: "request_failed" });
      return response;
    } catch (error) {
      // Unmount and React Query cancellation abort the caller's signal, and the
      // clients' own deadlines reject with TimeoutError. Neither is a fault, so
      // neither marks the span failed nor raises an issue.
      // Read name off the rejection directly: DOMException does not inherit
      // from Error in every runtime, so an instanceof check misses the abort.
      const name = (error as { name?: unknown } | null)?.name;
      if (name === "AbortError" || name === "TimeoutError") throw error;
      span.setStatus({ code: 2, message: "network_or_timeout" });
      // Avoid capturing browser error objects that may embed sensitive URLs.
      Sentry.withScope((scope) => {
        scope.setTag("request_id", requestId);
        Sentry.captureMessage(NO_RESPONSE_MESSAGE, "warning");
      });
      throw error;
    }
  });
}
