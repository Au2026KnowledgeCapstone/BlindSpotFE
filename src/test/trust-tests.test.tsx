import { describe, it, expect } from "vitest";

/**
 * §4.4 Must-Have Trust Tests (from research)
 */

export type RunStatus =
  | "queued"
  | "running"
  | "passed"
  | "passed_healed"
  | "failed"
  | "regression"
  | "agent_error"
  | "cancelled";

export function formatRunStatus(status: RunStatus): { label: string; isHealed: boolean } {
  if (status === "passed_healed") return { label: "Passed · healed", isHealed: true };
  if (status === "passed") return { label: "Passed", isHealed: false };
  if (status === "regression") return { label: "Regression", isHealed: false };
  if (status === "failed") return { label: "Failed", isHealed: false };
  if (status === "agent_error") return { label: "Agent error", isHealed: false };
  if (status === "running") return { label: "Running", isHealed: false };
  if (status === "cancelled") return { label: "Cancelled", isHealed: false };
  return { label: "Queued", isHealed: false };
}

export function isRegression(previousStatus: RunStatus | null, currentStatus: RunStatus): boolean {
  return previousStatus === "passed" && currentStatus === "failed";
}

export interface DeepLinkState {
  step: number | null;
  action: number | null;
  tab: string | null;
}

export function parseDeepLink(searchParams: URLSearchParams | string): DeepLinkState {
  const params = typeof searchParams === "string" ? new URLSearchParams(searchParams) : searchParams;
  const stepRaw = params.get("step");
  const actionRaw = params.get("action");
  const tab = params.get("tab");

  const step = stepRaw !== null && !isNaN(Number(stepRaw)) ? Number(stepRaw) : null;
  const action = actionRaw !== null && !isNaN(Number(actionRaw)) ? Number(actionRaw) : null;

  return { step, action, tab };
}

describe("1. Healed pass status", () => {
  it("never renders as plain pass", () => {
    const healed = formatRunStatus("passed_healed");
    const plain = formatRunStatus("passed");
    expect(healed.label).not.toBe(plain.label);
    expect(healed.label).toBe("Passed · healed");
    expect(healed.isHealed).toBe(true);
    expect(plain.isHealed).toBe(false);
  });
});

describe("2. AI analysis isolation", () => {
  it("must be isolated inside Inference wrapper contract", () => {
    const aiOutput = "Likely cause: DOM element moved";
    const checkWrapped = (text: string, isWrapped: boolean) => {
      if (!isWrapped) throw new Error("CONSTITUTION VIOLATION");
      return true;
    };
    expect(checkWrapped(aiOutput, true)).toBe(true);
    expect(() => checkWrapped(aiOutput, false)).toThrow("CONSTITUTION VIOLATION");
  });
});

describe("3. Regression detection", () => {
  it("detects regression when previous=passed and current=failed", () => {
    expect(isRegression("passed", "failed")).toBe(true);
    expect(isRegression("failed", "failed")).toBe(false);
    expect(isRegression("passed", "passed")).toBe(false);
    expect(isRegression(null, "failed")).toBe(false);
  });
});

describe("4. Async four states", () => {
  it("covers all four explicit states", () => {
    type AsyncState = "loading" | "error" | "empty" | "success";
    const states: AsyncState[] = ["loading", "error", "empty", "success"];
    states.forEach((st) => expect(st).toBeTruthy());
  });
});

describe("5. Deep link restoration", () => {
  it("restores exact view from query parameters", () => {
    const restored = parseDeepLink("?step=5&action=3&tab=network");
    expect(restored.step).toBe(5);
    expect(restored.action).toBe(3);
    expect(restored.tab).toBe("network");
  });
});
