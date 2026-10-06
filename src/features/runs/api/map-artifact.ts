import type { ArtifactSnakeCase } from "./artifact.schema";
import type { Artifact } from "../types";

export function mapArtifact(data: ArtifactSnakeCase): Artifact {
  return {
    id: data.id,
    runId: data.run_id,
    ...(data.step_run_id !== undefined && { stepRunId: data.step_run_id }),
    type: data.type,
    url: data.url,
    ...(data.mime_type !== undefined && { mimeType: data.mime_type }),
    createdAt: data.created_at,
    ...(data.metadata !== undefined && { metadata: data.metadata }),
  };
}
