import type { Run, Result } from "@/features/analysis";

export const previewRun: Run = {
  id: "preview-run", projectId: "preview-project", environmentId: "preview-environment",
  runNumber: 24, status: "completed", cancelRequested: false, requestedBy: "preview-user",
  queuedAt: "2026-11-17T14:00:00Z", startedAt: "2026-11-17T14:00:03Z", completedAt: "2026-11-17T14:02:41Z",
  actionCount: 36, requirementSnapshots: Array.from({ length: 8 }, (_, index) => ({ id: `requirement-${index}`, title: `Requirement ${index + 1}`, description: "", criteria: [] })),
};

const titles = ["Users can sign in with a verified email", "Project members can view the dashboard", "Requirements can be created and approved", "Team invitations respect project permissions", "Reports preserve execution evidence", "Search returns matching requirements", "Checkout completes successfully", "Recovery email arrives within the expected window"];
export const previewResults: Result[] = titles.map((title, index) => ({
  id: `result-${index}`, runId: previewRun.id, requirementId: `requirement-${index}`, requirementTitle: title,
  verdict: index < 6 ? "pass" : index === 6 ? "fail" : "inconclusive",
  classification: index < 6 ? "criteria_satisfied" : index === 6 ? "criteria_violated" : "environment_failure",
  observedBehavior: index < 6 ? "The expected behavior was observed and all acceptance criteria were satisfied." : index === 6 ? "Submitting a valid order returned a server error. The confirmation page was not displayed." : "The email service did not respond before the test timed out. Delivery could not be verified.",
  criterionAssessments: [], actions: [], evidence: [], durationMs: 18000,
}));
