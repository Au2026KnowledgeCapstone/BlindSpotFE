import type { RunSnakeCase, TestStepRunSnakeCase, FailureSnakeCase } from "@/features/runs";

export function makeRun(overrides?: Partial<RunSnakeCase>): RunSnakeCase {
  return {
    id: "run-4821",
    run_number: 4821,
    project_id: "acme-corp",
    flow_id: "checkout-flow",
    flow_name: "Checkout Flow",
    environment: "staging",
    status: "failed",
    branch: "main",
    commit_sha: "def456",
    trigger: "pr_merge",
    started_at: "2026-09-15T09:41:02Z",
    duration_seconds: 14.6,
    action_count: 23,
    estimated_cost_usd: 0.12,
    execution_mode: "agentic",
    failure_id: "fail-4821-5",
    ...overrides,
  };
}

export const fixtureCheckoutSteps: TestStepRunSnakeCase[] = [
  {
    id: "step-1",
    run_id: "run-4821",
    step_number: 1,
    title: "Create Account",
    status: "passed",
    duration_ms: 3100,
    actions: [
      {
        id: "act-1-1",
        step_run_id: "step-1",
        timestamp: "09:41:02",
        badge_type: "NAVIGATE",
        description: "to /signup",
        reasoning: "Objective requires a new account.",
      },
      {
        id: "act-1-2",
        step_run_id: "step-1",
        timestamp: "09:41:03",
        badge_type: "FILL",
        description: 'textbox Email = "test+ci@acme.dev"',
      },
      {
        id: "act-1-3",
        step_run_id: "step-1",
        timestamp: "09:41:03",
        badge_type: "FILL",
        description: 'textbox Password = "••••••••"',
      },
      {
        id: "act-1-4",
        step_run_id: "step-1",
        timestamp: "09:41:04",
        badge_type: "CLICK",
        description: "button Create Account",
        result_text: "URL changed /signup → /account/welcome.",
        result_status: "ok",
      },
    ],
  },
  {
    id: "step-2",
    run_id: "run-4821",
    step_number: 2,
    title: "Login",
    status: "passed",
    duration_ms: 2400,
    actions: [
      { id: "act-2-1", step_run_id: "step-2", timestamp: "09:41:05", badge_type: "NAVIGATE", description: "to /login" },
      { id: "act-2-2", step_run_id: "step-2", timestamp: "09:41:06", badge_type: "FILL", description: "textbox Email, Password" },
      { id: "act-2-3", step_run_id: "step-2", timestamp: "09:41:07", badge_type: "CLICK", description: "button Log In", result_text: "Logged in", result_status: "ok" },
    ],
  },
  {
    id: "step-3",
    run_id: "run-4821",
    step_number: 3,
    title: "Search Product",
    status: "passed",
    duration_ms: 1600,
    actions: [
      { id: "act-3-1", step_run_id: "step-3", timestamp: "09:41:08", badge_type: "FILL", description: 'search "wireless headphones"' },
      { id: "act-3-2", step_run_id: "step-3", timestamp: "09:41:09", badge_type: "CLICK", description: "link Wireless Headphones", result_text: "Navigated", result_status: "ok" },
    ],
  },
  {
    id: "step-4",
    run_id: "run-4821",
    step_number: 4,
    title: "Add Product to Cart",
    status: "passed",
    duration_ms: 1300,
    actions: [
      { id: "act-4-1", step_run_id: "step-4", timestamp: "09:41:10", badge_type: "CLICK", description: "button Add to Cart" },
      { id: "act-4-2", step_run_id: "step-4", timestamp: "09:41:10", badge_type: "OBSERVE", description: "cart count 0 → 1", result_text: "Added", result_status: "ok" },
    ],
  },
  {
    id: "step-5",
    run_id: "run-4821",
    step_number: 5,
    title: "Complete Checkout",
    status: "failed",
    duration_ms: 6200,
    actions: [
      { id: "act-5-1", step_run_id: "step-5", timestamp: "09:41:11", badge_type: "CLICK", description: "button Checkout", result_text: "URL /checkout/payment", result_status: "ok" },
      { id: "act-5-2", step_run_id: "step-5", timestamp: "09:41:11", badge_type: "FILL", description: "payment details" },
      { id: "act-5-3", step_run_id: "step-5", timestamp: "09:41:12", badge_type: "CLICK", description: "button Place Order", reasoning: "Final action expecting confirmation." },
      { id: "act-5-4", step_run_id: "step-5", timestamp: "09:41:13", badge_type: "NETWORK", description: "POST /api/orders → pending" },
      { id: "act-5-5", step_run_id: "step-5", timestamp: "09:41:14", badge_type: "WAIT", description: "for navigation timeout", result_text: "Timeout 5s", result_status: "bad" },
      { id: "act-5-6", step_run_id: "step-5", timestamp: "09:41:17", badge_type: "FAIL_STEP", description: "Complete Checkout failed", reasoning: "POST /api/orders returned HTTP 500." },
    ],
  },
];

export const fixtureFailure: FailureSnakeCase = {
  id: "fail-4821-5",
  run_id: "run-4821",
  step_number: 5,
  expected: "POST /api/orders returns HTTP 200 and UI navigates.",
  observed: "POST /api/orders returned HTTP 500 Internal Server Error.",
  category: "application_defect",
  likely_cause: "Backend orders service encountered an unexpected error.",
  suggested_next_steps: ["Check backend order-service logs"],
  linked_evidence: ["network #3 (POST /api/orders → 500)"],
};

export const fixtureSeedRuns: RunSnakeCase[] = [
  makeRun(),
  makeRun({ id: "run-4820", run_number: 4820, status: "passed", environment: "production", failure_id: undefined }),
  makeRun({ id: "run-4819", run_number: 4819, status: "passed_healed", environment: "staging", failure_id: undefined }),
  makeRun({ id: "run-4818", run_number: 4818, status: "regression", environment: "pr_preview", pr_number: 482, failure_id: "fail-4818-3" }),
];
