---
name: BlindSpot
description: Trustworthy, explicit AI QA — plain English flows run in real browsers, with evidence for every finding.
colors:
  bg-canvas: "#08090a"
  bg-panel: "#0f1011"
  bg-raised: "#141516"
  bg-overlay: "#191a1b"
  bg-inset: "#050506"
  bg-hover: "#ffffff0a"
  bg-selected: "#ffffff12"
  text-primary: "#f7f8f8"
  text-secondary: "#c9ced6"
  text-tertiary: "#8a8f98"
  text-quaternary: "#62666d"
  border-subtle: "#ffffff0d"
  border-default: "#ffffff17"
  border-strong: "#ffffff26"
  focus-ring: "#7c93ff"
  signal-blue: "#7c93ff"
  signal-blue-solid: "#3d5afe"
  signal-blue-solid-hover: "#5470ff"
  signal-blue-tint: "#3d5afe1f"
  signal-blue-border: "#7c93ff52"
  pass: "#4cc38a"
  pass-tint: "#4cc38a1f"
  pass-border: "#4cc38a52"
  healed: "#f2b84b"
  healed-tint: "#f2b84b1f"
  healed-border: "#f2b84b52"
  fail: "#ff6b6b"
  fail-tint: "#ff6b6b1f"
  fail-border: "#ff6b6b52"
  warn: "#f2b84b"
  warn-tint: "#f2b84b1f"
  warn-border: "#f2b84b52"
  neutral: "#9aa0aa"
  neutral-tint: "#9aa0aa1f"
  neutral-border: "#9aa0aa52"
  infer: "#b49cff"
  infer-tint: "#b49cff14"
  infer-border: "#b49cff33"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  value:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  micro:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.06em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
    fontFeature: "tnum"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue-solid}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-solid-hover}"
    textColor: "#ffffff"
  button-outline:
    backgroundColor: "{colors.bg-canvas}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline-hover:
    backgroundColor: "{colors.bg-panel}"
    textColor: "{colors.text-primary}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-ghost-hover:
    backgroundColor: "{colors.bg-hover}"
    textColor: "{colors.text-primary}"
  button-destructive:
    backgroundColor: "{colors.fail-tint}"
    textColor: "{colors.fail}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  input-field:
    backgroundColor: "{colors.bg-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    width: "100%"
  card-panel:
    backgroundColor: "{colors.bg-panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "16px"
  evidence-well:
    backgroundColor: "{colors.bg-inset}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "12px"
  inference-block:
    backgroundColor: "{colors.infer-tint}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "12px"
  status-badge:
    backgroundColor: "{colors.pass-tint}"
    textColor: "{colors.pass}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "20px"
  status-badge-compact:
    backgroundColor: "{colors.pass-tint}"
    textColor: "{colors.pass}"
    rounded: "{rounded.full}"
    size: "20px"
  action-badge:
    backgroundColor: "{colors.bg-selected}"
    textColor: "{colors.text-primary}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  cost-chip:
    backgroundColor: "{colors.bg-panel}"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  page-header-title:
    textColor: "{colors.text-primary}"
    typography: "{typography.title}"
  page-header-description:
    textColor: "{colors.text-tertiary}"
    typography: "{typography.label}"
  section-heading:
    textColor: "{colors.text-tertiary}"
    typography: "{typography.micro}"
  stat-tile:
    backgroundColor: "{colors.bg-panel}"
    textColor: "{colors.text-primary}"
    typography: "{typography.headline}"
    rounded: "{rounded.md}"
    padding: "16px"
  stat-tile-alarm:
    backgroundColor: "{colors.fail-tint}"
    textColor: "{colors.fail}"
    typography: "{typography.headline}"
    rounded: "{rounded.md}"
    padding: "16px"
  risk-badge:
    backgroundColor: "{colors.fail-tint}"
    textColor: "{colors.fail}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "20px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.bg-selected}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: BlindSpot

## Overview

**Creative North Star: "The Flight Recorder"**

BlindSpot is instrumentation, not a dashboard. The product records what an agent did in a real browser and holds onto it — every action, every retry, every self-heal, every dollar. The interface is the readout of that recorder: a continuous trace you scan for the moment things diverged, then drill into until you can prove what happened. Nothing is summarized away, and nothing is silent. A run that healed itself says so, on the badge, in the timeline, in the queue.

