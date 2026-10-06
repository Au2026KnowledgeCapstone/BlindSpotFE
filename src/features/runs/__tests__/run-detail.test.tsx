import "@/test/setup";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, beforeAll } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { RunDetailContent } from "@/app/(app)/projects/[projectId]/runs/[runId]/run-detail-content";

function renderRunDetail(search: string) {
  window.history.replaceState({}, "", `/projects/acme-corp/runs/run-4821${search}`);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <RunDetailContent runId="run-4821" />
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

beforeAll(() => {
  // ScreenshotFrame renders a plain <img>; jsdom never loads the data URI.
  Object.defineProperty(HTMLImageElement.prototype, "complete", { value: true });
});

describe("RunDetailContent deep links", () => {
  it("lands on the failing action and shows its screenshot", async () => {
    renderRunDetail("?step=step-5&action=act-5-6&tab=network");

    const stepsPane = await screen.findByRole("region", { name: /steps and actions/i });
    const failingAction = within(stepsPane).getByRole("button", {
      name: /Complete Checkout failed/,
    });
    expect(failingAction).toHaveAttribute("aria-current", "true");

    const evidence = screen.getByRole("region", { name: /evidence viewer/i });
    expect(within(evidence).getByText(/Action: FAIL_STEP/)).toBeInTheDocument();
    expect(within(evidence).getByAltText("Step screenshot")).toBeInTheDocument();
  });

  it("defaults to the failing step when the URL carries no step", async () => {
    renderRunDetail("");

    const stepsPane = await screen.findByRole("region", { name: /steps and actions/i });
    expect(
      within(stepsPane).getByRole("button", { name: /5\.\s*Complete Checkout/ })
    ).toHaveAttribute("aria-current", "true");
  });

  it("opens the tab named in the URL", async () => {
    renderRunDetail("?tab=console");

    expect(await screen.findByRole("tab", { name: /console/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});

describe("AI output containment (§4.4)", () => {
  it("renders AI analysis only inside Inference", async () => {
    renderRunDetail("?tab=ai");

    const cause = await screen.findByText(
      /Backend orders service encountered an unexpected error/
    );
    const wrappers = screen.getAllByTestId("inference-wrapper");
    expect(wrappers.some((w) => w.contains(cause))).toBe(true);

    // Every rendered AI string must sit inside an Inference wrapper.
    const suggestion = screen.getByText(/Check backend order-service logs/);
    expect(wrappers.some((w) => w.contains(suggestion))).toBe(true);
  });

  it("states application defect vs agent error explicitly", async () => {
    renderRunDetail("");
    expect(await screen.findByText("Application defect")).toBeInTheDocument();
  });

  it("shows the regression last-passing to first-failing line", async () => {
    renderRunDetail("");
    expect(await screen.findByText("Regression")).toBeInTheDocument();
    // Written as regexes: a "#NNNN" string literal trips the no-hex-colour rule.
    expect(screen.getByText(/^#4820$/)).toBeInTheDocument();
    expect(screen.getAllByText(/^#4821$/).length).toBeGreaterThan(0);
  });
});
