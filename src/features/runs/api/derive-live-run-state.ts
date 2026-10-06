import type { LiveEvent } from "./map-live-event";
import type { Run } from "../types";

export type AnalysisState = "idle" | "running" | "finished";

export interface LiveRunState {
  currentStepNumber: number | null;
  passedStepNumbers: number[];
  failedStepNumbers: number[];
  analysisState: AnalysisState;
  runStatus: Run["status"] | null;
}

const ANALYSIS_MAP: Partial<Record<LiveEvent["eventType"], AnalysisState>> = {
  "analysis.started": "running",
  "analysis.finished": "finished",
};

function applyStepEvent(state: LiveRunState, event: LiveEvent): LiveRunState {
  const step = event.stepNumber;
  if (step === undefined) return state;

  if (event.eventType === "step.started") {
    return { ...state, currentStepNumber: step };
  }
  if (event.eventType === "step.passed") {
    return {
      ...state,
      passedStepNumbers: [...state.passedStepNumbers, step],
      currentStepNumber: step === state.currentStepNumber ? null : state.currentStepNumber,
    };
  }
  if (event.eventType === "step.failed") {
    return {
      ...state,
      failedStepNumbers: [...state.failedStepNumbers, step],
      currentStepNumber: step === state.currentStepNumber ? null : state.currentStepNumber,
    };
  }
  return state;
}

function applyRunEvent(state: LiveRunState, event: LiveEvent): LiveRunState {
  if (event.eventType === "run.started") {
    return { ...state, runStatus: event.runStatus ?? "running" };
  }
  if (event.eventType === "run.completed") {
    return { ...state, runStatus: event.runStatus ?? state.runStatus, currentStepNumber: null };
  }
  return state;
}

function applyEvent(state: LiveRunState, event: LiveEvent): LiveRunState {
  const analysisState = ANALYSIS_MAP[event.eventType] ?? state.analysisState;
  let next: LiveRunState = { ...state, analysisState };
  next = applyStepEvent(next, event);
  next = applyRunEvent(next, event);
  return next;
}

/**
 * Pure projection of the event log into the view state the live-run screen needs.
 * Same input always gives the same output: no time, no I/O.
 */
export function deriveLiveRunState(events: LiveEvent[]): LiveRunState {
  return events.reduce<LiveRunState>(applyEvent, {
    currentStepNumber: null,
    passedStepNumbers: [],
    failedStepNumbers: [],
    analysisState: "idle",
    runStatus: null,
  });
}