The mood is **calm, forensic, and instrument-grade**. Composure is the point: a near-black canvas, four graded text weights, hairline borders, and colour held in reserve. When a regression lands, the red is the only loud thing on the screen, and it is loud because everything around it stayed quiet. Precision reads as trustworthiness here — a misaligned column or a status chip without a label costs more credibility than any amount of missing polish. The system never raises its voice to be believed; it shows the recording.

Density is deliberate and high. The dominant type size is 12px, the badge height is 20px, and a stability strip encodes forty runs in six-pixel bars. But density stops at legibility: 11px is the floor, nothing primary hides behind a hover, and the whole thing has to survive being projected in a standup. Components are **tactile and confident** — tight radii, real press feedback, state changes that feel mechanical rather than animated.

**Key Characteristics:**
- Near-black tonal canvas (`#08090a`) with five graded surface levels, paired with a soft sage-neutral light theme — not a white one.
- Colour is signal: a status hue appears only where it reports machine state.
- Observed evidence is monospaced and inset; inferred AI output is violet and walled off.
- 12px base density, 11px hard floor, `tabular-nums` on every number that changes.
- Status is always icon + label + colour, never colour alone.
- Flat at rest, with depth from tone rather than drop shadows.

## Colors

A monochrome instrument field with one accent and a fixed, non-negotiable status vocabulary. The palette is defined twice — a default dark theme and a light theme switched by `data-theme` on `<html>` — and the frontmatter above carries the dark values as normative.

### Primary
- **Signal Blue** (`#7c93ff`, light `#4658a8`): the single accent. It marks the interactive and the in-progress: focus rings, active nav, links, the `running` status, the `NAVIGATE` and `NETWORK` action badges, and the "Spot" in the wordmark. Its saturated sibling (`#3d5afe`, light `#4658a8`) fills solid primary buttons and nothing else.

### Secondary
- **Inference Violet** (`#b49cff`, light `#655091`): reserved exclusively for model-generated content. It is never used for interaction, never for status, never decoratively. Seeing violet means a machine inferred this rather than observed it.

### Neutral
- **Canvas** (`#08090a`, light `#eef0ec`): the page floor. The light theme is intentionally a warm sage-grey, not white, to cut glare during long sessions.
- **Panel** (`#0f1011`, light `#f6f7f3`): sidebar, top header, section containers, and the resting fill for chips and empty states.
- **Raised** (`#141516`, light `#e7ebe5`): cards, inputs, and skeleton placeholders — anything that sits on top of a panel and accepts input.
- **Overlay** (`#191a1b`, light `#f8f9f6`): portalled surfaces only — menus, popovers, flyouts.
- **Inset** (`#050506`, light `#e3e7e1`): recessed wells that hold raw observed evidence. Darker than the canvas in dark theme, so evidence reads as cut *into* the page.
- **Text ramp** — primary (`#f7f8f8`) for content and headings, secondary (`#c9ced6`) for supporting prose and inactive nav, tertiary (`#8a8f98`) for metadata, eyebrow labels, and cost readouts, quaternary (`#62666d`) for the near-silent. Four steps, and the step encodes importance; never pick one for visual variety.
- **Borders** — subtle (`#ffffff0d`) for internal dividers, default (`#ffffff17`) for component boundaries, strong (`#ffffff26`) for emphasis. All alpha-based in dark theme so they ride on whatever surface they land on.

### Status
A closed set, defined once in `src/shared/ui/status-config.ts` and consumed by every badge, strip, and timeline. Each hue ships as a triplet: the hue itself for icon and text, a `1f` tint (`14` in light) for fill, and a `52` border (`33` in light).

- **Pass Green** (`#4cc38a`, light `#246440`): `passed`, `COMPLETE_STEP`.
- **Heal Amber** (`#f2b84b`, light `#79551c`): `passed_healed` and `HEAL`, and — as Warn, the same hue — `flaky` and `RECOVERY`. Amber means *it worked, but look at it.*
- **Fail Red** (`#ff6b6b`, light `#a53632`): `failed`, `regression`, `FAIL_STEP`, and the Observed column label.
- **Inert Grey** (`#9aa0aa`, light `#505a54`): `queued`, `cancelled`, `agent_error`. Absence of outcome, not a bad outcome.

