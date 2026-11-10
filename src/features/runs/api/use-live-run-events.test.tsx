import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLiveRunEvents } from "./use-live-run-events";
import { fixtureLiveTimeline } from "@/test/fixtures/live-timeline";

describe("useLiveRunEvents", () => {
  it("reports unavailable without inventing production events or completion", () => {
    const { result } = renderHook(() => useLiveRunEvents("run-4821"));
    expect(result.current.streamState).toBe("unavailable");
    expect(result.current.events).toEqual([]);
    expect(result.current.runStatus).toBeNull();
  });

  it("derives state from explicitly injected test events", () => {
    const events = fixtureLiveTimeline.map((raw) => ({
      runId: raw.run_id,
      eventType: raw.event_type,
      emittedAt: raw.emitted_at,
      offsetMs: raw.offset_ms,
      ...(raw.step_number !== undefined && { stepNumber: raw.step_number }),
      ...(raw.run_status !== undefined && { runStatus: raw.run_status }),
    }));
    const { result } = renderHook(() => useLiveRunEvents("run-4821", { events }));
    expect(result.current.events).toHaveLength(events.length);
    expect(result.current.runStatus).toBe("failed");
    expect(result.current.streamState).toBe("unavailable");
  });
});
