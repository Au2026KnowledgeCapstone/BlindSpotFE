# Frontend backend integration audit

Reviewed the application source on 2026-10-22. Endpoint paths below are **proposals**, not verified backend routes. This audit describes the current UI; it does not implement calls or assume a backend exists.

## Scope updates

Include a notification queue after test execution, AI-service cost persistence and reporting through BE to the FE dashboard, the latest five persisted numbered runs, the Project → Environment → Run details database hierarchy, and creation of new environments.

**Out of scope:** heals (queue and accept/reject integration) and the “New flow” action on the Flows page, including its save and plan-generation backend work. Existing flow listing/detail remain in scope. Existing heal-related enums below describe current contracts only; they do not add heals to scope.

## Current state

- Authentication already uses Supabase for sign-in, sign-up, sign-out, password recovery and password updates (`src/features/auth/services/auth-service.ts`).
- Application queries read fixtures, flow saves and heal decisions only update the React Query cache, environments are constants, and live events are replayed locally.
- Existing Zod schemas and mappers are the natural integration boundary. Most top-level response fields use snake_case; nested flow steps/settings currently use camelCase. Agree on that contract explicitly.
- No application API route handlers or middleware/proxy files were found in `src`. The app layout does not currently check authentication or project membership.

## Calls needed by screen/action

All `/projects/:projectId/...` paths below are relative to the chosen API base URL. Run resources belong under `/projects/:projectId/environments/:environmentId/runs`; abbreviated project/run paths for existing action proposals must follow that same environment scope when implemented.

| UI / integration point | Current implementation | Proposed call | Required data / result |
| --- | --- | --- | --- |
| Project selector and post-login destination | `src/shared/ui/app-shell.tsx`, `src/features/auth/components/LoginForm.tsx`: one hardcoded Acme project and login redirect | `GET /projects`; optionally `GET /projects/:projectId` | Accessible project IDs and display names; selected/default project. Project selection must navigate to that project's route. |
| Environment selector and environment cards | `src/shared/ui/app-shell.tsx`, `src/features/environments/components/EnvironmentCards.tsx`: hardcoded options/cards; selector does not update queries | `GET /projects/:projectId/environments` | Stable ID, environment kind, display name, note, destructive-run policy, preview PR metadata. Backend execution also needs base URL/configuration. Pass selected environment into relevant queries and query keys. |
| Create environment | No creation form or mutation currently exists | `POST /projects/:projectId/environments` | Send name, kind, base URL, optional note and credential reference, and applicable execution policy; return persisted environment with server-generated ID and project ID. Refresh environment cards/selector and allow selecting the result. |
| Notifications after a test run | No notification queue UI or API hook currently exists | `GET /projects/:projectId/notifications?environment_id=...&limit=...&cursor=...`; `PATCH /projects/:projectId/notifications/:notificationId` | Persisted completion/failure notifications, run ID/number, environment ID, message, created timestamp and read state; PATCH marks a notification read. Refresh or stream on run completion. |
| Flows list | `src/features/flows/api/use-flows.ts`: `fixtureSeedFlows` | `GET /projects/:projectId/flows` | Flow records, configured steps/settings, last run status/time and recent run history for stability strips. |
| Flow detail | `src/app/(app)/projects/[projectId]/flows/[flowId]/flow-detail-content.tsx`: loads hardcoded `run-4821` | `GET /projects/:projectId/flows/:flowId` | Actual flow name, goal, configured steps and settings. Configured steps are different from execution step runs. If execution action counts remain in this view, fetch a specific/latest run separately. |
| Runs list | `src/features/runs/api/use-runs.ts`: `fixtureSeedRuns` | `GET /projects/:projectId/environments/:environmentId/runs?limit=5` | Latest five persisted run summaries, newest first, each with stable run ID and stored run number; cursor pagination for older runs if needed, plus optional status/trigger/flow/date filters. The current runs table has no filter controls; a filter helper exists separately. |
| Overview | `src/app/(app)/projects/[projectId]/overview-content.tsx`, `src/features/overview/*`: shares `useRuns` | `GET /projects/:projectId/overview?environment_id=...` | Aggregate counts, pass rate, weekly cost, daily trend points, active regressions and recent runs. Return the latest five runs for dashboard display; compute reporting-period aggregates separately from those five records. AI costs must come from persisted AI-service usage reported to BE. |
| Run detail, steps and actions | `src/features/runs/api/use-run-detail.ts`: fabricates a run for any ID and attaches fixed steps/failure | `GET /projects/:projectId/environments/:environmentId/runs/:runId` | Run summary plus ordered executed steps/actions, optional failure and actual regression comparison. Can be one composite response or related endpoints. |
| Screenshots, console/network evidence | Same detail hook generates SVG screenshots and log entries | Included in detail or `GET .../runs/:runId/artifacts` and `GET .../runs/:runId/steps/:stepRunId/logs` | Artifact metadata/URLs, before/after/action screenshot associations, click coordinates and structured logs. Load large logs on demand. |
| Live execution | `src/features/runs/api/use-live-run-events.ts`, `live-run-emitter.ts`: local timed fixture replay | SSE `GET /projects/:projectId/runs/:runId/events` | Ordered run/step/action/screenshot/analysis events; resume cursor/event ID, reconnect behavior and terminal state. Refresh detail/list/overview caches as execution changes. |
| Re-run button | `src/app/(app)/projects/[projectId]/runs/[runId]/run-header.tsx`: alert only | `POST /projects/:projectId/runs/:runId/rerun` | Source run identifies flow/environment/configuration; return new run ID and queued/running status, then navigate to it. Define whether reruns use the original flow revision or latest configuration. |
| Download trace | Same header: alert only | `GET /projects/:projectId/runs/:runId/trace` | Trace archive bytes or authorized download URL, filename and content type; distinguish unavailable/pending trace. |
| Discussion tab | `src/app/(app)/projects/[projectId]/runs/[runId]/discussion-tab.tsx`: seeded strings and local state | `GET /projects/:projectId/runs/:runId/comments`; `POST` to same path | Comment ID, body, author ID/display name, created timestamp; POST body contains comment text. Pass run identity into the tab; derive author from authenticated session. |

