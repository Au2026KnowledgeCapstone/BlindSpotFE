import React from "react";

export function FlowSaveRow({
  saveState,
}: {
  saveState: "idle" | "pending" | "error" | "success";
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={saveState === "pending"}
        className="px-4 py-2 border border-border rounded text-xs font-medium text-accent"
      >
        {saveState === "pending" ? "Saving…" : "Save flow"}
      </button>
      {saveState === "error" && (
        <span className="text-xs text-fail">Generate a plan before saving this flow.</span>
      )}
      {saveState === "success" && <span className="text-xs text-pass">Flow saved.</span>}
    </div>
  );
}
