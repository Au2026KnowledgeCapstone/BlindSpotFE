import type { Run } from "@/features/runs";

/** Pure business rule: accepting a heal makes the run passed_healed; rejecting it makes it failed. */
export function deriveRunStatusFromHeal(decision: "accepted" | "rejected"): Run["status"] {
  return decision === "accepted" ? "passed_healed" : "failed";
}
