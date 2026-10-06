import "@/test/setup";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { RunDetailContent } from "@/app/(app)/projects/[projectId]/runs/[runId]/run-detail-content";

function renderRunDetail(search = "") {
  window.history.replaceState({}, "", `/projects/acme-corp/runs/run-4821${search}`);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <RunDetailContent runId="run-4821" liveIntervalMs={10} />
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

describe("P4 Live Run UI", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(HTMLImageElement.prototype, "complete", { value: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("displays stream state badge and updates as events arrive", async () => {
    renderRunDetail();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    const streamBadge = screen.getByTestId("stream-state-badge");
    expect(streamBadge).toHaveTextContent(/live/i);
  });

  it("shows 'Analyzing failure...' banner when analysis is running", async () => {
    renderRunDetail();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(205);
    });
    expect(screen.getByText(/Analyzing failure…/i)).toBeInTheDocument();
  });

  it("toggles presentation mode with 32px readable labels", async () => {
    renderRunDetail();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    const presentationToggle = screen.getByRole("button", { name: /presentation mode/i });
    await act(async () => {
      presentationToggle.click();
    });
    expect(screen.getByRole("region", { name: /steps and actions/i })).toHaveClass("text-2xl");
  });

  it("turns into P3 layout in place when stream state is ended", async () => {
    renderRunDetail();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByTestId("stream-state-badge")).toHaveTextContent(/ended/i);
    expect(screen.getByRole("region", { name: /evidence viewer/i })).toBeInTheDocument();
  });
});
