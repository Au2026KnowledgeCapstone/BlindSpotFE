/**
 * Human labels for the enums that reach the screen.
 *
 * Tables were rendering storage values directly — `pr_preview` with a CSS
 * `capitalize` on it produced "Pr_preview", and triggers read `pr_merge`.
 * Plain English first is a product principle; it applies to enum values too.
 */

const ENVIRONMENT_LABELS: Record<string, string> = {
  production: "Production",
  staging: "Staging",
  pr_preview: "PR preview",
  development: "Development",
};

const TRIGGER_LABELS: Record<string, string> = {
  pr_merge: "PR merge",
  pr_open: "PR opened",
  schedule: "Scheduled",
  scheduled: "Scheduled",
  manual: "Manual",
  deploy: "Deploy",
};

const SCHEDULE_LABELS: Record<string, string> = {
  now: "Run once now",
  weekly: "Weekly",
  on_pr: "On every PR",
  manual: "Manual only",
};

const CATEGORY_LABELS: Record<string, string> = {
  functional: "Functional",
  ux: "UX",
  data: "Data",
  performance: "Performance",
  security: "Security",
};

const APPROVAL_LABELS: Record<string, string> = {
  draft: "Draft",
  needs_clarification: "Needs clarification",
  approved: "Approved",
};

/** "Could not find the element" and "criteria violated" are different things, and a PM needs to see which. */
const CLASSIFICATION_LABELS: Record<string, string> = {
  criteria_satisfied: "Criteria satisfied",
  criteria_violated: "Criteria violated",
  locator_failure: "Could not find the element",
  environment_failure: "Environment failure",
  execution_error: "Execution error",
};

/** Sentence-cases an unknown enum value: `agent_error` → `Agent error`. */
export function humanizeEnum(value: string): string {
  const spaced = value.replace(/[_-]+/g, " ").trim();
  if (!spaced) return value;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

const lookup = (map: Record<string, string>, value: string): string =>
  map[value] ?? humanizeEnum(value);

export const environmentLabel = (value: string): string =>
  lookup(ENVIRONMENT_LABELS, value);

export const triggerLabel = (value: string): string =>
  lookup(TRIGGER_LABELS, value);

export const scheduleLabel = (value: string): string =>
  lookup(SCHEDULE_LABELS, value);

export const categoryLabel = (value: string): string =>
  lookup(CATEGORY_LABELS, value);

/** Priority values (critical/high/medium/low) are already plain English. */
export const priorityLabel = (value: string): string => humanizeEnum(value);

export const approvalLabel = (value: string): string =>
  lookup(APPROVAL_LABELS, value);

export const classificationLabel = (value: string): string =>
  lookup(CLASSIFICATION_LABELS, value);
