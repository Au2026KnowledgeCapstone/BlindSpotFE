import * as Sentry from "@sentry/nextjs";
import { sampleRate, scrubEvent, scrubStreamedSpan, traceTargets } from "./shared/lib/telemetry";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "development",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  tracesSampleRate: sampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  tracePropagationTargets: traceTargets(process.env.NEXT_PUBLIC_API_BASE_URL),
  dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
  integrations: (defaults) => defaults.filter((integration) => !["Breadcrumbs", "Replay", "Feedback"].includes(integration.name)),
  beforeSend: scrubEvent,
  beforeSendSpan: scrubStreamedSpan,
});
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
