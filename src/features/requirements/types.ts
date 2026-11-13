export type RequirementCategory = "functional" | "ux" | "data" | "performance" | "security";
export type RequirementPriority = "critical" | "high" | "medium" | "low";
export type ApprovalStatus = "draft" | "needs_clarification" | "approved";
export type Verdict = "pass" | "fail" | "inconclusive";

export interface AcceptanceCriterion {
  id?: string | undefined;
  text: string;
  position: number;
}

/**
 * Provenance for an imported requirement. The excerpt is real source text the
 * server selected, not model prose — the whole point is that a reviewer can
 * check it against the original document.
 */
export interface RequirementSource {
  kind: "manual" | "imported";
  documentName?: string | undefined;
  documentRole?: "brd" | "srs" | "design_spec" | undefined;
  excerpt?: string | undefined;
  warnings: string[];
}

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  approvalStatus: ApprovalStatus;
  acceptanceCriteria: AcceptanceCriterion[];
  source: RequirementSource;
  createdAt: string;
  updatedAt: string;
  /** Verdict from the most recent completed run. Undefined until something has run. */
  latestVerdict?: Verdict | undefined;
}
