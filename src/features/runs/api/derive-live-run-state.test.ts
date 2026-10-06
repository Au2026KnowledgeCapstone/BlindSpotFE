import { describe, it, expect } from "vitest";
import { deriveLiveRunState, mapLiveEvent, liveEventSchema } from "@/features/runs";
import { fixtureLiveTimeline } from "@/test/fixtures/live-timeline";

const allEvents = fixtureLiveTimeline.map((raw) => mapLiveEvent(liveEventSchema.parse(raw)));

describe("deriveLiveRunState", () => {
  it("is idle with no events", () => {
    const state = deriveLiveRunState([]);
    expect(state.currentStepNumber).toBeNull();
    expect(state.analysisState).toBe("idle");
    expect(state.runStatus).toBeNull();
  });

  it("tracks the active step while it runs", () => {
    const upToStep5Start = allEvents.slice(0, allEvents.findIndex((e) => e.stepNumber === 5) + 1);
    expect(deriveLiveRunState(upToStep5Start).currentStepNumber).toBe(5);
  });

  it("clears the active step once it resolves", () => {
    const throughStep1 = allEvents.slice(0, 5);
    const state = deriveLiveRunState(throughStep1);
    expect(state.currentStepNumber).toBeNull();
    expect(state.passedStepNumbers).toContain(1);
  });

  it("surfaces the analysis phase separately from the failure", () => {
    const beforeAnalysis = allEvents.filter((e) => e.eventType !== "analysis.started" && e.eventType !== "analysis.finished" && e.eventType !== "run.completed");
    expect(deriveLiveRunState(beforeAnalysis).analysisState).toBe("idle");

    const duringAnalysis = allEvents.slice(0, allEvents.findIndex((e) => e.eventType === "analysis.finished"));
    expect(deriveLiveRunState(duringAnalysis).analysisState).toBe("running");

    expect(deriveLiveRunState(allEvents).analysisState).toBe("finished");
  });

  it("ends on run.completed with the terminal status, not running", () => {
    const state = deriveLiveRunState(allEvents);
    expect(state.runStatus).toBe("failed");
    expect(state.currentStepNumber).toBeNull();
    expect(state.failedStepNumbers).toEqual([5]);
  });
});
