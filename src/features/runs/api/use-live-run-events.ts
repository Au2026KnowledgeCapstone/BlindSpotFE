"use client";

import { deriveLiveRunState, type LiveRunState } from "./derive-live-run-state";
import type { LiveEvent } from "./map-live-event";

export type StreamState = "unavailable";

export interface LiveRunEventsResult extends LiveRunState {
  events: LiveEvent[];
  streamState: StreamState;
}

export interface UseLiveRunEventsOptions {
  events?: LiveEvent[];
}

export function useLiveRunEvents(
  _runId: string,
  { events = [] }: UseLiveRunEventsOptions = {}
): LiveRunEventsResult {
  return { events, streamState: "unavailable", ...deriveLiveRunState(events) };
}
