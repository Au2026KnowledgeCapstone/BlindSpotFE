import {
  CircleCheck,
  Bandage,
  CircleX,
  TrendingDown,
  BotOff,
  Shuffle,
  LoaderCircle,
  CircleDashed,
  CircleSlash,
  Check,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";

export type RunStatus =
  | "passed"
  | "passed_healed"
  | "failed"
  | "regression"
  | "agent_error"
  | "flaky"
  | "running"
  | "queued"
  | "cancelled"
  | "completed";

/** A per-criterion or per-requirement verdict. Distinct from `RunStatus`: a run
 * can be "completed" and still carry a "fail" or "inconclusive" verdict. */
export type Verdict = "pass" | "fail" | "inconclusive";

export interface StatusConfigItem {
  /**
   * Tint fill, hue text, hue border — the badge/callout treatment.
   *
   * These are written as literal utility classes rather than `var(--bs-*)`
   * strings so they survive Tailwind's JIT scan and can be composed with
   * variants. A dynamically built class name (`bg-${hue}-tint`) would not be
   * generated at all, so the literals here are deliberate.
   */
  chipClass: string;
  /** The hue as a plain background, for the stability strip's bars. */
  barClass: string;
  icon: LucideIcon;
  secondaryIcon?: LucideIcon;
  label: string;
  spins?: boolean;
}

export const STATUS_CONFIG: Record<RunStatus, StatusConfigItem> = {
  passed: {
    chipClass: "bg-pass-tint text-pass border-pass-border",
    barClass: "bg-pass",
    icon: CircleCheck,
    label: "Passed",
  },
  passed_healed: {
    chipClass: "bg-healed-tint text-healed border-healed-border",
    barClass: "bg-healed",
    icon: CircleCheck,
    secondaryIcon: Bandage,
    label: "Passed · healed",
  },
  failed: {
    chipClass: "bg-fail-tint text-fail border-fail-border",
    barClass: "bg-fail",
    icon: CircleX,
    label: "Failed",
  },
  regression: {
    chipClass: "bg-fail-tint text-fail border-fail-border",
    barClass: "bg-fail",
    icon: TrendingDown,
    label: "Regression",
  },
  agent_error: {
    chipClass: "bg-neutral-tint text-neutral border-neutral-border",
    barClass: "bg-neutral",
    icon: BotOff,
    label: "Agent error",
  },
  flaky: {
    chipClass: "bg-warn-tint text-warn border-warn-border",
    barClass: "bg-warn",
    icon: Shuffle,
    label: "Flaky",
  },
  running: {
    chipClass: "bg-accent-tint text-accent border-accent-border",
    barClass: "bg-accent",
    icon: LoaderCircle,
    label: "Running",
    spins: true,
  },
  queued: {
    chipClass: "bg-neutral-tint text-neutral border-neutral-border",
    barClass: "bg-neutral",
    icon: CircleDashed,
    label: "Queued",
  },
  cancelled: {
    chipClass: "bg-neutral-tint text-neutral border-neutral-border",
    barClass: "bg-neutral",
    icon: CircleSlash,
    label: "Cancelled",
  },
  completed: {
    chipClass: "bg-neutral-tint text-neutral border-neutral-border",
    barClass: "bg-neutral",
    icon: Check,
    label: "Completed",
  },
};

/**
 * Inconclusive is a real verdict, not an error and not a failure — it must
 * never render as a pass. Kept separate from `STATUS_CONFIG` because a run's
 * execution status (queued/running/completed/…) and a result's verdict
 * (pass/fail/inconclusive) are different axes that can combine freely.
 */
export const VERDICT_CONFIG: Record<Verdict, StatusConfigItem> = {
  pass: {
    chipClass: "bg-pass-tint text-pass border-pass-border",
    barClass: "bg-pass",
    icon: CircleCheck,
    label: "Pass",
  },
  fail: {
    chipClass: "bg-fail-tint text-fail border-fail-border",
    barClass: "bg-fail",
    icon: CircleX,
    label: "Fail",
  },
  inconclusive: {
    chipClass: "bg-warn-tint text-warn border-warn-border",
    barClass: "bg-warn",
    icon: CircleHelp,
    label: "Inconclusive",
  },
};