### Named Rules

**The Signal Rule.** A status hue may only appear where it reports machine state. A green that means "nice" or a red that means "important" breaks the contract — once a colour is decorative anywhere, it is unreadable everywhere.

**The Observed ≠ Inferred Rule.** Violet is quarantine. Model output lives inside an `<Inference>` block with its violet left rule and `Sparkles` label; observed data lives in a monospaced inset well. A reader must be able to tell which they are looking at from across a room, without reading a word.

**The One Loud Thing Rule.** On a healthy screen, no status hue occupies more than a badge. If a surface reads as colourful before anything has failed, the accent or the tints have leaked.

## Typography

**Display / Body Font:** Inter, loaded via `next/font` (with `system-ui, sans-serif` fallback)
**Label / Mono Font:** JetBrains Mono (with `ui-monospace, monospace` fallback)

**Character:** Inter does the talking and JetBrains Mono does the testifying. The pairing is deliberately unglamorous — a neutral grotesque for prose and a technical mono for anything the machine produced. Mono is not a style choice here; it is a claim that the characters are exact.

### Hierarchy
- **Display** (600, `clamp(1.875rem, 4vw, 2.25rem)`, 1.15, `-0.02em`): one per page at most, and only on the auth and marketing surfaces. Never inside the app shell.
- **Headline** (600, 24px, 1.25): hero metrics and page-defining numbers. Usually monospaced with `tabular-nums` when it is a value rather than a title.
- **Title** (600, 18px, 1.4): section and card headings.
- **Body** (400, 14px, 1.55): prose, form labels, table cells. Failure summaries and descriptions cap at roughly 70ch.
- **Value** (400, 15px, 1.375): the one step above body, for the paired facts in `ExpectedObserved`. A single rung of emphasis without reaching Title weight.
- **Label** (500, 12px, 1.4): the workhorse. Nav items, badges, buttons, table headers, most of the app shell.
- **Micro** (600, 11px, `0.06em`, uppercase): eyebrow labels — `EXPECTED`, `OBSERVED`, evidence panel titles, action badges. The tracking is what makes 11px uppercase legible; it is not optional.
- **Mono** (400, 12px, 1.6, `tnum`): raw evidence, selectors, URLs, durations, costs, counts.

### Named Rules

**The 11px Floor Rule.** Nothing renders below 11px. The 10px and 9px sizes present in the codebase are legacy and should migrate up, not spread.

**The Tabular Rule.** Any number that updates in place — duration, cost, action count, pass rate, run totals — carries `tabular-nums`. Columns of figures must not jitter between renders.

**The Mono Means Machine Rule.** Monospace marks machine-produced fact: selectors, URLs, raw payloads, measured values. Prose written for humans stays in Inter, even inside an evidence panel.

## Layout

A fixed application frame, not a scrolling document. The shell is a full-viewport flex row: a sidebar at 240px that collapses to 64px icon-only, and a content column that owns its own scroll. `overflow-hidden` on the frame means the page never scrolls as a whole — only `<main>` does.

Vertical rhythm is set by two fixed bars: the sidebar header at 48px and the top header at 56px, both closed with a hairline bottom border. Content sits in 24px padding and caps its measure at 1400px, centred — past that width a table loses its left-edge anchor and the eye has to travel to find the next column. Major sections are separated by 32px (`space-y-8`) and the blocks inside a section by 12px; cards take 16px internal padding, denser components 12px, and chips 2–8px. The spacing scale is Tailwind's 4px base, used in small steps — 4, 6, 8, 12, 16, 24, 32 — and the tight end of it (6px gaps between an icon and its label) is where the instrument feel comes from.

Every surface opens the same way: a `PageHeader` (title, one line of orientation, optional trailing action) closed by a hairline rule, then sections each introduced by a `SectionHeading`. The project name lives in the breadcrumb, never in the page title — repeating it there pushes the actual subject rightward and costs a word of scanning on every screen.

Breakpoints are Tailwind defaults (`sm` 640px, `md` 768px, `lg` 1024px), applied sparingly: the auth surface splits to two columns at `lg`, `ExpectedObserved` splits at `md`, and the top header relaxes its padding at `sm`. The app shell itself is desktop-first and currently assumes a desktop viewport — this is the system's least-developed axis and should be treated as a known gap rather than a decision.

