import type { RunBar } from "@/shared/ui/StabilityStrip";

export type FlowStatus = "draft" | "active" | "archived";

export interface FlowStep {
  id: string;
  title: string;
  expectedOutcome: string;
  order: number;
  type: "action" | "inference" | "check";
}

export interface FlowSettings {
  environment: "development" | "staging" | "production" | "pr_preview";
  schedule: "now" | "weekly" | "on_pr" | "manual";
  credentialsReference?: string | undefined;
}

export interface Flow {
  id: string;
  projectId: string;
  name: string;
  description: string;
  goal: string;
  status: FlowStatus;
  featureArea: string;
  steps: FlowStep[];
  settings: FlowSettings;
  history: RunBar[];
  lastStatus: string;
  lastRunAt: string;
}
