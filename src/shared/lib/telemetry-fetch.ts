import * as Sentry from "@sentry/nextjs";
import { safePath, traceTargets } from "./telemetry";

// Existing API clients keep their session, CSRF, validation and timeout policies.
export function telemetryFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const trusted = traceTargets(process.env.NEXT_PUBLIC_API_BASE_URL).some((target) => target.test(url));
  if (!trusted) return fetch(url, init);
  const headers = new Headers(init.headers);
  const requestId = crypto.randomUUID();
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
      span.setStatus({ code: 2, message: "network_or_timeout" });
      // Avoid capturing browser error objects that may embed sensitive URLs.
      Sentry.withScope((scope) => {
        scope.setTag("request_id", requestId);
        Sentry.captureMessage("API request received no response", "warning");
      });
      throw error;
    }
  });
}