## Existing response contracts

These names match current schemas, rather than an assumed database schema. See `src/features/{flows,runs,heals}/api/*.schema.ts` for exact enums and optionality.

### Flow

`id`, `project_id`, `name`, `description`, `goal`, `status`, `feature_area`, `steps`, `settings`, `history`, `last_status`, `last_run_at`.

- Step: `id`, `title`, `expectedOutcome`, `order`, `type` (`action | inference | check`).
- Settings: `environment`, `schedule`, optional `credentialsReference`.
- History entry: run `id`, `status`, optional `label`.
- New flows have no previous run: support null/absent last-run values instead of requiring fabricated timestamps/statuses.
- Credentials are references only. The UI does not need raw secret values.
- Schedule options are `now | weekly | on_pr | manual`; weekly timing/timezone and repository/PR configuration are not represented in the current form.

### Run summary

`id`, `run_number`, `project_id`, `flow_id`, `flow_name`, `environment`, `status`, `branch`, `commit_sha`, `trigger`, `started_at`, `duration_seconds`, `action_count`, `estimated_cost_usd`, `execution_mode`, optional `failure_id`, optional `pr_number`.

- Status: `passed | passed_healed | failed | regression | agent_error | running | queued | cancelled`.
- Environment: `production | staging | pr_preview | development`.
- Execution mode: `replay | agentic`.
- Agree on nullability for queued runs that have not started and unfinished durations/costs. The current schema requires concrete values.

### Execution detail and evidence

