# BlindSpot Frontend Overhaul: Execution Plan

> **Who this is for:** the teammate building the new BlindSpot frontend.
> **What it is:** one self-contained plan. Do the phases in order. Each task has a "done when" check.
> **Repo:** `BlindSpotFE` (currently empty apart from `docs/` and `.claude/`).
> **Backend status:** BlindSpotBE has no code yet, so build the whole frontend against **typed mock data**. The plan is set up so that switching to the real API later means changing one file per feature.

---

## 0. Read this first (5 minutes)

### What BlindSpot is
An AI QA agent. A developer describes a user flow in plain English ("a new customer can sign up, search, add to cart, and check out"). BlindSpot runs it in a real browser, records evidence (screenshots, network, console), and when something breaks, explains what failed and why.

**Primary user:** a frontend or full-stack developer on a team with **no QA staff**, shipping fast (often AI-written code). Their question when they open the app is always: *"What broke, since when, and can you prove it?"*

### What the research told us (why the UI looks the way it does)
We reviewed 7 competitors (QA Wolf, Momentic, mabl, testRigor, Checksum, Meticulous, Rainforest), 4 tools developers already use (Linear, Playwright Trace Viewer, Sentry, GitHub PR checks), and practitioner complaints on Reddit and review sites.

| What users complain about | What we build in response |
|---|---|
| "Self-healing AKA forcing pass." They don't trust AI green checks | A pass that needed the agent to adapt gets its own status, **Passed · healed**, and goes into a review queue. Nothing happens silently. |
| Failures say "AI could not proceed" with no explanation | Every failure leads with **Expected vs. Observed** in plain English, then the evidence, *then* the AI's guess |
| AI reasoning mixed in with facts | **Observed vs. Inferred:** evidence and AI output get visibly different styles, and AI output is always labelled |
| Flaky and slow from one run to the next | A **stability strip** (last N runs) per flow; "app defect" kept separate from "agent error" |
| Hidden per-run AI cost | A **cost chip** on every run: duration · actions · ~$ · replay vs. agentic |
| Demos only show login forms | The live-run and failure screens must read clearly on a projector (this is our final demo) |

Every competitor's homepage says "agentic QA, plain English, self-healing". We stand out by being **trustworthy and explicit**, not louder.

### The 9 design principles (apply to every screen)
1. **Observed ≠ Inferred.** Evidence and AI output always look different, and AI output is always labelled.
2. **Nothing silent.** Retries, recoveries, heals, and timeouts all appear in the timeline.
3. **Failure-first.** Order of importance: regressions → failures → flaky → passing.
4. **Plain English first,** raw data one click away.
5. **Deep-link to the exact moment:** step, action, and timestamp, all in the URL.
6. **Show the cost** of every run.
7. **Dense, calm, keyboard-friendly.** This is a working tool, not a marketing page.
8. **Never rely on colour alone:** icon + label + colour.
9. **Readable on a projector.**

---

## 1. Locked decisions (don't re-debate these)

| Area | Decision |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript `strict` |
| Styling | Tailwind CSS v4 + shadcn/ui, themed through our tokens (§3) |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| URL state | `nuqs` (selected step, tabs, filters) |
| App-wide UI state | `useState` by default; Zustand only for theme and command palette |
| Icons | `lucide-react`, 16px, stroke 1.5 |
| Fonts | Inter Variable (UI), JetBrains Mono (evidence and code) |
| Tests | Vitest + React Testing Library + MSW; Playwright for the demo flow |
| Design QA | impeccable skill (already installed in `.claude/`) |
| Theme | Dark by default, full light theme too |
| Visual reference | Linear's *structure* (surface levels, density, type scale). **Not** its logo, brand colour, or layouts. |

---

## 2. Phase plan

Each phase ends with something you can demo. Don't start a phase until the previous one's "done when" checks pass.

