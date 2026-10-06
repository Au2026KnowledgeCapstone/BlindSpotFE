import type { RunStatus } from "@/features/runs";

type FlowStatus = "draft" | "active" | "archived";

type Flow = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  goal: string;
  status: FlowStatus;
  steps: FlowStep[];
  settings: FlowSettings;
};

type FlowStep = {
  id: string;
  title: string;
  expectedOutcome: string;
  order: number;
  type: "action" | "inference" | "check";
};

type FlowSettings = {
  environment: "development" | "staging" | "production" | "pr_preview";
  schedule: "now" | "weekly" | "on_pr" | "manual";
  credentialsId?: string;
};
