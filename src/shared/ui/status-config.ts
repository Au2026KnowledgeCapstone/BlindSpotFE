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
  | "cancelled";

export interface StatusConfigItem {
  token: string;
  tintToken: string;
  borderToken: string;
  icon: LucideIcon;
  secondaryIcon?: LucideIcon;
  label: string;
  spins?: boolean;
}

export const STATUS_CONFIG: Record<RunStatus, StatusConfigItem> = {
  passed: {
    token: "var(--bs-pass)",
    tintToken: "var(--bs-pass-tint)",
    borderToken: "var(--bs-pass-border)",
    icon: CircleCheck,
    label: "Passed",
  },
  passed_healed: {
    token: "var(--bs-healed)",
    tintToken: "var(--bs-healed-tint)",
    borderToken: "var(--bs-healed-border)",
    icon: CircleCheck,
    secondaryIcon: Bandage,
    label: "Passed · healed",
  },
  failed: {
    token: "var(--bs-fail)",
    tintToken: "var(--bs-fail-tint)",
    borderToken: "var(--bs-fail-border)",
    icon: CircleX,
    label: "Failed",
  },
  regression: {
    token: "var(--bs-fail)",
    tintToken: "var(--bs-fail-tint)",
    borderToken: "var(--bs-fail-border)",
    icon: TrendingDown,
    label: "Regression",
  },
  agent_error: {
    token: "var(--bs-neutral)",
    tintToken: "var(--bs-neutral-tint)",
    borderToken: "var(--bs-neutral-border)",
    icon: BotOff,
    label: "Agent error",
  },
  flaky: {
    token: "var(--bs-warn)",
    tintToken: "var(--bs-warn-tint)",
    borderToken: "var(--bs-warn-border)",
    icon: Shuffle,
    label: "Flaky",
  },
  running: {
    token: "var(--bs-accent)",
    tintToken: "var(--bs-accent-tint)",
    borderToken: "var(--bs-accent-border, #7c93ff52)",
    icon: LoaderCircle,
    label: "Running",
    spins: true,
  },
  queued: {
    token: "var(--bs-neutral)",
    tintToken: "var(--bs-neutral-tint)",
    borderToken: "var(--bs-neutral-border)",
    icon: CircleDashed,
    label: "Queued",
  },
  cancelled: {
    token: "var(--bs-neutral)",
    tintToken: "var(--bs-neutral-tint)",
    borderToken: "var(--bs-neutral-border)",
    icon: CircleSlash,
    label: "Cancelled",
  },
};
