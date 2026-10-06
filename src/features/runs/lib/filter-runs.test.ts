import { describe, expect, it } from "vitest";
import { filterRuns } from "./filter-runs";
import { mapRun } from "../api/map-run";
import { fixtureSeedRuns } from "@/test/fixtures";

const runs = fixtureSeedRuns.map(mapRun);
const NO_FILTERS = { environment: null, trigger: null, status: null };

describe("filterRuns", () => {
  it("returns every run when no filter is set", () => {
    expect(filterRuns(runs, NO_FILTERS)).toHaveLength(runs.length);
  });

  it("narrows by environment", () => {
    const result = filterRuns(runs, { ...NO_FILTERS, environment: "production" });
    expect(result).toHaveLength(1);
    expect(result[0]?.environment).toBe("production");
  });

  it("narrows by status", () => {
    expect(filterRuns(runs, { ...NO_FILTERS, status: "regression" })).toHaveLength(1);
  });

  it("combines filters as AND", () => {
    expect(filterRuns(runs, { ...NO_FILTERS, environment: "production", status: "regression" })).toHaveLength(0);
  });
});