**The Content Scroll Rule.** The frame is fixed; only `<main>` scrolls. Headers, sidebars, and run-detail panels stay put so a deep-linked moment in a run stays in view while its evidence scrolls.

## Elevation & Depth

Depth is primarily tonal. The five surface levels — inset, canvas, panel, raised, overlay — form a ramp, and a component's height in the stack is expressed by which level it sits on plus a hairline border. In dark theme a shadow against `#08090a` is nearly invisible anyway, so tone does the work a shadow would do elsewhere.

On top of that ramp the system adds a **light ambient lift on card surfaces** — cards carry a soft, diffuse shadow at rest so they read as objects on the page rather than tinted regions of it. Both shadows are tokens (`--bs-shadow-ambient`, `--bs-shadow-overlay`) defined per theme and exposed as the `shadow-ambient` and `shadow-overlay` utilities. The light theme tints them from the sage neutral rather than pure black and drops the opacity by roughly two thirds; black at the dark-theme opacity reads as dirt on a light canvas.

### Shadow Vocabulary
- **Ambient card** (`--bs-shadow-ambient`: `0 1px 2px rgb(0 0 0 / 0.28), 0 4px 12px rgb(0 0 0 / 0.16)`; light `0 1px 2px rgb(52 72 59 / 0.08), 0 4px 12px rgb(52 72 59 / 0.06)`): resting lift for card containers. Diffuse and nearly subliminal — if you can describe its shape, it is too strong.
- **Overlay** (`--bs-shadow-overlay`: `0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)`; light tinted to `rgb(52 72 59)`): portalled surfaces only — `Menu.Popup` in the account and project menus, and error popovers. These float above the document and must detach from it.

### Named Rules

**The Tonal First Rule.** Reach for the next surface level before reaching for a shadow. If two adjacent surfaces need a shadow to be told apart, the tone step is wrong.

**The Portal Shadow Rule.** The overlay shadow belongs to things that leave the document flow. A shadow on an inline card is the ambient lift or it is a bug.

## Shapes

Rectilinear and tight. The system's base radius is 6px (`--radius`), and the vocabulary runs 4px for small chips and inset controls, 6px for buttons and evidence wells, 8px for cards, inputs, and popovers, and 12px for the screenshot frame — the one component allowed to feel like a physical object. Pills (`rounded-full`) are reserved for status badges and the icon medallion in empty states, where the shape itself says "this is a state, not a control."

Borders are structural, not decorative: a single hairline at the component edge, alpha-based so it works on any surface. Nothing in the system uses a border wider than 1px except the `<Inference>` block's 2px violet left rule and the click marker's ring — both load-bearing signals rather than styling.

The signature silhouette is the **asymmetric inference block**: square on its left edge where the violet rule lands, rounded on the right (`rounded-r-md`). It reads as something clipped to the side of the evidence rather than part of it.

## Components

### Buttons
- **Shape:** 8px radius (`rounded-lg`), with smaller sizes stepping down to 6px via `min(var(--radius-md), 10px)`.
- **Sizes:** 32px default height, with 24px (`xs`), 28px (`sm`), and 36px (`lg`) variants, plus square icon equivalents. Horizontal padding is 10px, tightening to 8px on the icon side.
- **Primary:** solid Signal Blue (`#3d5afe`) on white text; hovers to `#5470ff`.
- **Outline:** canvas fill, default border, hovers to the panel tone.
- **Ghost:** transparent until hovered, then the hover wash. The default for toolbar and inline actions.
- **Destructive:** fail tint fill with fail-coloured text — never a solid red button. Destruction is announced, not dramatized.
- **Press:** `active:translate-y-px`. One pixel, no scale, no bounce — the mechanical confirmation that defines the tactile character.
- **Focus:** a 3px `--bs-focus-ring` ring at 50% opacity plus a ring-coloured border. Always visible, never removed.

### Inputs / Fields
- **Style:** full-width, 8px radius, default border, `bg-raised` fill, 8px/12px padding, 14px text.
- **Focus:** must be the same 3px focus ring the buttons use. Several form fields currently ship without a focus style; treat that as a defect against this spec, not as precedent.
- **Error:** `aria-invalid` drives a destructive border and ring; the message renders in an `InlineError` beneath.

