import type { RunStatus } from "@/shared/ui/status-config";

type FlowStatus = "draft" | "active" | "archived";

export type Flow = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  goal: string;
  status: FlowStatus;
  steps: FlowStep[];
  settings: FlowSettings;
  featureArea: string;
};

export type FlowStep = {
  id: string;
  title: string;
  expectedOutcome: string;
  order: number;
  type: "action" | "inference" | "check";
};

export type FlowSettings = {
  environment: "development" | "staging" | "production" | "pr_preview";
  schedule: "now" | "weekly" | "on_pr" | "manual";
  credentialsReference?: string;
};
