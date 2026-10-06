import type { LiveEventSnakeCase } from "@/features/runs";

const RUN_ID = "run-4821";

/** Replay timeline for the demo: login → search → cart → checkout ✗ → analysis. */
export const fixtureLiveTimeline: LiveEventSnakeCase[] = [
  { event_type: "run.started", run_id: RUN_ID, emitted_at: "09:41:02", offset_ms: 0, run_status: "running" },

  { event_type: "step.started", run_id: RUN_ID, emitted_at: "09:41:02", offset_ms: 100, step_number: 1, step_title: "Create Account" },
  { event_type: "action.executed", run_id: RUN_ID, emitted_at: "09:41:02", offset_ms: 200, step_number: 1, action_id: "act-1-1", action_description: "to /signup" },
  { event_type: "screenshot.created", run_id: RUN_ID, emitted_at: "09:41:03", offset_ms: 300, step_number: 1, artifact_url: "/artifacts/step-1.png" },
  { event_type: "step.passed", run_id: RUN_ID, emitted_at: "09:41:04", offset_ms: 400, step_number: 1 },

  { event_type: "step.started", run_id: RUN_ID, emitted_at: "09:41:05", offset_ms: 500, step_number: 2, step_title: "Login" },
  { event_type: "action.executed", run_id: RUN_ID, emitted_at: "09:41:06", offset_ms: 600, step_number: 2, action_id: "act-2-3", action_description: "button Log In" },
  { event_type: "step.passed", run_id: RUN_ID, emitted_at: "09:41:07", offset_ms: 700, step_number: 2 },

  { event_type: "step.started", run_id: RUN_ID, emitted_at: "09:41:08", offset_ms: 800, step_number: 3, step_title: "Search Product" },
  { event_type: "action.executed", run_id: RUN_ID, emitted_at: "09:41:09", offset_ms: 900, step_number: 3, action_id: "act-3-2", action_description: "link Wireless Headphones" },
  { event_type: "step.passed", run_id: RUN_ID, emitted_at: "09:41:09", offset_ms: 1000, step_number: 3 },

  { event_type: "step.started", run_id: RUN_ID, emitted_at: "09:41:10", offset_ms: 1100, step_number: 4, step_title: "Add Product to Cart" },
  { event_type: "action.executed", run_id: RUN_ID, emitted_at: "09:41:10", offset_ms: 1200, step_number: 4, action_id: "act-4-1", action_description: "button Add to Cart" },
  { event_type: "step.passed", run_id: RUN_ID, emitted_at: "09:41:10", offset_ms: 1300, step_number: 4 },

  { event_type: "step.started", run_id: RUN_ID, emitted_at: "09:41:11", offset_ms: 1400, step_number: 5, step_title: "Complete Checkout" },
  { event_type: "action.executed", run_id: RUN_ID, emitted_at: "09:41:12", offset_ms: 1500, step_number: 5, action_id: "act-5-3", action_description: "button Place Order" },
  { event_type: "action.executed", run_id: RUN_ID, emitted_at: "09:41:13", offset_ms: 1600, step_number: 5, action_id: "act-5-4", action_description: "POST /api/orders → pending" },
  { event_type: "screenshot.created", run_id: RUN_ID, emitted_at: "09:41:14", offset_ms: 1700, step_number: 5, artifact_url: "/artifacts/step-5-failure.png" },
  { event_type: "step.failed", run_id: RUN_ID, emitted_at: "09:41:18", offset_ms: 1800, step_number: 5 },

  { event_type: "analysis.started", run_id: RUN_ID, emitted_at: "09:41:18", offset_ms: 1900 },
  { event_type: "analysis.finished", run_id: RUN_ID, emitted_at: "09:41:21", offset_ms: 2000 },
  { event_type: "run.completed", run_id: RUN_ID, emitted_at: "09:41:21", offset_ms: 2100, run_status: "failed" },
];