### Cards / Containers
- **Corner:** 8px.
- **Background:** card containers sit on either `bg-panel` (environment cards, counters, section containers) or `bg-raised` (list rows, tables, nested editors), depending on what they sit on. The rule is one step up the tonal ramp from the surface behind them, not a fixed tone.
- **Border:** hairline `border-default`; `border-subtle` for the quieter empty-state container.
- **Shadow:** `shadow-ambient` at rest. Recessed wells (`EvidencePanel`) and tint blocks (`Inference`) are excluded — they read as cut into the page, not lifted off it.
- **Padding:** 16px standard, 32px for empty states.

### Status Badge
The system's most-used component and the enforcement point for the colour-plus-label contract.
- **Full:** 20px-high pill, 8px horizontal padding, tint fill, hue-coloured border and text, 14px icon, 12px label. The `passed_healed` variant renders two icons — a check plus a bandage — before the text `Passed · healed`.
- **Compact:** 20px circle, icon only, with the label carried in `aria-label` and `title`, and `tabIndex={0}` so it is reachable.
- **Running:** the only animated status; its `LoaderCircle` spins, degrading to an opacity pulse under `prefers-reduced-motion`.
- Never render a status without its icon and, in the full variant, its text.

### Page Header
The single page-title treatment, and the only place the Title role appears inside the app shell.
- **Title:** 18px semibold, `-0.01em`. One per surface.
- **Description:** 12px tertiary, capped at `max-w-prose` — one plain line on what the surface is for, not a tagline.
- **Actions:** the surface's primary action, trailing, aligned to the title's baseline.
- **Close:** a `border-subtle` bottom rule at 16px below, which separates the header zone from the content without drawing a box around it.

### Section Heading
The signpost above each block: Micro role (11px / 600 / `0.06em` / uppercase) in **tertiary**, with an optional trailing `aside` in quaternary for a count or an action.
- Section labels sit in tertiary deliberately. Set in primary at 14px — as they once were — the label outweighs the content beneath it, and the eye reads "REGRESSIONS" before it reads the regression.
- A section label that merely restates the page title is deleted, not styled.

### Risk Badge
The environment-risk sibling of the Status Badge, same 20px pill geometry and the same icon + label + hue triplet. Four levels: Critical (shield-alert, fail), Warning (triangle, warn), Accent (eye, accent), Neutral (minus, neutral). Its labels and the risk picker's options are generated from one config so the two can't drift.

### Stat Tile
The overview's metric readout. Micro label, then the value in the Headline role — 24px, monospaced, `tabular-nums` — then an optional note in quaternary giving the number its denominator ("2 of 4 · 1 healed").
- **Alarm state:** when the number is itself bad news, the tile takes `fail-tint` fill, `fail-border`, a `TrendingDown` icon, and fail-coloured label and value. This is the failure-first principle made visual: the one tile that matters is the one you see first.
- The note is there to stop the number being a bare score. If the note only restates the value, cut it.

### Navigation
- **Sidebar:** 12px semibold labels with 16px icons, 8px/12px padding, 4px radius. Active items take `bg-selected` and primary text at semibold; inactive are secondary text that lift to primary on hover.
- **Collapsed:** labels drop, icons remain, width animates to 64px over 180ms.
- **Top header:** a breadcrumb-style project menu on the left, theme toggle and account menu on the right. Menus are `bg-overlay` popups at 8px radius with the overlay shadow and 4px internal padding.

### Cost Chip
A small monospaced readout — duration, action count, estimated cost, and run mode — on panel fill with a 4px radius and `tabular-nums`. It appears on every run without exception, because the cost of a run is a fact the user is entitled to see before they ask.

### Evidence Panel
A recessed `bg-inset` well at 6px radius holding 12px monospaced text, with an uppercase micro-label header and a copy-to-clipboard action that confirms in Pass Green for two seconds. Content wraps and scrolls horizontally rather than truncating — evidence is not abbreviated.

### Inference Block
The quarantine container for AI output: violet tint fill, 2px violet left rule, square-left/rounded-right silhouette, a `Sparkles` icon with the title `AI analysis · likely cause`, an optional uppercase certainty chip, and an optional "Based on:" footer linking to the evidence it reasoned from. Model-generated prose appears nowhere else.

