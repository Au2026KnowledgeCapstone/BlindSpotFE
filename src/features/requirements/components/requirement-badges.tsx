import { Check, Circle, CircleHelp, X } from "lucide-react";
import type { ApprovalStatus, Verdict } from "../types";
export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const approved = status === "approved";
  const Icon = approved ? Check : status === "needs_clarification" ? CircleHelp : Circle;
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${approved ? "border-pass-border bg-pass-tint text-pass" : status === "needs_clarification" ? "border-warn-border bg-warn-tint text-warn" : "border-border text-fg-secondary"}`}><Icon className="size-3.5" />{approved ? "Approved" : status === "needs_clarification" ? "Needs clarification" : "Draft"}</span>;
}
export function VerdictBadge({ verdict }: { verdict: Verdict | undefined }) {
  const Icon = verdict === "pass" ? Check : verdict === "fail" ? X : verdict === "inconclusive" ? CircleHelp : Circle;
  const tone = verdict === "pass" ? "border-pass-border bg-pass-tint text-pass" : verdict === "fail" ? "border-fail-border bg-fail-tint text-fail" : verdict === "inconclusive" ? "border-warn-border bg-warn-tint text-warn" : "border-border text-fg-secondary";
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${tone}`}><Icon className="size-3.5" />{verdict === "pass" ? "Passed" : verdict === "fail" ? "Failed" : verdict === "inconclusive" ? "Inconclusive" : "Not tested"}</span>;
}
