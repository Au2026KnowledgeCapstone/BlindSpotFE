"use client";

import React from "react";
import { type RunStatus } from "@/shared/ui/status-config";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { ActionBadge, type ActionType } from "@/shared/ui/ActionBadge";
import { Inference } from "@/shared/ui/Inference";
import { EvidencePanel } from "@/shared/ui/EvidencePanel";
import { ExpectedObserved } from "@/shared/ui/ExpectedObserved";
import { StabilityStrip } from "@/shared/ui/StabilityStrip";
import { CostChip } from "@/shared/ui/CostChip";
import { ScreenshotFrame } from "@/shared/ui/ScreenshotFrame";
import { InlineError } from "@/shared/ui/InlineError";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useThemeStore } from "@/shared/ui/theme-store";
import { Moon, Sun } from "lucide-react";

const ALL_STATUSES: RunStatus[] = [
  "passed",
  "passed_healed",
  "failed",
  "regression",
  "agent_error",
  "flaky",
  "running",
  "queued",
  "cancelled",
];

const ALL_ACTIONS: ActionType[] = [
  "NAVIGATE",
  "CLICK",
  "FILL",
  "WAIT",
  "OBSERVE",
  "NETWORK",
  "RECOVERY",
  "HEAL",
  "FAIL_STEP",
  "COMPLETE_STEP",
];

const StatusSection = () => (
  <section className="space-y-3">
    <h2 className="text-sm font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider">
      1. Status Badges
    </h2>
    <div className="p-4 rounded-lg border border-[var(--bs-border-default)] bg-[var(--bs-bg-panel)] space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {ALL_STATUSES.map((st) => (
          <StatusBadge key={st} status={st} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--bs-border-subtle)]">
        <span className="text-xs text-[var(--bs-text-tertiary)] font-mono">Compact:</span>
        {ALL_STATUSES.map((st) => (
          <StatusBadge key={st} status={st} compact />
        ))}
      </div>
    </div>
  </section>
);

const ActionSection = () => (
  <section className="space-y-3">
    <h2 className="text-sm font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider">
      2. Action Badges
    </h2>
    <div className="p-4 rounded-lg border border-[var(--bs-border-default)] bg-[var(--bs-bg-panel)] flex flex-wrap gap-2">
      {ALL_ACTIONS.map((act) => (
        <ActionBadge key={act} action={act} />
      ))}
    </div>
  </section>
);

const InferenceAndExpectedSection = () => (
  <>
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider">
        3. Inference (AI Output Only)
      </h2>
      <Inference
        certainty="high"
        evidenceLinks={[
          { label: "network #3" },
          { label: "console #1" },
          { label: "screenshot step 5" },
        ]}
      >
        <p>Order API returned a 500 status code when submitting valid payment payload.</p>
      </Inference>
    </section>

    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider">
        4. Expected vs Observed
      </h2>
      <ExpectedObserved
        expected="Customer redirected to /checkout/success."
        observed="Page remained at /checkout with error banner."
      />
    </section>
  </>
);

const EvidenceAndAsyncSection = () => (
  <>
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider">
        5. Evidence Panel & Cost Chip
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <CostChip durationSeconds={14.6} actionsCount={23} estimatedCostUsd={0.12} />
          <StabilityStrip
            runs={[
              { id: "1", status: "passed" },
              { id: "2", status: "failed" },
            ]}
          />
        </div>
        <EvidencePanel title="Network Trace" rawTextToCopy="POST /api/v1/orders 500">
          <div>POST /api/v1/orders HTTP/1.1 500 Internal Server Error</div>
        </EvidencePanel>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider">
        6. Screenshot & Error States
      </h2>
      <ScreenshotFrame url="https://app.acme.com/checkout" clickPoint={{ x: 65, y: 40 }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <InlineError title="Failed to fetch timeline" message="Connection error." />
        <EmptyState title="No test runs recorded" />
      </div>
      <div className="p-3 rounded-lg border border-[var(--bs-border-default)] bg-[var(--bs-bg-panel)] space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </section>
  </>
);

export default function DevUiPage() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--bs-border-default)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bs-text-primary)]">
            BlindSpot Design System Primitives
          </h1>
          <p className="text-xs text-[var(--bs-text-tertiary)] mt-1">Component showcase (§3.8)</p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--bs-border-default)] bg-[var(--bs-bg-panel)] hover:bg-[var(--bs-bg-raised)] text-xs text-[var(--bs-text-primary)] font-medium"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          Toggle Theme ({theme})
        </button>
      </div>
      <StatusSection />
      <ActionSection />
      <InferenceAndExpectedSection />
      <EvidenceAndAsyncSection />
    </div>
  );
}
