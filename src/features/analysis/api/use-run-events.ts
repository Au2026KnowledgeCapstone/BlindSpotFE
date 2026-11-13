"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "@/features/workspace/workspace-api";

export type RunStreamState = "connecting" | "live" | "reconnecting" | "unavailable";

/** BE sends durable, named SSE events; refetch the canonical run and results on each one. */
export function useRunEvents(projectId: string, environmentId: string | undefined, runId: string, active: boolean): RunStreamState {
  const cache = useQueryClient();
  const [state, setState] = useState<RunStreamState>("unavailable");

  useEffect(() => {
    if (!environmentId || !active || typeof EventSource === "undefined") return;
    let stream: EventSource;
    try {
      stream = new EventSource(workspaceApi.runEventsUrl(projectId, environmentId, runId), { withCredentials: true });
    } catch {
      return;
    }
    const refresh = () => {
      void cache.invalidateQueries({ queryKey: ["workspace", projectId, "runs", environmentId, runId] });
    };
    stream.addEventListener("execution", refresh);
    stream.addEventListener("usage", refresh);
    stream.addEventListener("finalization", refresh);
    stream.onopen = () => setState("live");
    stream.onerror = () => setState("reconnecting");
    return () => {
      stream.close();
      setState("unavailable");
    };
  }, [active, cache, environmentId, projectId, runId]);

  return active && environmentId ? (state === "unavailable" ? "connecting" : state) : "unavailable";
}