### Expected vs. Observed
A two-column panel (stacking below `md`) with uppercase micro-labels — `EXPECTED` in tertiary text, `OBSERVED` in Fail Red — over 15px values. The asymmetry of the labels is the whole design: one is the contract, the other is what the recorder saw.

### Stability Strip
Forty-odd runs as 6px × 16px status-coloured bars at 1px radius, oldest to newest, each a focusable button that deep-links to its run and scales vertically on hover. It is the flight recorder in miniature.

## Do's and Don'ts

### Do:
- **Do** spell the text ramp `fg`: `text-fg`, `text-fg-secondary`, `text-fg-tertiary`, `text-fg-quaternary`. The names `primary` / `secondary` belong to shadcn's surface semantics and are mapped to them; using either name for the other meaning is what made the Button's primary variant render invisible.
- **Do** style form fields from `src/shared/ui/field.ts` (`FIELD`, `FIELD_DENSE`, `FIELD_TEXTAREA`, `FIELD_CHECKBOX`) rather than respelling the border/fill/focus string per input.
- **Do** reach for `<Button>` for anything button-shaped. A raw `<button>` is correct only for controls the variants genuinely don't describe — a 6px strip bar, a tab with an underline, an image thumbnail, a full-width disclosure row — and those still carry the 3px focus ring.
- **Do** render enum values as plain English through `src/shared/lib/labels.ts` (`environmentLabel`, `triggerLabel`, `scheduleLabel`). A stored value printed raw gives you "Pr_preview"; plain English first applies to enums, not just prose.
- **Do** open every surface with `PageHeader` and introduce every block with `SectionHeading`, rather than hand-rolling a heading per page.
- **Do** build components from token utilities (`bg-panel`, `text-fg-tertiary`, `border-pass-border`) rather than `style={{}}` objects or `[var(--bs-*)]` arbitrary values. Inline styles can't be overridden by a caller's `className`, can't carry hover/focus variants, and are invisible to the design detector.
- **Do** drive every status colour from `STATUS_CONFIG` in `src/shared/ui/status-config.ts` — which carries literal utility classes (`chipClass`, `barClass`), not colour strings. A dynamically assembled class name (`bg-${hue}-tint`) never reaches Tailwind's JIT scan and silently renders nothing.
- **Do** ship status as icon + text label + colour. Audit test: render the screen in greyscale — every state must still be identifiable.
- **Do** wrap all model-generated prose in `<Inference>`. If violet appears outside it, or AI output appears without it, the Observed ≠ Inferred contract is broken.
- **Do** use `tabular-nums` and the mono family for every measured value — durations, costs, counts, selectors, URLs.
- **Do** express depth by moving a surface up the tonal ramp (`canvas` → `panel` → `raised` → `overlay`) before adding any shadow.
- **Do** put a visible focus ring on every interactive element, using `--bs-focus-ring` at 3px.
- **Do** keep `<main>` as the only scrolling region; the shell frame stays fixed.
- **Do** check both themes before committing a colour change. `data-theme="light"` is a full second palette, not a filter, and it has its own contrast test at `src/shared/ui/__tests__/light-theme-contrast.test.ts`.

### Don't:
- **Don't** ship marketing-dashboard gloss: no gradient stat cards, no glowing KPI tiles, no decorative sparklines, no oversized percentage heroes in accent colour. This is an instrument readout, and the numbers earn attention by being accurate, not by being large.
- **Don't** indicate state with colour alone — no bare coloured dots, no red-text-only errors, no hue-differentiated rows without labels.
- **Don't** render text below 11px, and don't hide primary information behind hover. Every screen has to survive a projector in a standup.
- **Don't** use a status hue decoratively. Green is `passed`; it is not "good," "new," or "on brand."
- **Don't** use violet for anything interactive, and don't use Signal Blue for anything that isn't interactive or in-progress.
- **Don't** add a drop shadow to an inline component. Shadows belong to portalled overlays and the ambient card lift, nothing else.
- **Don't** introduce a sixth surface tone or a fifth text step. The ramps are closed; if something needs to stand out, it needs a border or a status hue, not a new grey.
- **Don't** animate decoratively. Motion is limited to 120/180/280ms state transitions on the two shipped easings, and every animation must degrade under `prefers-reduced-motion`.
