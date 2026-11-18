# Sentry frontend tracing

The official Next.js SDK initializes in the browser, Node and Edge runtimes.
Global React/server errors are captured. Auth and workspace HTTP clients retain
their existing cookie, CSRF, validation and cancellation behavior and gain a UUID
`X-Request-ID` and a parent API span. The SDK supplies valid `sentry-trace` and
`baggage` headers **only** to the exact configured `NEXT_PUBLIC_API_BASE_URL`
origin. Lookalike hosts and unrelated destinations are excluded.

## Configuration

Organization: `blindspot-capstone`; frontend project: `javascript-nextjs`.
Actual DSNs are in an ignored `.env.sentry`, never committed. Load those settings
into the build/runtime environment, preserving existing application settings.

- `NEXT_PUBLIC_SENTRY_DSN`: browser DSN; blank disables browser export.
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`: staging/production; default development.
- `NEXT_PUBLIC_SENTRY_RELEASE`: immutable release/commit identifier.
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`: default 0.1; invalid values disable
  tracing. Set 1 only for controlled verification and rebuild afterward.
- `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`,
  `SENTRY_TRACES_SAMPLE_RATE`: corresponding server runtime settings.
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`: optional **CI-only**
  source-map upload configuration. The token must never be `NEXT_PUBLIC`.
  Without a token, uploads are disabled; basic events/tracing still work.

Public environment settings are embedded at **build time**. Changing deployment
variables requires rebuilding. A DSN is a public ingestion identifier, not an
administrative token; nevertheless keep local configuration outside Git.

## Privacy and debugging

No session replay/profiling is installed. User identity, cookies, HTTP headers,
bodies, URL queries, breadcrumbs, exception messages/locals and SQL text are
excluded from exported events/spans. Exception type and stack locations remain.
Span data uses an allowlist. Dynamic resource IDs are replaced in route metadata.
Keep the onboarding idempotency key separate from correlation/trace IDs.

For a failed signup, inspect the request's `X-Request-ID` header and the API's
echoed response header. Search that ID in backend logs or Sentry event tags;
open the connected trace to see browser/API/outbound request timing and status.
Expected auth failures have failed HTTP spans, not raw credential-bearing errors.

## Validation

`src/shared/lib/telemetry.test.ts` covers trusted-origin propagation boundaries,
sampling, payload/exception scrubbing, trace linkage and preservation of
CSRF/cookies/cancellation. Existing auth/workspace regressions also run.
Live verification should use synthetic staging inputs. No real account/password
or production data is needed. No permanent debug/crash route is added.

Official references:
- https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- https://docs.sentry.io/concepts/key-terms/tracing/distributed-tracing/
