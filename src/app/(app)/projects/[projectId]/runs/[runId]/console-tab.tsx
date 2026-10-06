"use client";

import React from "react";
import type { ConsoleLogEntry } from "@/features/runs";

interface ConsoleTabProps {
  logs: ConsoleLogEntry[];
}

export function ConsoleTab({ logs }: ConsoleTabProps) {
  return (
    <div className="space-y-2 font-mono text-[11px]">
      <div className="text-xs font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider mb-2">
        Browser Console Logs
      </div>
      {logs.map((log) => {
        const isError = log.level === "error";
        const isWarn = log.level === "warn";
        return (
          <div
            key={log.id}
            className={`p-2 rounded border font-mono ${
              isError
                ? "border-[var(--bs-fail-border)] bg-[var(--bs-fail-tint)] text-[var(--bs-fail)]"
                : isWarn
                ? "border-[var(--bs-warn-border)] bg-[var(--bs-warn-tint)] text-[var(--bs-warn)]"
                : "border-[var(--bs-border-subtle)] bg-[var(--bs-bg-raised)] text-[var(--bs-text-secondary)]"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
              <span>{log.timestamp}</span>
              <span className="uppercase">{log.level}</span>
            </div>
            <div className="break-all">{log.message}</div>
          </div>
        );
      })}
    </div>
  );
}
