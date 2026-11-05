"use client";

import React from "react";
import { ArrowRight, CircleAlert, Clock, FileCheck2, Play, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/ui/EmptyState";

const PROJECT_NAME = "Acme Corp";
const PROJECT_URL = "vitals.acme-corp.com";

function PageHeading() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-fg">Analysis runs</h1>
        <p className="mt-1.5 text-sm text-fg-tertiary">
          Choose what to validate. See exactly what was checked.
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-pass-border bg-pass-tint px-3 py-1 text-xs font-medium text-pass">
        Worker ready
      </span>
    </div>
  );
}

function RequirementPicker() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg">Choose requirements</h3>
        <span className="text-xs text-fg-tertiary">0 approved</span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-raised px-3 py-2.5 text-sm text-fg-tertiary">
        <Search className="size-4 shrink-0" />
        <input
          aria-label="Find a requirement"
          placeholder="Find a requirement…"
          className="w-full bg-transparent text-fg outline-none placeholder:text-fg-tertiary"
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-fg-tertiary">
        <span>Choose up to 10</span>
        <span>Select next 0 · Clear</span>
      </div>
      <div className="mt-4">
        <EmptyState
          icon={FileCheck2}
          title="No approved requirements yet"
          description="Review and approve requirements before running a browser check."
          action={
            <Button variant="outline">
              Review requirements <ArrowRight />
            </Button>
          }
        />
      </div>
      <p className="mt-4 text-xs text-fg-tertiary">0 of 10 selected</p>
    </div>
  );
}

function ReadyToCheckPanel() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-raised p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-tertiary">
        Ready to check
      </p>
      <strong className="mt-3 text-4xl font-medium tracking-tight tabular-nums text-fg">0</strong>
      <p className="text-xs text-fg-tertiary">requirements selected</p>
      <p className="mt-3 text-sm text-fg-tertiary">Select a requirement on the left to get started.</p>

      <p className="mt-6 text-xs text-fg-tertiary">Application</p>
      <p className="mt-1 text-sm font-semibold text-fg">{PROJECT_URL}</p>

      <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-warn-border bg-warn-tint px-2.5 py-1 text-xs font-medium text-warn">
        <CircleAlert className="size-3.5" /> Browser setup required
      </span>
      <span className="mt-2 inline-flex w-fit items-center gap-1 text-xs text-fg-tertiary">
        Set up &amp; verify browser <ArrowRight className="size-3.5" />
      </span>

      <label className="mt-5 flex items-start gap-2 text-xs text-fg-tertiary">
        <input type="checkbox" disabled className="mt-0.5" />
        <span>
          <span className="font-medium text-fg">Generate new plans for this run</span>
          <br />
          Saved plans and observed controls are reused by default. Regenerate after reviewing an
          intentional workflow change.
        </span>
      </label>

      <Button disabled className="mt-4 w-full">
        <Play /> Select requirements
      </Button>
      <p className="mt-3 text-[11px] text-fg-tertiary">
        Uses AI to plan and assess checks. Screenshots may be shared with your configured provider.
      </p>
    </div>
  );
}

function StartAnalysisPanel() {
  return (
    <section className="rounded-2xl border border-border bg-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-fg">Start a new analysis</h2>
          <p className="mt-1 text-sm text-fg-tertiary">
            Pick the requirements you want to check in {PROJECT_NAME}.
          </p>
        </div>
        <Button variant="outline">
          <ShieldCheck /> Browser setup
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RequirementPicker />
        <ReadyToCheckPanel />
      </div>
    </section>
  );
}

function RunHistoryPanel() {
  return (
    <section className="rounded-2xl border border-border bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-fg">Run history</h2>
          <p className="mt-1 text-xs text-fg-tertiary">
            The requirements and access checks actually run for this project.
          </p>
        </div>
        <span className="rounded-full border border-border bg-raised px-2.5 py-1 text-xs text-fg-tertiary">
          Page 1
        </span>
      </div>
      <div className="mt-5">
        <EmptyState
          icon={Clock}
          title="No browser runs yet"
          description="Select your first requirement above to start collecting evidence."
        />
      </div>
    </section>
  );
}

export function RunsContent(_props: { projectId: string }) {
  return (
    <div className="space-y-5">
      <PageHeading />
      <StartAnalysisPanel />
      <RunHistoryPanel />
    </div>
  );
}
