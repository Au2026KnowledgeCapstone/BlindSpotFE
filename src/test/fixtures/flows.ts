import type { FlowSnakeCase } from "@/features/flows";

export function makeFlow(overrides?: Partial<FlowSnakeCase>): FlowSnakeCase {
  return {
    id: "flow-checkout",
    project_id: "acme-corp",
    name: "Checkout Flow",
    description: "End to end cart purchase flow",
    goal: "User completes checkout successfully",
    status: "active",
    feature_area: "Commerce",
    steps: [
      { id: "step-1", title: "Add to cart", expectedOutcome: "Cart count increments", order: 1, type: "action" },
    ],
    settings: { environment: "staging", schedule: "on_pr", credentialsReference: "vault://creds" },
    history: [
      { id: "r1", status: "passed" },
      { id: "r2", status: "passed" },
      { id: "r3", status: "passed_healed" },
      { id: "r4", status: "regression" },
    ],
    last_status: "regression",
    last_run_at: "12m ago",
    ...overrides,
  };
}

export const fixtureSeedFlows: FlowSnakeCase[] = [
  makeFlow(),
  makeFlow({
    id: "flow-signup",
    name: "Signup & Onboarding",
    feature_area: "Accounts",
    last_status: "passed",
    last_run_at: "2h ago",
    history: [
      { id: "s1", status: "passed" },
      { id: "s2", status: "passed" },
    ],
  }),
];
