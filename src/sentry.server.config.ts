import * as Sentry from "@sentry/nextjs";
import { sampleRate, scrubEvent, scrubStreamedSpan, traceTargets } from "./shared/lib/telemetry";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.SENTRY_ENVIRONMENT ?? "development",
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: sampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
  tracePropagationTargets: traceTargets(process.env.NEXT_PUBLIC_API_BASE_URL),
  dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
  beforeSend: scrubEvent,
  beforeSendSpan: scrubStreamedSpan,
});
