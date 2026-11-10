import React from "react";
import { Button } from "@/components/ui/button";

export function FlowSaveRow({
  saveState,
}: {
  saveState: "idle" | "pending" | "error" | "success" | "unavailable";
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button type="submit" disabled={saveState === "pending"}>
        {saveState === "pending" ? "Saving…" : "Save flow"}
      </Button>
      {saveState === "error" && (
        <span className="text-xs text-fail">Generate a plan before saving this flow.</span>
      )}
      {saveState === "unavailable" && <span role="status" className="text-xs text-fg-secondary">Flow draft kept locally; server save unavailable until the flow API is integrated.</span>}
      {saveState === "success" && <span className="text-xs text-pass">Flow saved.</span>}
    </div>
  );
}