- Step run: `id`, `run_id`, `step_number`, `title`, `status`, `duration_ms`, `actions`.
- Action: `id`, `step_run_id`, `timestamp`, `badge_type`, `description`, optional `target`, `reasoning`, `result_text`, `result_status`.
- Failure: `id`, `run_id`, `step_number`, `expected`, `observed`, `category`, `likely_cause`, `suggested_next_steps`, `linked_evidence`.
- Artifact: `id`, `run_id`, optional `step_run_id`, `type`, `url`, optional `mime_type`, `created_at`, optional `metadata`.
- Console entry required by UI: `id`, `timestamp`, `level`, `message`.
- Network entry required by UI: `id`, `timestamp`, `method`, `url`, `status`, `durationMs`.

**Contract gaps:** screenshot URLs, before/after screenshots, console/network logs exist in domain types but are injected after parsing rather than represented in the step response schema. Action screenshot URL/click point also exist in domain types but not the action schema. Add explicit schemas/mapping or use associated artifact responses. Include action/step IDs in evidence associations so deep links resolve deterministically. Consider nullable network status for requests that fail without an HTTP response.

Failure comparison must return actual `last_passing_run` and `first_failing_run` identities/numbers. `run-detail-content.tsx` currently guesses these as current run number minus one and current run number; consecutive run numbers do not establish a regression boundary.

`AiAnalysisTab` hardcodes certainty to `high`; return an actual certainty value if the product displays it. `linked_evidence` currently contains strings displayed as labels; actionable evidence needs artifact/action IDs or URLs as well.

### Live events

Existing schema: `event_type`, `run_id`, `emitted_at`, `offset_ms`, optional `step_number`, `step_title`, `action_id`, `action_description`, `artifact_url`, `run_status`.

Event types: `run.started`, `step.started`, `action.executed`, `screenshot.created`, `step.passed`, `step.failed`, `analysis.started`, `analysis.finished`, `run.completed`.

The current view derives current step and analysis state from events, but renders header status, steps/actions, screenshots and failure from the detail query. Replacing the emitter alone will not make all evidence live: update/refetch those cached records too. Subscribe only while appropriate for the run state, reconcile on reconnect/completion, and deduplicate resumed events. The existing schema lacks a unique event ID/resume sequence.

## Required database hierarchy and run numbering

Model the ownership chain as **Project → Environment → Run → execution details**. This is a proposed DB contract; no backend schema was inspected or changed in this frontend audit.

| Entity | Required relationship / data |
| --- | --- |
| Project | Stable project ID and user/team access. |
| Environment | Stable environment ID, required `project_id` foreign key, name, kind, base URL, configuration and execution policy. Multiple environments of the same kind must be supported. |
| Run | Stable run ID, required `environment_id` foreign key, flow reference, persisted `run_number`, creation/start/completion timestamps, status and cost summary. Resolve project ownership through the environment; validate consistency if `project_id` is also stored. |
| Run details | Step runs, actions, failures, artifacts, comments and AI usage records reference their parent run. |
| Notification | References its run and intended recipient; store read state per recipient. Project/environment context is resolved from the run. |

The current environment enum is a **kind**, not an environment identity. Add `environment_id` to run/flow execution contracts and scope navigation, requests and cache keys by project/environment. Update the FE route structure to `/projects/[projectId]/environments/[environmentId]/runs/[runId]` when implementing this hierarchy. Check that each environment belongs to the selected project and each run belongs to that environment.

Assign run numbers on BE when persisting runs, including reruns. Recommended default: increment within each project, with a database uniqueness constraint on `(project_id, run_number)` and concurrency-safe allocation. This is a proposed numbering scope, since the requirement does not specify project-wide versus environment-wide numbering. Keep the immutable run ID as the API identity; never derive run numbers from array length or FE state.

Return the last five runs by creation time descending, with a deterministic ID tie-breaker, within the selected environment. Include queued/running runs so a new test appears immediately; fewer than five is valid. Store run records in the DB and render them on the dashboard; do not limit database retention to five records. Project-wide dashboard results, if offered, must retain each run's environment identity.

## AI costs: AI service → BE → FE

