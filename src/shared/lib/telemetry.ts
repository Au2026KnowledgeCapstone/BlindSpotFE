import type { Event, StreamedSpanJSON } from "@sentry/core";

// eslint-disable-next-line complexity -- Reject every unsafe origin component before header propagation.
export function traceTargets(value: string | undefined): RegExp[] {
  try {
    const url = new URL(value ?? "");
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return [];
    if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) return [];
    return [new RegExp(`^${url.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:/|$)`)];
  } catch { return []; }
}

// Fixed strings this app authors itself. They hold no user or response data,
// and on a captureMessage event they are the only signal there is -- that call
// attaches no stack -- so replacing them wholesale leaves nothing but a
// request id. Anything not listed here may embed user or upstream text.
export const NO_RESPONSE_MESSAGE = "API request received no response";
const MESSAGES: ReadonlySet<string> = new Set([NO_RESPONSE_MESSAGE]);

export function sampleRate(value: string | undefined): number {
  if (!value?.trim()) return 0.1;
  const rate = Number(value);
  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : 0;
}

const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);

// Route templates are authored in this repo and carry nothing private, so
// identify the interpolated values instead of allowlisting the static words:
// an allowlist silently collapses every route it has not been told about.
const ID_SHAPED = [
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /^\d+$/,
  /^[0-9a-f]{16,}$/i,
  /^\[.+\]$/,
];

function redactSegment(part: string): string {
  if (!part) return part;
  // Anything long, non-ASCII-slug or address-shaped is treated as a value.
  if (part.length > 24 || part.includes("@") || !/^[A-Za-z0-9._-]+$/.test(part)) return "{id}";
  return ID_SHAPED.some((pattern) => pattern.test(part)) ? "{id}" : part;
}

export function safePath(value: string): string {
  // Server transaction names arrive as "GET /projects/[projectId]"; without
  // splitting the verb off it resolves as a path segment and gets rewritten.
  const [verb, ...rest] = value.split(" ");
  if (verb && rest.length && METHODS.has(verb)) return `${verb} ${safePath(rest.join(" "))}`;
  try {
    const url = new URL(value, "https://redacted.invalid");
    if (url.pathname.includes("/auth/callback/")) return "/auth/callback/[redacted]";
    if (url.pathname.includes("/downloads/")) return "/downloads/[redacted]";
    return url.pathname.split("/").map(redactSegment).join("/");
  } catch { return "/[redacted]"; }
}

// eslint-disable-next-line complexity -- Explicit allowlisting at the outbound telemetry boundary.
export function scrubEvent<T extends Event>(event: T): T {
  event.server_name = "blindspot-web";
  delete event.user; delete event.extra; delete event.breadcrumbs; delete event.logentry;
  event.tags = Object.fromEntries(Object.entries(event.tags ?? {}).filter(([key]) => key === "request_id"));
  if (event.request) event.request = { ...(event.request.method ? { method: event.request.method } : {}), url: safePath(event.request.url ?? "/") };
  const trace = event.contexts?.trace;
  event.contexts = trace ? { trace: { trace_id: trace.trace_id, span_id: trace.span_id, ...(trace.parent_span_id ? { parent_span_id: trace.parent_span_id } : {}) } } : {};
  if (event.message && !MESSAGES.has(event.message)) event.message = "Application error (details withheld; inspect stack and request ID).";
  event.exception?.values?.forEach((exception) => {
    exception.value = "[redacted]";
    exception.stacktrace?.frames?.forEach((frame) => {
      delete frame.vars; delete frame.pre_context; delete frame.post_context; delete frame.context_line;
      if (frame.filename) frame.filename = frame.filename.split(/[?#]/)[0] ?? "[redacted]";
    });
  });
  if (event.transaction) event.transaction = safePath(event.transaction);
  // No event.spans branch: every runtime here runs the default
  // traceLifecycle: "stream", where spans ship individually through
  // beforeSendSpan (scrubStreamedSpan) and never ride on a transaction event.
  return event;
}

// The SDK stamps these before beforeSendSpan and never restores them, so
// dropping the segment keys detaches every child span from its transaction.
const SPAN_ATTRIBUTES = ["sentry.op", "sentry.origin", "sentry.kind", "sentry.segment.name", "sentry.segment.id",
  "sentry.trace_lifecycle", "sentry.sdk.name", "sentry.sdk.version",
  "http.request.method", "http.response.status_code", "http.route", "request_id"];

// Only these carry the route in span.name; every other span name may hold a
// URL, SQL or user text and is still discarded in favour of the bare op.
const ROUTE_NAMED_OPS = new Set(["pageload", "navigation"]);

export function scrubStreamedSpan(span: StreamedSpanJSON): StreamedSpanJSON {
  const op = String(span.attributes["sentry.op"] ?? "operation");
  const declared = typeof span.attributes["http.route"] === "string" ? safePath(span.attributes["http.route"]) : undefined;
  const route = declared ?? (ROUTE_NAMED_OPS.has(op) ? safePath(span.name) : undefined);
  span.name = route ? `${op} ${route}` : op;
  span.attributes = Object.fromEntries(Object.entries(span.attributes).filter(([key]) => SPAN_ATTRIBUTES.includes(key)));
  if (declared) span.attributes["http.route"] = declared;
  const segment = span.attributes["sentry.segment.name"];
  if (typeof segment === "string") span.attributes["sentry.segment.name"] = safePath(segment);
  delete span.links;
  return span;
}
