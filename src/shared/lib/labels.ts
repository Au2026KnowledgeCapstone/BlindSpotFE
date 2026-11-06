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
