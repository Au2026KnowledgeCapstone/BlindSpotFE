"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { backendAuth } from "@/features/auth";

export type RunStreamState = "connecting" | "live" | "reconnecting" | "unavailable";

/** BE sends durable, named SSE events; refetch the canonical run and results on each one. */
export function useRunEvents(projectId: string, environmentId: string | undefined, runId: string, active: boolean): RunStreamState {
  const cache = useQueryClient();
  const [state, setState] = useState<RunStreamState>("unavailable");

  useEffect(() => {
    if (!environmentId || !active || typeof EventSource === "undefined") return;
    let stream: EventSource | undefined;
    let disposed = false;
    let cursor = 0n;
    let attemptedRecovery = false;

    function connect(url: URL) {
      try {
        if (cursor > 0n) url.searchParams.set("after", cursor.toString());
        const connection = new EventSource(url.href, { withCredentials: true });
        stream = connection;
        const refresh = (event: MessageEvent) => {
          if (stream !== connection) return;
          if (/^\d+$/.test(event.lastEventId)) {
            const id = BigInt(event.lastEventId);
            if (id <= cursor) return;
            cursor = id;
            attemptedRecovery = false;
          }
          void cache.invalidateQueries({ queryKey: ["workspace", projectId, "runs", environmentId, runId] });
        };
        connection.addEventListener("execution", refresh);
        connection.addEventListener("usage", refresh);
        connection.addEventListener("finalization", refresh);
        connection.onopen = () => { if (stream === connection) setState("live"); };
        connection.onerror = () => {
          if (stream !== connection) return;
          setState("reconnecting");
          // Native EventSource owns ordinary reconnects and their Last-Event-ID.
          // A terminal failure hides its HTTP status, so verify the session once.
          if (connection.readyState !== EventSource.CLOSED) return;
          connection.close();
          stream = undefined;
          if (attemptedRecovery) { setState("unavailable"); return; }
          attemptedRecovery = true;
          void backendAuth.getUser().then((user) => {
            if (disposed) return;
            if (user) connect(url);
            else setState("unavailable");
          }).catch(() => { if (!disposed) setState("unavailable"); });
        };
      } catch {
        setState("unavailable");
      }
    }

    try {
      setState("connecting");
      connect(new URL(workspaceApi.runEventsUrl(projectId, environmentId, runId)));
    } catch {
      setState("unavailable");
    }
    return () => {
      disposed = true;
      stream?.close();
      stream = undefined;
      setState("unavailable");
    };
  }, [active, cache, environmentId, projectId, runId]);

  return active && environmentId ? state : "unavailable";
}