1. The AI service records usage/cost for each model operation and associates it with the backend run ID. Suggested fields: unique usage/event ID, run ID, operation, provider/model, input/output tokens, cost amount, currency, pricing version, timestamp and whether the cost is estimated or final.
2. The AI service saves that record durably and reports it to BE through an authenticated internal contract, for example `POST /internal/runs/:runId/ai-usage`. Delivery retries must be deduplicated by usage/event ID so costs are not counted twice.
3. BE persists the reported usage, totals costs per run and exposes the run cost and reporting-period dashboard totals. Do not rely on the browser or only the most recent five runs to calculate historical spend.
4. FE reads cost summaries from run/detail and overview responses. Preserve `estimated_cost_usd` for compatibility where applicable, or introduce explicit amount/currency/finalization fields and update schemas/mappers/CostChip together. Represent unreported cost as pending rather than silently showing zero.
5. Cost reports may arrive after execution finishes. Refresh dashboard/detail data when BE records a cost update; include reporting period/timezone and last-updated/finalization state in summaries.

## Notification queue after test execution

Treat this as an in-app persisted notification queue by default; email/push delivery is not specified. Add a queue/list with unread count and links to the exact project/environment/run.

- On a run reaching a terminal state, BE enqueues a notification associated with the persisted run result. Include successful and failed completion, and define messaging for cancellation/agent error.
- Suggested response: `id`, `run_id`, `run_number`, `project_id`, `environment_id`, `type`, `title`, `message`, `created_at`, `read_at`; include `unread_count` and pagination metadata in the list envelope.
- Create one completion notification per run/recipient, even if completion events are retried. Notification creation must survive worker/process restarts; use durable delivery or a transactional outbox as appropriate.
- FE fetches notifications after starting/completing a run and on page load, with polling or a notification stream for background updates. Mark read through the PATCH endpoint and preserve read state across reloads.
- A completion notification can show cost as pending if AI usage has not reached BE yet; update the displayed data when reporting finishes.

## Overview-specific corrections

- `OverviewCounters` sums all supplied runs under “AI cost this week,” without checking dates. Backend aggregation needs an explicit week boundary/timezone.
- “Tests” currently counts runs; agree whether it should count flows/tests or executions.
- Pass-rate denominator currently includes every status, including queued/running/cancelled. Agree which completed outcomes count.
- `PassRateTrend` ignores its runs prop and draws a fixed SVG path. Return daily date/pass/total/rate points for the seven-day period.
- `RegressionsFirst` checks whether any regression exists but renders fixed checkout/PR/deployment text. Return actual flow/run identity, PR, deployment/version and detection time for each alert.
- Paginated runs cannot provide reliable project-wide aggregates by themselves.

## Integration behavior to agree before wiring

1. Base URL and authentication: use the existing Supabase session to authenticate application requests; backend validates identity and project access. Browser SSE needs an agreed authentication approach (native EventSource cannot attach arbitrary bearer headers).
2. Project scope: fixture queries currently accept project IDs as cache keys but return the same data. Every request must enforce real project ownership. Include project/environment/filter scope in query keys; run detail currently keys only by run ID.
3. Lists: choose cursor pagination, sort order, filter conventions and response envelopes. Current hooks expect arrays; wrapping responses requires adapter changes.
4. Errors: agree on error code/message shape, not-found behavior, permission failures and field validation errors. Runs and flow detail need explicit query-error states rather than presenting failed loads as empty data.
5. Mutations: use server-generated IDs and authoritative results, show pending/error states, prevent duplicate submissions and invalidate related caches after success. Specify retry/idempotency behavior for environment creation, run creation and notification updates.
6. Artifact access: agree on authorized URLs, expiry/refresh, and how missing or still-processing evidence is represented.

## Suggested implementation order

1. Session/project access, project list and environments.
2. Environment creation and existing flow list/detail (exclude new-flow creation).
3. Runs list/detail with genuine steps, failures and artifacts.
4. Start/re-run execution and live event synchronization.
5. AI-service cost reporting, dashboard aggregates, latest five runs and completion notifications.
6. Trace downloads and persistent discussion.

No separate backend calls are needed for theme, sidebar collapse, selected step/action/tab, presentation mode, or other unsaved form edits. Those are local/URL UI state.
