import type { FlowListRow } from "../components/FlowsList";

// ponytail: fixture rows until the backend exists; same shape the mapper will return.
export const SEED_FLOWS: FlowListRow[] = [
  {
    id: "flow-checkout",
    name: "Checkout Flow",
    featureArea: "Commerce",
    lastStatus: "Failed",
    lastRunAt: "12m ago",
    history: [
      { id: "r1", status: "passed" },
      { id: "r2", status: "passed" },
      { id: "r3", status: "passed_healed" },
      { id: "r4", status: "failed" },
      { id: "r5", status: "regression" },
    ],
  },
  {
    id: "flow-signup",
    name: "Signup & Onboarding",
    featureArea: "Accounts",
    lastStatus: "Passed",
    lastRunAt: "2h ago",
    history: [
      { id: "s1", status: "passed" },
      { id: "s2", status: "passed" },
      { id: "s3", status: "passed" },
    ],
  },
];
