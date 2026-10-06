import React from "react";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function HealsQueue() {
  const heals = [
    {
      id: "heal-01",
      runId: "run-4821",
      fromTarget: "draft plan",
      toTarget: "updated plan",
      before: "checkout → /login",
      after: "checkout → /signup → /login",
      status: "pending" as const,
      timestamp: "2m ago",
    },
    {
      id: "heal-02",
      runId: "run-4820",
      fromTarget: "step 3",
      toTarget: "step 3 retry",
      before: "url /api/checkout",
      after: "url /api/checkout (retry)",
      status: "rejected" as const,
      timestamp: "1h ago",
    },
  ];

  const acceptHeal = (id: string) => {
    console.log("Accept heal", id);
    // Update heal status; re-run that run; UI updates automatically via events
  };

  const rejectHeal = (id: string) => {
    console.log("Reject heal", id);
    // Reject heal; turn that run into a failure; UI updates everywhere
  };

  return (
    <div className="border border-border bg-panel rounded-md p-4 space-y-3">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Pending Heals</h3>
      <div className="space-y-2">
        {heals.map((h) => (
          <div key={h.id} className="border border-border bg-raised rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-tertiary">Run #{h.runId}</div>
              <StatusBadge status={h.status} />
            </div>
            <div className="text-xs">
              <span className="text-tertiary">Target: </span>
              <span className="font-mono text-primary">{h.fromTarget}</span>
              <span className="text-secondary mx-2">→</span>
              <span className="font-mono text-primary">{h.toTarget}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="text-tertiary">Before</div>
                <div className="bg-panel border border-border rounded p-1 font-mono text-primary">{h.before}</div>
              </div>
              <div className="space-y-1">
                <div className="text-tertiary">After</div>
                <div className="bg-panel border border-border rounded p-1 font-mono text-primary">{h.after}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-[10px] text-tertiary">Healed {h.timestamp}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptHeal(h.id)}
                  className="px-3 py-1 bg-pass text-white text-[10px] font-medium rounded hover:bg-pass/90"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectHeal(h.id)}
                  className="px-3 py-1 bg-fail text-white text-[10px] font-medium rounded hover:bg-fail/90"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
