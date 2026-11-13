import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { useRunEvents } from "./use-run-events";

const mocks = vi.hoisted(() => ({ runEventsUrl: vi.fn(() => "https://api.example.test/events") }));
vi.mock("@/features/workspace/workspace-api", () => ({ workspaceApi: { runEventsUrl: mocks.runEventsUrl } }));

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  readonly withCredentials: boolean;
  readonly url: string;
  readonly handlers = new Map<string, EventListener>();
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.withCredentials = !!options?.withCredentials;
    FakeEventSource.instances.push(this);
  }
  addEventListener(type: string, handler: EventListener) { this.handlers.set(type, handler); }
  emit(type: string) { this.handlers.get(type)?.(new Event(type)); }
}

afterEach(() => { vi.unstubAllGlobals(); FakeEventSource.instances = []; });

it("subscribes with cookies, refreshes canonical data, and closes when the run ends", async () => {
  vi.stubGlobal("EventSource", FakeEventSource);
  const client = new QueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const view = renderHook(({ active }) => useRunEvents("project-a", "environment-a", "run-a", active), {
    wrapper, initialProps: { active: true },
  });
  const stream = FakeEventSource.instances[0]!;
  expect(stream.url).toBe("https://api.example.test/events");
  expect(stream.withCredentials).toBe(true);
  act(() => { stream.onopen?.(); stream.emit("execution"); });
  expect(view.result.current).toBe("live");
  await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["workspace", "project-a", "runs", "environment-a", "run-a"] }));
  view.rerender({ active: false });
  expect(stream.close).toHaveBeenCalledOnce();
  expect(view.result.current).toBe("unavailable");
});
