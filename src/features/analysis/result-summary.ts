import type { Result, Run } from "./types";

export function summarizeResults(run: Run, results: Result[]) {
  const passed = results.filter((item) => item.verdict === "pass").length;
  const failed = results.filter((item) => item.verdict === "fail").length;
  const inconclusive = results.length - passed - failed;
  const total = Math.max(run.requirementSnapshots.length, results.length);
  const pending = total - results.length;
  const active = run.status === "queued" || run.status === "running";
  const outcome = active ? "IN PROGRESS" : failed > 0 ? "FAIL" : terminalOutcome(run, { total, pending, inconclusive });
  return { passed, failed, inconclusive, total, pending, executed: results.length,
    score: results.length ? Math.round((passed / results.length) * 100) : null, outcome, active };
}

function terminalOutcome(run: Run, counts: { total: number; pending: number; inconclusive: number }) {
  if (run.status === "failed") return "ERROR";
  if (run.status === "cancelled") return "CANCELLED";
  if (!counts.total || counts.pending > 0) return "INCOMPLETE";
  return counts.inconclusive ? "INCONCLUSIVE" : "PASS";
}

export type ResultSummary = ReturnType<typeof summarizeResults>;
