"use client";
import React from "react";
import { Button } from "@/components/ui/button";
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 space-y-3 border border-fail-border bg-fail-tint rounded">
      <h2 className="text-sm font-semibold text-fail">Environments Error</h2>
      <p className="text-xs text-fg-secondary">{error.message}</p>
      <Button variant="outline" size="sm" onClick={() => reset()}>Try again</Button>
    </div>
  );
}
