import type { WorkspaceApiTypes } from "@/features/workspace";
import type { AcceptanceCriterion, Requirement, RequirementSource } from "../types";

function mapCriterion(data: WorkspaceApiTypes["Requirement"]["acceptance_criteria"][number]): AcceptanceCriterion {
  return {
    ...(data.id !== undefined && data.id !== null && { id: data.id }),
    text: data.text,
    position: data.position,
  };
}

function mapSource(data: WorkspaceApiTypes["Requirement"]["source"]): RequirementSource {
  return {
    kind: data.kind,
    ...(data.document_name != null && { documentName: data.document_name }),
    ...(data.document_role != null && { documentRole: data.document_role }),
    ...(data.excerpt != null && { excerpt: data.excerpt }),
    warnings: data.warnings,
  };
}

export function mapRequirement(data: WorkspaceApiTypes["Requirement"]): Requirement {
  return {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    approvalStatus: data.approval_status,
    acceptanceCriteria: data.acceptance_criteria.map(mapCriterion),
    source: mapSource(data.source),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    ...(data.latest_result && { latestVerdict: data.latest_result.verdict }),
  };
}
