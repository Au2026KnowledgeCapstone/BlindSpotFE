import { liveEventSchema } from "./live-event.schema";
import { mapLiveEvent, type LiveEvent } from "./map-live-event";

export interface LiveRunEmitterOptions {
  intervalMs?: number;
  events: unknown[];
  onEvent: (event: LiveEvent) => void;
  onEnded: () => void;
}

/** Test-only injected event replay; production has no live stream endpoint yet. */
export function startLiveRunEmitter(options: LiveRunEmitterOptions): () => void {
  const { intervalMs = 400, events, onEvent, onEnded } = options;
  let cursor = 0;
  const timer = setInterval(() => {
    const raw = events[cursor];
    if (raw === undefined) {
      clearInterval(timer);
      onEnded();
      return;
    }
    cursor += 1;
    onEvent(mapLiveEvent(liveEventSchema.parse(raw)));
    if (cursor >= events.length) {
      clearInterval(timer);
      onEnded();
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
