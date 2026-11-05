"use client";

import React from "react";
import { ChevronDown, Clock, Download, FileCheck2, FileText, Plus, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/shared/ui/StatTile";
import { EmptyState } from "@/shared/ui/EmptyState";

const PROJECT_NAME = "Acme Corp";

function PageHeading() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-fg">Requirements</h1>
        <p className="mt-1.5 text-sm text-fg-tertiary">Define what your product should do.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button>
          <Download /> Import requirements
        </Button>
        <Button variant="outline">
          <Plus /> Add requirement
        </Button>
      </div>
    </div>
  );
}

function ProvenanceNote() {
  return (
    <section className="flex items-start gap-4 rounded-2xl border border-border bg-panel p-5">
      <FileText className="size-5 shrink-0 text-fg-tertiary" />
      <div>
        <h2 className="text-sm font-semibold text-fg">Every requirement has a source.</h2>
        <p className="mt-1 text-xs text-fg-tertiary">
          Link product expectations to documentation, review acceptance criteria and approve
          requirements before testing.
        </p>
      </div>
    </section>
  );
}

function MetricsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="All requirements" value={0} detail={PROJECT_NAME} icon={FileText} featured />
      <StatTile label="Draft" value={0} detail="Awaiting your review" icon={Clock} />
      <StatTile label="Approved" value={0} detail="Ready for validation" icon={FileCheck2} />
      <StatTile label="Requirements tested" value={0} detail="Browser checks executed" icon={ShieldCheck} />
    </div>
  );
}

function FilterField({ label, allLabel }: { label: string; allLabel: string }) {
  return (
    <label className="text-xs text-fg-tertiary">
      {label}
      <div className="mt-1.5 flex min-w-36 items-center justify-between gap-2 rounded-full border border-border bg-panel px-3 py-2 text-xs text-fg">
        <span>{allLabel}</span>
        <ChevronDown className="size-3.5 text-fg-tertiary" />
      </div>
    </label>
  );
}

const REVIEW_TABS = [
  { label: "All", count: 0 },
  { label: "Draft", count: 0 },
  { label: "Approved", count: 0 },
  { label: "Needs clarification", count: 0 },
];

function ReviewTabs() {
  return (
    <div role="group" aria-label="Filter review status" className="flex gap-6 border-b border-border">
      {REVIEW_TABS.map((tab, i) => (
        <button
          key={tab.label}
          type="button"
          aria-pressed={i === 0}
          className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-medium ${
            i === 0 ? "border-fg text-fg" : "border-transparent text-fg-tertiary"
          }`}
        >
          {tab.label}
          <span className="text-xs text-fg-quaternary">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}

function Workbench() {
  return (
    <section aria-label="Requirements library" className="rounded-2xl border border-border bg-panel p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-60 flex-1 items-center gap-2 rounded-full border border-border bg-raised px-3 py-2.5 text-sm text-fg-tertiary">
          <Search className="size-4 shrink-0" />
          <input
            aria-label="Search requirements"
            placeholder="Search requirements or IDs…"
            className="w-full bg-transparent text-fg outline-none placeholder:text-fg-tertiary"
          />
        </div>
        <FilterField label="Category" allLabel="All categories" />
        <FilterField label="Priority" allLabel="All priorities" />
      </div>
      <div className="mt-5">
        <ReviewTabs />
      </div>
      <div className="mt-5">
        <EmptyState
          icon={FileCheck2}
          title="Your product expectations belong here"
          description="Import documentation to extract draft requirements, or add a clear expectation manually."
          action={
            <Button>
              <Download /> Import requirements
            </Button>
          }
        />
      </div>
    </section>
  );
}

export function RequirementsContent(_props: { projectId: string }) {
  return (
    <div className="space-y-5">
      <PageHeading />
      <ProvenanceNote />
      <MetricsRow />
      <Workbench />
    </div>
  );
}