| Phase | Outcome | Rough size |
|---|---|---|
| P0 | Project scaffolded, tokens, lint rules, test setup | 0.5 day |
| P1 | Design-system primitives | 1.5 days |
| P2 | App shell, routing, mock data layer | 1 day |
| P3 | **Run detail: failed run** (the core screen) | 2 days |
| P4 | **Run detail: live run** (demo moment) | 1.5 days |
| P5 | Project overview (landing page) | 1 day |
| P6 | Flows list + flow editor | 1.5 days |
| P7 | Heals review queue + environments + runs list | 1 day |
| P8 | Hardening: a11y, tests, impeccable audit, light-theme pass | 1 day |

### P0: Scaffold & guardrails

- [ ] Scaffold inside `BlindSpotFE`:
  ```bash
  npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
  npx shadcn@latest init
  npm i @tanstack/react-query react-hook-form zod @hookform/resolvers nuqs lucide-react zustand
  npm i -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom msw @playwright/test
  ```
- [ ] Create `src/styles/tokens.css` from **§3 Theme tokens**, import it in the root layout, and alias shadcn variables (§3.7).
- [ ] Load Inter Variable and JetBrains Mono with `next/font`.
- [ ] Add the theme toggle: a `data-theme` attribute on `<html>`, dark by default, persisted to `localStorage` (wrap reads in try/catch).
- [ ] Turn on the TS and ESLint rules in **§4.1 Hard limits & enforcement**.
- [ ] Create the folder skeleton from **§4.2 Folder structure**.
- [ ] Run `/impeccable init` in Claude Code and point it at this file so it writes `PRODUCT.md`.
- [ ] Add a GitHub Action that runs `lint`, `typecheck`, `vitest`, and `build` on every PR.

**Done when:** `npm run build`, `npm run lint`, and `npx vitest run` pass; the page background changes with the theme toggle; any hex colour inside `src/features/**` fails lint.

### P1: Design-system primitives (`src/shared/ui/`)

Build these in order. Specs are in **§3.8**. Each one gets an RTL test.

- [ ] `status-config.ts`: the **single** status → {token, icon, label} map (§3.3). Nothing else may map statuses.
- [ ] `StatusBadge`: pill and icon-only variants (icon-only has `aria-label` + tooltip)
- [ ] `Inference`: violet-ruled wrapper for any AI output, with a certainty label and a "Based on: …" evidence links footer
- [ ] `EvidencePanel`: inset, monospace, with a copy button
- [ ] `ExpectedObserved`: two-column block
- [ ] `ActionBadge`: NAVIGATE / CLICK / FILL / WAIT / OBSERVE / NETWORK / RECOVERY / HEAL / FAIL_STEP / COMPLETE_STEP
- [ ] `StabilityStrip`: last N runs as bars, each clickable
- [ ] `CostChip`: `⏱ 14.6s · 23 actions · ~$0.12 · Agentic`
- [ ] `ScreenshotFrame`: browser-chrome strip, Before/After toggle, click-point marker
- [ ] `AsyncBoundary`: renders loading / error / empty / success (§4.6)
- [ ] `InlineError`, skeleton primitives, empty-state primitive

**Done when:** a `/dev/ui` route shows every primitive in every status, in both themes; `/impeccable audit src/shared/ui` reports no theming or contrast failures.

### P2: App shell, routing, mock data

- [ ] Routes (`src/app/(app)/…`), each page ≤ 40 lines:
  ```
  /projects/[projectId]                    → Overview
  /projects/[projectId]/flows              → Flows list
  /projects/[projectId]/flows/[flowId]     → Flow detail / editor
  /projects/[projectId]/runs               → Runs list
  /projects/[projectId]/runs/[runId]       → Run detail (live or finished)
  /projects/[projectId]/heals              → Heals review queue
  /projects/[projectId]/environments       → Environments
  ```
- [ ] Shell: 240px collapsible sidebar, 48px top bar with a project switcher, environment selector, and theme toggle.
- [ ] Every route segment has `loading.tsx` and `error.tsx`.
- [ ] Mock data layer, **the swap point for the real backend**:
  - `src/features/<feature>/api/*.schema.ts`: Zod schemas written in the **backend's** snake_case shape (follow the tech doc's DB model: runs, test_steps, test_step_runs, failures, artifacts)
  - `src/features/<feature>/api/map-*.ts`: snake_case JSON → camelCase domain types
  - `src/features/<feature>/api/use-*.ts`: TanStack Query hooks that, for now, read fixtures **through the schema and mapper**
  - `src/test/fixtures/`: typed factories (`makeRun({ status: "failed" })`)
