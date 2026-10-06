"use client";

import React from "react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { ScreenshotFrame } from "@/shared/ui/ScreenshotFrame";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { useDecideHeal, useHeals, type HealDecision } from "../api/use-heals";
import type { Heal } from "../api/map-heal";
import { deriveRunStatusFromHeal } from "../lib/derive-run-status-from-heal";

export function HealsQueue({ projectId }: { projectId: string }) {
  const { data: heals, isLoading, error, refetch } = useHeals(projectId);
  const decide = useDecideHeal(projectId);

  return (
    <AsyncBoundary<Heal[]> isLoading={isLoading} error={error} data={heals ?? null} onRetry={() => void refetch()}>
      {(loaded) => (
        <div className="border border-border bg-panel rounded-md p-4 space-y-3">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Pending heals</h3>
          <div className="space-y-2">
            {loaded.map((heal) => (
              <HealRow
                key={heal.id}
                heal={heal}
                isPending={decide.isPending}
                onDecide={(healId, decision) => decide.mutate({ healId, decision })}
              />
            ))}
          </div>
        </div>
      )}
    </AsyncBoundary>
  );
}

function HealRow({
  heal,
  isPending,
  onDecide,
}: {
  heal: Heal;
  isPending: boolean;
  onDecide: (healId: string, decision: HealDecision) => void;
}) {
  return (
    <div className="border border-border bg-raised rounded-md p-3 space-y-2" data-testid={`heal-${heal.id}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-tertiary">Source run {heal.runId} · step {heal.stepNumber}</span>
        {heal.decision === "pending" ? (
          <span className="text-secondary">Awaiting review</span>
        ) : (
          <StatusBadge status={deriveRunStatusFromHeal(heal.decision)} />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <TargetCell label="Before" target={heal.oldTarget} screenshotUrl={heal.beforeScreenshotUrl} />
        <TargetCell label="After" target={heal.newTarget} screenshotUrl={heal.afterScreenshotUrl} />
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-tertiary">Healed {heal.healedAt}</span>
        {heal.decision === "pending" && (
          <HealActions healId={heal.id} isPending={isPending} onDecide={onDecide} />
        )}
      </div>
    </div>
  );
}

function HealActions({
  healId,
  isPending,
  onDecide,
}: {
  healId: string;
  isPending: boolean;
  onDecide: (healId: string, decision: HealDecision) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => onDecide(healId, "accepted")}
        className="px-3 py-1 text-[11px] font-medium rounded border border-border text-pass"
      >
        {isPending ? "Saving…" : "Accept"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onDecide(healId, "rejected")}
        className="px-3 py-1 text-[11px] font-medium rounded border border-border text-fail"
      >
        Reject
      </button>
    </div>
  );
}

function TargetCell({
  label,
  target,
  screenshotUrl,
}: {
  label: string;
  target: string;
  screenshotUrl: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-tertiary">{label}</div>
      <div className="bg-panel border border-border rounded p-1 font-mono text-primary break-all">{target}</div>
      <ScreenshotFrame url={target} beforeSrc={screenshotUrl} alt={`${label} target screenshot`} />
    </div>
  );
}
