import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLiveRunEvents } from "./use-live-run-events";
import { fixtureLiveTimeline } from "@/test/fixtures/live-timeline";

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useLiveRunEvents", () => {
  let client: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers();
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  afterEach(() => {
    vi.useRealTimers();
    client.clear();
  });

  it("starts in connecting with no events", () => {
    const { result } = renderHook(() => useLiveRunEvents("run-4821"), { wrapper: wrapperFor(client) });
    expect(result.current.streamState).toBe("connecting");
    expect(result.current.events).toHaveLength(0);
  });

  it("delivers events incrementally and goes live", () => {
    const { result } = renderHook(() => useLiveRunEvents("run-4821", { intervalMs: 10 }), {
      wrapper: wrapperFor(client),
    });

    act(() => void vi.advanceTimersByTime(10));
    expect(result.current.streamState).toBe("live");
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]?.eventType).toBe("run.started");

    act(() => void vi.advanceTimersByTime(20));
    expect(result.current.events).toHaveLength(3);
  });

  it("ends after run.completed and keeps the whole timeline", () => {
    const { result } = renderHook(() => useLiveRunEvents("run-4821", { intervalMs: 10 }), {
      wrapper: wrapperFor(client),
    });

    act(() => void vi.advanceTimersByTime(10 * fixtureLiveTimeline.length));

    expect(result.current.streamState).toBe("ended");
    expect(result.current.events).toHaveLength(fixtureLiveTimeline.length);
    expect(result.current.events.at(-1)?.eventType).toBe("run.completed");
  });

  it("writes events into the query cache only", () => {
    renderHook(() => useLiveRunEvents("run-4821", { intervalMs: 10 }), { wrapper: wrapperFor(client) });
    act(() => void vi.advanceTimersByTime(20));

    const cached = client.getQueryData(["live-run-events", "run-4821"]);
    expect(Array.isArray(cached)).toBe(true);
    expect(cached).toHaveLength(2);
  });
});
