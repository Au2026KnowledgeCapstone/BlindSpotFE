"use client";

import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { startLiveRunEmitter } from "./live-run-emitter";
import type { LiveEvent } from "./map-live-event";

export type StreamState = "connecting" | "live" | "reconnecting" | "ended";

export interface LiveRunEventsResult {
  events: LiveEvent[];
  streamState: StreamState;
}

export function liveRunEventsKey(runId: string) {
  return ["live-run-events", runId] as const;
}

export interface UseLiveRunEventsOptions {
  intervalMs?: number;
}

export function useLiveRunEvents(
  runId: string,
  options: UseLiveRunEventsOptions = {}
): LiveRunEventsResult {
  const queryClient = useQueryClient();
  const [streamState, setStreamState] = useState<StreamState>("connecting");
  const { intervalMs } = options;

  const { data: events = [] } = useQuery<LiveEvent[]>({
    queryKey: liveRunEventsKey(runId),
    queryFn: () => [],
    staleTime: Infinity,
  });

  // sync: mock server-sent event stream for run `runId`
  useEffect(() => {
    queryClient.setQueryData<LiveEvent[]>(liveRunEventsKey(runId), []);
    setStreamState("connecting");

    const stop = startLiveRunEmitter(runId, {
      ...(intervalMs !== undefined && { intervalMs }),
      onEvent: (event) => {
        setStreamState("live");
        queryClient.setQueryData<LiveEvent[]>(liveRunEventsKey(runId), (prev) => [
          ...(prev ?? []),
          event,
        ]);
      },
      onEnded: () => setStreamState("ended"),
    });

    return stop;
  }, [runId, intervalMs, queryClient]);

  return { events, streamState };
}
