"use client";

import React from "react";

export function EnvironmentsContent({ projectId }: { projectId: string }) {
  const envs = [
    { name: "Production", risk: "fail", note: "destructive runs disabled", url: "https://acme.com" },
    { name: "Staging", risk: "warn", note: "automated regression suite target", url: "https://staging.acme.dev" },
    { name: "PR Preview #482", risk: "accent", note: "ephemeral preview environment", url: "https://pr-482.acme.dev" },
    { name: "Development", risk: "neutral", note: "local dev sandbox", url: "http://localhost:3000" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-primary">Environments — {projectId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {envs.map((e) => (
          <div key={e.name} className="border border-border rounded p-4 bg-raised space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-primary">{e.name}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-panel border border-border">
                {e.risk}
              </span>
            </div>
            <p className="text-xs text-tertiary">{e.note}</p>
            <div className="text-xs font-mono text-accent">{e.url}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
