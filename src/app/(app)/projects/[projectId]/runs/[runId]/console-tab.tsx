"use client";

import React from "react";
import type { ConsoleLogEntry } from "@/features/runs";

interface ConsoleTabProps {
  logs: ConsoleLogEntry[];
}

export function ConsoleTab({ logs }: ConsoleTabProps) {
  return (
    <div className="space-y-2 font-mono text-[11px]">
      <div className="text-xs font-semibold text-fg-secondary uppercase tracking-wider mb-2">
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
                ? "border-fail-border bg-fail-tint text-fail"
                : isWarn
                ? "border-warn-border bg-warn-tint text-warn"
                : "border-subtle bg-raised text-fg-secondary"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] opacity-70 mb-1">
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