- [ ] Seed fixtures from the existing mockups: Acme Corp; Production / Staging / PR Preview #482 / Development; the checkout flow failing at step 5 with `POST /api/orders → 500` (copy is in `BlindSpotUIMVP/sample-ui/audit-checkout.html`).

**Done when:** you can click through every route, every page shows real fixture data, and changing one fixture field name breaks exactly one mapper test.

### P3: Run detail, failed run ⭐ core screen

Layout: three panes, `Steps & actions (360px) | Evidence viewer (flex) | Details tabs (400px, collapsible)`. Below the `lg` breakpoint the panes stack.

- [ ] Header: flow name, run #, `StatusBadge`, branch@commit, trigger, env, `CostChip`; actions "Re-run" and "Download trace".
- [ ] **Failure summary at the top:** `ExpectedObserved`, then `Regression` details (last passing run → first failing run).
- [ ] Left pane: steps (✓ / ✗ / healed) that expand into `ActionRow`s (timestamp, `ActionBadge`, target shown as a mono chip, and reasoning rendered inside a compact `Inference`). Failed rows get a red rule; recovery and heal rows get amber.
- [ ] Middle pane: `ScreenshotFrame` for the selected action plus a film strip with a red marker where the failure happened.
- [ ] Right pane tabs: **Console** · **Network** (filtered to the selected action, with a "Show all" toggle, like Playwright's trace viewer) · **AI analysis** (`Inference`: likely cause, suggested next steps, linked evidence) · **Discussion** (comment thread).
- [ ] Selected step, action, and tab live in the URL (`?step=5&action=3&tab=network`), so a pasted link lands on the exact moment.
- [ ] Copy rule: show "Application defect" vs. "Agent error" explicitly.

**Done when:** opening a deep link lands on the failing action with the screenshot showing; a test confirms AI analysis only renders inside `Inference`; `/impeccable critique` on this screen has no high-severity findings.

### P4: Run detail, live run ⭐ demo moment

- [ ] Simulate server-sent events with a mock event emitter that replays a fixture timeline (`run.started`, `step.started`, `action.executed`, `screenshot.created`, `step.passed|failed`, `analysis.started|finished`, `run.completed`), matching tech doc §28–29.
- [ ] `useLiveRunEvents(runId)` writes events into the TanStack Query cache. Components don't keep their own copy.
- [ ] Show the stream state: `connecting / live / reconnecting / ended`. A dead stream must never look like a stuck agent.
- [ ] Active step spins; new actions slide in (180ms); the list auto-scrolls unless the user has scrolled away; reduced motion is respected.
- [ ] When the run finishes, the screen turns into the P3 layout in place (no navigation).
- [ ] "Presentation mode" toggle: larger step labels (32px display size) for the projector.

**Done when:** the fixture replays login → search → cart → checkout ✗ → "Analyzing failure…" → analysis appears, start to finish, readable from 3 metres away.

### P5: Project overview (landing page)

- [ ] Top: **Regressions** first (since when, which deploy), then **Failing now**, then **Flaky**.
- [ ] Counters: tests, pass rate, new regressions, AI cost this week.
- [ ] Pass-rate trend: a single neutral line with red failure points (no green area fill).
- [ ] Recent runs table with `StatusBadge`, env dot, trigger, duration, `CostChip`.

**Done when:** a regression in the fixture data is the first thing you see on the page.

### P6: Flows list + flow editor

- [ ] Flows grouped by feature area, each row with a `StabilityStrip`, last status, and last run time.
- [ ] Editor: a natural-language goal box → "Generate plan" (mocked) → editable step list (goal + expected outcome per step) shown inside `Inference` until the user saves it. Saved steps render as normal content.
- [ ] Per-flow settings: environment, schedule (now / weekly / on PR), credentials reference (never display secret values).
- [ ] Form: React Hook Form + Zod; pending, error, and success states on save.

**Done when:** you can create a flow, edit its generated plan, save it, and see it in the list.

### P7: Heals queue, runs list, environments

- [ ] Heals: each heal shows before and after (old target → new target, screenshots), the run it came from, and **Accept / Reject**. A rejected heal turns that run into a failure.
- [ ] Runs list: filters for env, trigger, and status, all stored in the URL.
- [ ] Environments: cards with a risk dot (Prod red, Staging amber, Preview blue, Dev grey) and a "destructive runs disabled" note on Production.

**Done when:** accepting or rejecting a heal updates the run's status everywhere in the app.

### P8: Hardening

- [ ] `/impeccable audit src` and `/impeccable harden` on every feature; fix or document every finding.
- [ ] Keyboard pass: everything reachable, visible focus ring, `Esc` closes overlays, `j/k` moves through steps on run detail.
- [ ] Light-theme visual pass on every screen.
- [ ] Playwright end-to-end test of the demo path: overview → failing run → failing step deep link → analysis tab → add a comment.
- [ ] Must-have trust tests (§4.10) pass.

**Done when:** CI is green, the impeccable audit has no unresolved high-severity findings, and the demo path runs in Playwright.

---

## 3. Theme tokens (the visual system)

**Concept, "Evidence Room":** dark, quiet, exact. Colour appears **only** when it means something (status, severity, environment risk, primary action). Depth comes from lighter surfaces, not shadows.
All values live in `src/styles/tokens.css`. **Components never contain raw hex.** Contrast ratios below were checked against WCAG on the canvas colour.

### 3.1 Surfaces, text, borders
| Token | Dark | Light | Use |
|---|---|---|---|
| `--bs-bg-canvas` | `#08090a` | `#ffffff` | App background |
| `--bs-bg-panel` | `#0f1011` | `#f7f7f8` | Sidebar, panels |
| `--bs-bg-raised` | `#141516` | `#f2f2f3` | Cards, row hover |
| `--bs-bg-overlay` | `#191a1b` | `#ffffff` | Menus, dialogs |
| `--bs-bg-inset` | `#050506` | `#f0f0f2` | Code, logs, screenshot wells |
| `--bs-bg-hover` | `#ffffff0a` | `#0000000a` | Hover wash |
| `--bs-bg-selected` | `#ffffff12` | `#00000010` | Selected row |
| `--bs-text-primary` | `#f7f8f8` | `#1b1c20` | Titles, body (18.7:1) |
| `--bs-text-secondary` | `#c9ced6` | `#3c4149` | Dense body (12.6:1) |
| `--bs-text-tertiary` | `#8a8f98` | `#6b6f78` | Metadata (6.1:1) |
| `--bs-text-quaternary` | `#62666d` | `#8e9199` | **Disabled / decorative only** (3.4:1) |
| `--bs-border-subtle` | `#ffffff0d` | `#0000000d` | |
| `--bs-border-default` | `#ffffff17` | `#00000014` | |
| `--bs-border-strong` | `#ffffff26` | `#00000024` | |
| `--bs-focus-ring` | `#7c93ff` | `#3d5afe` | |

### 3.2 Accent: "Signal Blue" (means *the agent is active*)
| Token | Dark | Light |
|---|---|---|
| `--bs-accent` (text/icon) | `#7c93ff` | `#3d5afe` |
| `--bs-accent-solid` (button fill, white text 5.1:1) | `#3d5afe` | `#3d5afe` |
| `--bs-accent-solid-hover` | `#5470ff` | `#2f4ae6` |
| `--bs-accent-tint` | `#3d5afe1f` | `#3d5afe14` |

### 3.3 Status: hue + icon + label, always
| Status (`RunStatus`) | Token | Dark | Light | Lucide icon | Label |
|---|---|---|---|---|---|
| `passed` | `--bs-pass` | `#4cc38a` | `#1a7f4b` | `circle-check` | Passed |
| `passed_healed` | `--bs-healed` | `#f2b84b` | `#9a6200` | `circle-check` + `bandage` | Passed · healed |
| `failed` | `--bs-fail` | `#ff6b6b` | `#c9302c` | `circle-x` | Failed |
| `regression` | `--bs-fail` (solid badge) | `#ff6b6b` | `#c9302c` | `trending-down` | Regression |
| `agent_error` | `--bs-neutral` | `#9aa0aa` | `#5f646d` | `bot-off` | Agent error |
| flaky (flow-level) | `--bs-warn` | `#f2b84b` | `#9a6200` | `shuffle` | Flaky |
| `running` | `--bs-accent` | `#7c93ff` | `#3d5afe` | `loader-circle` (spins) | Running |
| `queued` | `--bs-neutral` | `#9aa0aa` | `#5f646d` | `circle-dashed` | Queued |
| `cancelled` | `--bs-neutral` | `#9aa0aa` | `#5f646d` | `circle-slash` | Cancelled |

Each status also gets `-tint` (12% alpha, backgrounds) and `-border` (32% alpha), e.g. `--bs-fail-tint: #ff6b6b1f`.

### 3.4 Inference (AI output only)
| Token | Dark | Light |
|---|---|---|
| `--bs-infer` | `#b49cff` | `#6d4ad8` |
| `--bs-infer-tint` | `#b49cff14` | `#6d4ad80f` |
| `--bs-infer-border` | `#b49cff33` | `#6d4ad833` |

Violet and the `sparkles` icon appear **only** inside `<Inference>`. Evidence never uses violet.

### 3.5 Severity, environments, action badges
- **Severity:** Critical = solid fail badge + `octagon-alert` · High = fail on fail-tint · Medium = warn on warn-tint · Low = neutral.
- **Environment dots:** Production = fail · Staging = warn · Preview = accent (show PR #) · Development = neutral.
- **Action badges** (mono, 11px, uppercase, muted tints): NAVIGATE/NETWORK accent · CLICK/FILL neutral-strong · WAIT/OBSERVE neutral · RECOVERY/HEAL warn · FAIL_STEP fail · COMPLETE_STEP pass.
- **Charts:** neutral line, red failure points. Extra categorical colours: `#7c93ff #b49cff #4cc38a #f2b84b #5ec8e5 #f08bb8`.

### 3.6 Type, spacing, shape, motion
| Group | Tokens |
|---|---|
| Fonts | UI: Inter Variable · Evidence: JetBrains Mono (12px always for URLs, selectors, logs) |
| Type scale | micro 11/16 (510, +0.02em) · mini 12/16 · **small 13/20 = default body** · regular 15/24 (prose) · large 18/26 (590) · title 24/32 (590, -0.012em) · display 32/40 (680, presentation mode only) |
| Weights | 400 · 510 · 590 · 680 |
| Numbers | `tabular-nums` for every duration, count, percent, and timestamp |
| Spacing | 4px base: 0 2 4 6 8 12 16 20 24 32 40 48 64 |
| Layout | sidebar 240 · top bar 48 · reading width 760 · rows: compact 32 / comfortable 40 / timeline 28 |
| Breakpoints | sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 |
| Radius | xs 4 (badges, inputs) · sm 6 (buttons) · md 8 (cards, code) · lg 12 (dialogs, screenshots) · full (pills) |
| Shadows | Dark: none, use surface levels. Light: sm `0 1px 2px #0000000f` · md `0 4px 16px #00000014` · lg `0 12px 32px #0000001f` |
| Z-layers | header 100 · overlay 500 · popover 600 · command 650 · dialog 700 · toast 800 · tooltip 1100 |
| Motion | ease-out `cubic-bezier(.215,.61,.355,1)` · ease-in-out `cubic-bezier(.645,.045,.355,1)` · fast 120ms · base 180ms · slow 280ms |
| Reduced motion | Keep state changes; spinner becomes an opacity pulse; no sliding |

### 3.7 Wiring (Tailwind v4 + shadcn)
```css
/* src/styles/tokens.css: excerpt; fill in every token from §3.1–3.6 */
:root, :root[data-theme="dark"] {
  --bs-bg-canvas:#08090a; --bs-bg-panel:#0f1011; --bs-text-primary:#f7f8f8;
  --bs-accent:#7c93ff; --bs-pass:#4cc38a; --bs-fail:#ff6b6b; --bs-warn:#f2b84b; --bs-infer:#b49cff;
}
:root[data-theme="light"] {
  --bs-bg-canvas:#ffffff; --bs-bg-panel:#f7f7f8; --bs-text-primary:#1b1c20;
  --bs-accent:#3d5afe; --bs-pass:#1a7f4b; --bs-fail:#c9302c; --bs-warn:#9a6200; --bs-infer:#6d4ad8;
}
@theme inline {
  --color-canvas:var(--bs-bg-canvas); --color-panel:var(--bs-bg-panel); --color-fg:var(--bs-text-primary);
  --color-accent:var(--bs-accent); --color-pass:var(--bs-pass); --color-fail:var(--bs-fail);
  --color-warn:var(--bs-warn); --color-infer:var(--bs-infer);
  --font-sans:"Inter Variable",system-ui,sans-serif; --font-mono:"JetBrains Mono",ui-monospace,monospace;
}
/* shadcn aliases */
:root {
  --background:var(--bs-bg-canvas); --foreground:var(--bs-text-primary); --card:var(--bs-bg-raised);
  --popover:var(--bs-bg-overlay); --primary:var(--bs-accent-solid); --primary-foreground:#fff;
  --muted-foreground:var(--bs-text-tertiary); --border:var(--bs-border-default);
  --ring:var(--bs-focus-ring); --destructive:var(--bs-fail); --radius:6px;
}
```
Use it as `bg-panel text-fg text-fail border-border`. Never `bg-[#ff6b6b]`.

### 3.8 Component specs
| Component | Spec |
|---|---|
| `StatusBadge` | 20px pill, icon + label, `{status}-tint` background, `{status}` text. Compact = icon only + `aria-label` + tooltip |
| `StabilityStrip` | 10–20 bars, 6×16px, 2px gap, oldest → newest left to right, clicking a bar opens that run |
| `ActionRow` | `[time mono 11px][ACTION badge][description; targets in mono chip]` + optional reasoning in a compact `Inference`. Failed: fail-tint + 2px fail left rule. Recovery/heal: warn-tint |
| `EvidencePanel` | inset background, mono 12px, header with copy button; network lines = method · path · status-coloured code · duration |
| `ExpectedObserved` | two columns, caps labels in tertiary, sentences at 15px. Always above the fold on a failure |
| `Inference` | infer-tint, 2px violet left rule, header "✦ AI analysis · likely cause", footer "Based on: network #3, console #1, screenshot after step 5" (links) |
| `ScreenshotFrame` | radius 12, 1px border, chrome strip with the URL in mono, Before/After toggle, red click marker on failure |
| `RunTimelineScrubber` | film strip with a red marker at the failure time |
| `CostChip` | `⏱ 14.6s · 23 actions · ~$0.12` + "Replay" or "Agentic"; mono numerals, tertiary colour |

### 3.9 Do / don't
| Do | Don't |
|---|---|
| Use colour only for meaning | Decorative colour on headers, cards, icons |
| Wrap all AI output in `<Inference>` | Style AI text like evidence or like normal content |
| Show `Passed · healed` separately | Fold heals into plain Passed |
| Put Expected/Observed first on failures | Lead with an AI paragraph |
| Use mono for anything copied from the browser | Show evidence in a proportional font |
| Keep cards flat with hairline borders | Glass, gradients, glows, "AI purple" heroes |
| Treat light theme as a real theme | Ship dark-only |

---

## 4. Code rules (Clean Code Constitution, condensed)

The test for every piece of code: **if it breaks at 2am, can someone new find the problem in under 5 minutes?**

### 4.1 Hard limits & enforcement
| Limit | Value | Enforced by |
|---|---|---|
| Component file | ≤ 150 lines soft / 250 hard | ESLint `max-lines` |
| Hook file | ≤ 120 lines | review |
| Function | ≤ 40 lines, complexity ≤ 10 | ESLint `max-lines-per-function`, `complexity` |
| JSX nesting | ≤ 5 levels | `max-depth` + review |
| Props per component | ≤ 7 | review |
| `useState` per component | ≤ 3 | review |
| `useEffect` per component | ≤ 1, with a `// sync: <external system>` comment | review |
| Exports per file | 1 primary (+ its types) | review |
| `any` | 0, use `unknown` + narrowing | `@typescript-eslint/no-explicit-any` |
| `@ts-ignore` / `eslint-disable` | must have a reason + issue link | `ban-ts-comment` |
| Raw colours outside `src/styles/` | 0 | custom lint + impeccable detector |
| Deep cross-feature imports | 0 | `no-restricted-imports` |

tsconfig: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`.

### 4.2 Folder structure (by feature)
```
src/
├── app/            # routes only: thin page.tsx (≤40 lines), layout, loading, error
├── features/
│   └── runs/       # also: flows, failures, heals, environments, overview
│       ├── api/        # zod schemas + mappers + query hooks (the backend boundary)
│       ├── components/ # run-step-list.tsx …
│       ├── hooks/      # use-live-run-events.ts …
│       ├── lib/        # pure functions + co-located *.test.ts
│       ├── types.ts
│       └── index.ts    # the ONLY import path other features may use
├── shared/         # used by 2+ features AND has no feature knowledge
│   ├── ui/  lib/  hooks/
├── styles/tokens.css
└── test/           # fixtures, factories, MSW handlers
```
Imports point one way: `app → features → shared`. `shared` never imports from `features`. No `utils/`, `helpers/`, `misc/`, or `common/` folders.

### 4.3 The 11 principles, one card each

| # | Principle | Rule | Example |
|---|---|---|---|
| 1 | **DRY: reuse behaviour, not lines** | Extract *knowledge* (business rules, status mapping, formatting, routes, tokens), not text that just looks alike. Ask: "if this rule changes, must both places change together?" | ✅ `deriveRunStatus()` in one place. ❌ `<GenericCard type="run" isEnv={false} hideCost …>` |
| 2 | **Small components named by purpose** | Each component *lays out*, *displays*, or *orchestrates*, never all three. Name it by product meaning. Pages ≤ 40 lines. A `{/* --- section --- */}` comment means it should be split | `RunDetailContainer` (hooks → children) · `RunDetailLayout` (slots) · `ExpectedObserved` (display) |
| 3 | **Separate the kinds of state** | Server → TanStack Query. Form → RHF + Zod. Shareable selection/filters → URL (`nuqs`). Local UI → `useState`. **Derive, never copy** | ❌ `useState(data.steps)` · ✅ `useMemo(() => data.steps.filter(isFailed), [data])` |
| 4 | **Normalise data at the boundary** | Raw API JSON never reaches components. `api/` parses with Zod and maps to domain types; mocks go through the same path. *(Detailed API rules deferred until the backend exists.)* | `run.schema.ts → mapRun() → Run` |
| 5 | **Hooks own behaviour, components own rendering** | Anything that isn't JSX goes in a named hook. Effects only sync with external systems. Pure logic moves to `lib/` | `useLiveRunEvents`, `useAutoScrollToActiveStep`, `useStepSelection` |
| 6 | **Every async path is explicit** | Loading / error / empty / success via `AsyncBoundary`. Skeletons match the final layout. Errors name what failed and offer a fix. Mutations show pending state on the button. Streams show `connecting/live/reconnecting/ended`. No empty `catch {}` | `<InlineError title="Couldn't load run #4821" onRetry={retry} />` |
| 7 | **Names reveal lifecycle and intent** | `is/has/can` booleans · `on*` props / `handle*` handlers · `fetch*` for I/O · `to/derive/format/map` for pure transforms · phase in the name (`draftPlan`, `pendingHeal`) · product vocabulary only (Flow, Run, Step, Action, Evidence, Failure, Heal, Regression, Environment) · no `I`/`T` prefixes | `RunStatus = "queued" \| "running" \| "passed" \| "passed_healed" \| "failed" \| "regression" \| "agent_error" \| "cancelled"` |
| 8 | **Organise by feature** | Start inside the feature. Move to `shared/` only when a **second** feature needs it *and* it has no feature knowledge | see §4.2 |
| 9 | **Utilities are pure** | `lib/` = same input → same output, no I/O, no mutation, no hidden `Date.now()`/random. Impure code lives in `api/` or `hooks/`, or says what it touches in its name | ❌ `getRunAge(run)` mutates and reads time · ✅ `getRunAgeMs(startedAt, now)` |
| 10 | **Test rules, transformations, risky flows** | Must: every `lib/` function, every mapper, the demo path in Playwright. Should: behavioural hooks, risky components. Query by role/label; no big snapshots; every bug fix adds a test; use typed factories | `makeRun({ status: "failed" })` |
| 11 | **Duplicate before abstracting** | Rule of three: write it → duplicate it with `// DUP: see <path>` → extract on the third copy. Inline any abstraction that grows behaviour-switching booleans. Exceptions: business rules, theme primitives, security-critical code | — |

### 4.4 Must-have trust tests (from the research)
- A healed pass **never** renders as a plain pass.
- AI analysis **only** renders inside `<Inference>`.
- Regression is detected when previous = passed and current = failed.
- Every async component renders all four states.
- A deep link `?step=&action=&tab=` restores the exact view.

### 4.5 Breaking a rule
Allowed when following it would make the code *harder* to debug. Leave a comment `// CONSTITUTION: Art. N — <reason>`. If the same rule keeps getting broken, change the rule.

---

## 5. Workflow & tools

| When | Do |
|---|---|
| Before a new screen | `/impeccable shape <screen>` |
| While editing UI | impeccable hooks check files automatically on edit and on stop (`.claude/settings.local.json`) |
| Before opening a PR | `npm run lint && npm run typecheck && npx vitest run` + `/impeccable audit <changed path>` |
| Polishing a finished screen | `/impeccable critique <path>` → `/impeccable polish <path>` |
| Error and empty states | `/impeccable harden <path>` |
| CLI / CI | `.claude/skills/impeccable/scripts/impeccable detect src/` |

> Note: `.claude/settings.local.json` is normally per-machine. To give the whole team the impeccable hooks, move its `hooks` block into a committed `.claude/settings.json`.

### PR checklist (copy into `.github/pull_request_template.md`)
```
- [ ] Components have one responsibility and are ≤ 150 lines
- [ ] No server data copied into useState; shareable selection lives in the URL
- [ ] Every async path renders loading / error / empty / success
- [ ] API (and mock) data is parsed + mapped in features/*/api
- [ ] New lib/ logic is pure and tested
- [ ] Names use product vocabulary
- [ ] No raw colours; statuses use StatusBadge; AI output uses <Inference>
- [ ] /impeccable audit run; findings fixed or explained
- [ ] Any duplication marked // DUP with a pointer
```

---

## 6. Reference material

- **Product & architecture:** `BlindSpotDocumentation/README.md` (tech doc: data model §30–44, live events §28–29, demo script §87)
- **Old mockups (copy and fixture source only, not a visual reference):** `BlindSpotUIMVP/sample-ui/`. The audit-trail page (`audit-checkout.html`) has the right *content*: per-step timeline, action badges, recovery attempts, Expected/Observed, and the "application defect, not agent error" wording.
- **Patterns worth studying:**
  - Playwright Trace Viewer: before/after snapshots, error line on the timeline, network filtered by action
  - Linear issue page: the activity feed mixing human and agent events
  - Sentry: first seen / last seen, regressions
  - QA Wolf: test tree → Live / Outline / Code tabs
- **Competitor positioning, for slides:**
  - QA Wolf: managed, $60k–250k+/yr
  - Momentic: self-serve, YAML tests, "Mo" bug-bash agent
  - mabl: about $499/mo and up; reviewers find its reports complex
  - testRigor: plain English, enterprise focus
  - Checksum: fixes proposed as PRs
  - Meticulous: visual diffs from recorded sessions
  - Rainforest: built for teams without QA
- **Reddit evidence:** r/QualityAssurance threads `1rf0b1c` (self-healing), `1sxdmmo`, `1qciok7`; r/Everything_QA `1rmdlj7` (how to evaluate tools); r/software `1usnfu0` (startup with no QA, burned out on AI-written code).
- **Unverified figure, don't cite without checking:** "self-healing causes 23% more false positives" (from a search summary, source not opened).
