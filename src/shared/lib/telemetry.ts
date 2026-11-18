import type { Event, SpanJSON, StreamedSpanJSON } from "@sentry/core";

// eslint-disable-next-line complexity -- Reject every unsafe origin component before header propagation.
export function traceTargets(value: string | undefined): RegExp[] {
  try {
    const url = new URL(value ?? "");
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return [];
    if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) return [];
    return [new RegExp(`^${url.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:/|$)`)];
  } catch { return []; }
}

export function sampleRate(value: string | undefined): number {
  if (!value?.trim()) return 0.1;
  const rate = Number(value);
  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : 0;
}

export function safePath(value: string): string {
  try {
    const url = new URL(value, "https://redacted.invalid");
    if (url.pathname.includes("/auth/callback/")) return "/auth/callback/[redacted]";
    if (url.pathname.includes("/downloads/")) return "/downloads/[redacted]";
    const fixed = new Set("auth signup login logout me refresh recovery password reset-request update callback projects environments applications members invitations notifications onboarding requirements runs results events cancel verify capabilities downloads dashboard token user rest v1".split(" "));
    return url.pathname.split("/").map((part) => !part || fixed.has(part) ? part : "{id}").join("/");
  } catch { return "/[redacted]"; }
}

export function scrubSpan(span: SpanJSON): SpanJSON {
  span.description = span.op ?? "operation";
  const data = span.data ?? {};
  span.data = Object.fromEntries(Object.entries(data).filter(([key]) =>
    ["http.request.method", "http.response.status_code", "http.route", "request_id"].includes(key)));
  return span;
}

// eslint-disable-next-line complexity -- Explicit allowlisting at the outbound telemetry boundary.
export function scrubEvent<T extends Event>(event: T): T {
  event.server_name = "blindspot-web";
  delete event.user; delete event.extra; delete event.breadcrumbs; delete event.logentry;
  event.tags = Object.fromEntries(Object.entries(event.tags ?? {}).filter(([key]) => key === "request_id"));
  if (event.request) event.request = { ...(event.request.method ? { method: event.request.method } : {}), url: safePath(event.request.url ?? "/") };
  const trace = event.contexts?.trace;
  event.contexts = trace ? { trace: { trace_id: trace.trace_id, span_id: trace.span_id, ...(trace.parent_span_id ? { parent_span_id: trace.parent_span_id } : {}) } } : {};
  if (event.message) event.message = "Application error (details withheld; inspect stack and request ID).";
  event.exception?.values?.forEach((exception) => {
    exception.value = "[redacted]";
    exception.stacktrace?.frames?.forEach((frame) => {
      delete frame.vars; delete frame.pre_context; delete frame.post_context; delete frame.context_line;
      if (frame.filename) frame.filename = frame.filename.split(/[?#]/)[0] ?? "[redacted]";
    });
  });
  if (event.transaction) event.transaction = safePath(event.transaction);
  if ("spans" in event) event.spans?.forEach(scrubSpan);
  return event;
}

export function scrubStreamedSpan(span: StreamedSpanJSON): StreamedSpanJSON {
  const op = String(span.attributes["sentry.op"] ?? "operation");
  const route = typeof span.attributes["http.route"] === "string" ? safePath(span.attributes["http.route"]) : undefined;
  span.name = route ? `${op} ${route}` : op;
  span.attributes = Object.fromEntries(Object.entries(span.attributes).filter(([key]) => ["sentry.op", "sentry.origin", "sentry.kind", "http.request.method", "http.response.status_code", "http.route", "request_id"].includes(key)));
  if (route) span.attributes["http.route"] = route;
  delete span.links;
  return span;
}
