"use client";

import React, { useState } from "react";

type HealDecision = "pending" | "accepted" | "rejected";

type PendingHeal = {
  id: string;
  runId: string;
  oldTarget: string;
  newTarget: string;
  decision: HealDecision;
  healedAt: string;
};

const SEED_HEALS: PendingHeal[] = [
  {
    id: "heal-01",
    runId: "run-4819",
    oldTarget: 'button[data-test="place-order"]',
    newTarget: 'button:has-text("Place Order")',
    decision: "pending",
    healedAt: "2m ago",
  },
  {
    id: "heal-02",
    runId: "run-4820",
    oldTarget: "#checkout-submit",
    newTarget: 'form#checkout button[type="submit"]',
    decision: "pending",
    healedAt: "1h ago",
  },
];

export function HealsQueue() {
  const [heals, setHeals] = useState<PendingHeal[]>(SEED_HEALS);

  const decide = (id: string, decision: HealDecision) =>
    setHeals((prev) => prev.map((h) => (h.id === id ? { ...h, decision } : h)));

  return (
    <div className="border border-border bg-panel rounded-md p-4 space-y-3">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Pending heals</h3>
      <div className="space-y-2">
        {heals.map((heal) => (
          <HealRow key={heal.id} heal={heal} onDecide={decide} />
        ))}
      </div>
    </div>
  );
}

function HealRow({
  heal,
  onDecide,
}: {
  heal: PendingHeal;
  onDecide: (id: string, decision: HealDecision) => void;
}) {
  return (
    <div className="border border-border bg-raised rounded-md p-3 space-y-2" data-testid={`heal-${heal.id}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-tertiary">Source run {heal.runId}</span>
        <span className="text-secondary">{RUN_LABEL[heal.decision]}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <TargetCell label="Before" value={heal.oldTarget} />
        <TargetCell label="After" value={heal.newTarget} />
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-tertiary">Healed {heal.healedAt}</span>
        {heal.decision === "pending" && <HealActions healId={heal.id} onDecide={onDecide} />}
      </div>
    </div>
  );
}

const RUN_LABEL: Record<HealDecision, string> = {
  pending: "Awaiting review",
  accepted: "Passed · healed",
  rejected: "Failed",
};

function HealActions({
  healId,
  onDecide,
}: {
  healId: string;
  onDecide: (id: string, decision: HealDecision) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onDecide(healId, "accepted")}
        className="px-3 py-1 text-[11px] font-medium rounded border border-border text-pass"
      >
        Accept
      </button>
      <button
        type="button"
        onClick={() => onDecide(healId, "rejected")}
        className="px-3 py-1 text-[11px] font-medium rounded border border-border text-fail"
      >
        Reject
      </button>
    </div>
  );
}

function TargetCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-tertiary">{label}</div>
      <div className="bg-panel border border-border rounded p-1 font-mono text-primary break-all">{value}</div>
    </div>
  );
}
