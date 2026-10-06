import { liveEventSchema } from "./live-event.schema";
import { mapLiveEvent, type LiveEvent } from "./map-live-event";
import { fixtureLiveTimeline } from "@/test/fixtures/live-timeline";

export interface LiveRunEmitterOptions {
  intervalMs?: number;
  onEvent: (event: LiveEvent) => void;
  onEnded: () => void;
}

/**
 * Replays the fixture timeline one event at a time. Stands in for the server-sent
 * event stream until the backend exists; the parse + map path is identical.
 */
export function startLiveRunEmitter(runId: string, options: LiveRunEmitterOptions): () => void {
  const { intervalMs = 400, onEvent, onEnded } = options;
  const timeline = fixtureLiveTimeline.filter((raw) => raw.run_id === runId);
  let cursor = 0;

  const timer = setInterval(() => {
    const raw = timeline[cursor];
    if (raw === undefined) {
      clearInterval(timer);
      onEnded();
      return;
    }
    cursor += 1;
    onEvent(mapLiveEvent(liveEventSchema.parse(raw)));
    if (cursor >= timeline.length) {
      clearInterval(timer);
      onEnded();
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
