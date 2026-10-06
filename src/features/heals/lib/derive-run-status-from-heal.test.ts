import { describe, expect, it } from "vitest";
import { deriveRunStatusFromHeal } from "./derive-run-status-from-heal";

describe("deriveRunStatusFromHeal", () => {
  it("accepting a heal never produces a plain pass", () => {
    expect(deriveRunStatusFromHeal("accepted")).toBe("passed_healed");
  });

  it("rejecting a heal turns the run into a failure", () => {
    expect(deriveRunStatusFromHeal("rejected")).toBe("failed");
  });
});
