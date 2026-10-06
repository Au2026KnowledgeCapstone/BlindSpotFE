import type { FlowSnakeCase } from "./flow.schema";
import type { Flow } from "../types";

export function mapFlow(data: FlowSnakeCase): Flow {
  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    description: data.description,
    goal: data.goal,
    status: data.status,
    featureArea: data.feature_area,
    steps: data.steps,
    settings: data.settings,
    // exactOptionalPropertyTypes: only set `label` when the payload carries one.
    history: data.history.map((bar) => ({
      id: bar.id,
      status: bar.status,
      ...(bar.label !== undefined && { label: bar.label }),
    })),
    lastStatus: data.last_status,
    lastRunAt: data.last_run_at,
  };
}
