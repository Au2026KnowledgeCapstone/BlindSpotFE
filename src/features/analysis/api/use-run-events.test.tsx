import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { useRunEvents } from "./use-run-events";

const mocks = vi.hoisted(() => ({
  runEventsUrl: vi.fn(() => "https://api.example.test/events"),
  getUser: vi.fn(),
}));
vi.mock("@/features/workspace/workspace-api", () => ({ workspaceApi: { runEventsUrl: mocks.runEventsUrl } }));
vi.mock("@/features/auth", () => ({ backendAuth: { getUser: mocks.getUser } }));

class FakeEventSource {
  static CLOSED = 2;
  static instances: FakeEventSource[] = [];
  readyState = 0;
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
  emit(type: string, lastEventId = "") { this.handlers.get(type)?.(new MessageEvent(type, { lastEventId })); }
  failTerminally() { this.readyState = FakeEventSource.CLOSED; this.onerror?.(); }
}

afterEach(() => { vi.unstubAllGlobals(); FakeEventSource.instances = []; mocks.getUser.mockReset(); });

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

it("lets native reconnects run and resumes a terminal connection once from the last event ID", async () => {
  vi.stubGlobal("EventSource", FakeEventSource);
  mocks.getUser.mockResolvedValue({ id: "user" });
  const client = new QueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const view = renderHook(() => useRunEvents("project-a", "environment-a", "run-a", true), { wrapper });
  const stream = FakeEventSource.instances[0]!;
  act(() => { stream.emit("execution", "7"); stream.onerror?.(); });
  expect(mocks.getUser).not.toHaveBeenCalled();
  await act(async () => stream.failTerminally());
  const replacement = FakeEventSource.instances[1]!;
  expect(replacement.url).toBe("https://api.example.test/events?after=7");
  expect(stream.close).toHaveBeenCalledOnce();
  act(() => replacement.emit("execution", "7"));
  expect(invalidate).toHaveBeenCalledTimes(1);
  await act(async () => replacement.failTerminally());
  expect(view.result.current).toBe("unavailable");
  expect(mocks.getUser).toHaveBeenCalledOnce();
  expect(FakeEventSource.instances).toHaveLength(2);
});

it("does not reconnect if the session check fails or after the stream is disposed", async () => {
  vi.stubGlobal("EventSource", FakeEventSource);
  const client = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  mocks.getUser.mockRejectedValueOnce(new Error("offline"));
  const first = renderHook(() => useRunEvents("project-a", "environment-a", "run-a", true), { wrapper });
  await act(async () => FakeEventSource.instances[0]!.failTerminally());
  expect(first.result.current).toBe("unavailable");
  expect(FakeEventSource.instances).toHaveLength(1);
  first.unmount();

  let finish!: (user: { id: string }) => void;
  mocks.getUser.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  const second = renderHook(() => useRunEvents("project-a", "environment-a", "run-a", true), { wrapper });
  act(() => FakeEventSource.instances[1]!.failTerminally());
  second.unmount();
  await act(async () => finish({ id: "user" }));
  expect(FakeEventSource.instances).toHaveLength(2);
});
