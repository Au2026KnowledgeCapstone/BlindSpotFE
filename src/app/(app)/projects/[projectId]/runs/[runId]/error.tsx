"use client";
import React from "react";
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 space-y-3 border border-fail-border bg-fail-tint rounded">
      <h2 className="text-sm font-semibold text-fail">Run Detail Error</h2>
      <p className="text-xs text-secondary">{error.message}</p>
      <button type="button" onClick={() => reset()} className="px-3 py-1 text-xs border rounded bg-raised">Try again</button>
    </div>
  );
}
