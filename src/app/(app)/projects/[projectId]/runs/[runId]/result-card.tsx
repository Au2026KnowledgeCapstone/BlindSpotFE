"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import type { CriterionAssessment, Evidence, Result, ResultAction } from "@/features/analysis";
import { VerdictBadge } from "@/shared/ui/VerdictBadge";
import { Inference } from "@/shared/ui/Inference";
import { EvidencePanel } from "@/shared/ui/EvidencePanel";
import { classificationLabel, humanizeEnum } from "@/shared/lib/labels";
import { workspaceApi } from "@/features/workspace";

function CriterionRow({ assessment }: { assessment: CriterionAssessment }) {
  return (
    <li className="space-y-1.5 rounded-lg border border-border bg-raised p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-xs text-fg">{assessment.criterionText}</p>
        <VerdictBadge verdict={assessment.verdict} />
      </div>
      {assessment.source === "ai" ? (
        <Inference compact title="AI assessment">{assessment.rationale}</Inference>
      ) : (
        <p className="text-xs text-fg-secondary">
          <span className="font-medium text-fg-tertiary">{assessment.source === "engine" ? "Engine check" : "Deterministic check"} · </span>
          {assessment.rationale}
        </p>
      )}
    </li>
  );
}

function ActionRow({ action }: { action: ResultAction }) {
  return (
    <li className="flex items-center justify-between gap-2 py-1.5 text-xs">
      <span className="min-w-0 flex-1 truncate text-fg-secondary">
        <span className="mr-2 font-mono text-fg-tertiary">{action.index + 1}.</span>
        <span className="mr-1.5 font-medium text-fg">{humanizeEnum(action.kind)}</span>
        {action.description}
      </span>
      <span className={action.outcome === "completed" ? "text-fg-tertiary" : "text-fail"}>{humanizeEnum(action.outcome)}</span>
    </li>
  );
}

function EvidenceRow({ item }: { item: Evidence }) {
  let href: string | undefined;
  try { href = workspaceApi.evidenceUrl(item.id); } catch { href = undefined; }
  if (item.type === "screenshot" && href) {
    return (
      <li className="space-y-1">
        <img src={href} alt="Captured screenshot" crossOrigin="use-credentials" loading="lazy" className="max-h-64 w-full rounded border border-border object-contain" />
        <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline">View full size <ExternalLink className="size-3" /></a>
      </li>
    );
  }
  return (
    <li>
      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
        {humanizeEnum(item.type)} <ExternalLink className="size-3.5" />
      </a>
    </li>
  );
}

export function ResultCard({ result }: { result: Result }) {
  const nonPass = result.verdict !== "pass";
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-panel p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-fg">{result.requirementTitle}</h3>
          {nonPass && <p className="text-xs text-fg-tertiary">{classificationLabel(result.classification)}</p>}
        </div>
        <VerdictBadge verdict={result.verdict} />
      </header>

      <p className="text-xs leading-relaxed text-fg-secondary"><span className="font-medium text-fg-tertiary">Observed: </span>{result.observedBehavior}</p>

      {result.criterionAssessments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-tertiary">Acceptance criteria</h4>
          <ul className="space-y-2">{result.criterionAssessments.map((assessment) => <CriterionRow key={assessment.criterionId} assessment={assessment} />)}</ul>
        </div>
      )}

      {result.actions.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-tertiary">Actions</h4>
          <EvidencePanel><ul className="divide-y divide-subtle">{result.actions.map((action) => <ActionRow key={action.index} action={action} />)}</ul></EvidencePanel>
        </div>
      )}

      {result.evidence.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-tertiary">Evidence</h4>
          <ul className="grid gap-3 sm:grid-cols-2">{result.evidence.map((item) => <EvidenceRow key={item.id} item={item} />)}</ul>
        </div>
      )}
    </section>
  );
}
