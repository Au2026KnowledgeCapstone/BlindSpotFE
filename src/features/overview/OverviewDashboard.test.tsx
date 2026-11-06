import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OverviewDashboard } from "./OverviewDashboard";
import { mapRun } from "@/features/runs";
import { fixtureSeedRuns } from "@/test/fixtures";

const runs = fixtureSeedRuns.map(mapRun);

describe("OverviewDashboard", () => {
  it("shows the regression alert before the recent runs table", () => {
    render(<OverviewDashboard runs={runs} />);

    const regressionHeading = screen.getByRole("heading", { name: /^Regressions$/i });
    const runsHeading = screen.getByRole("heading", { name: /^Recent runs$/i });

    expect(regressionHeading.compareDocumentPosition(runsHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("names the actual regressing flow rather than a fixed sentence", () => {
    const regressing = runs.find((r) => r.status === "regression");
    expect(regressing).toBeDefined();

    render(<OverviewDashboard runs={runs} />);
    const section = within(screen.getByTestId("regressions"));

    expect(section.getByText(regressing!.flowName)).toBeInTheDocument();
    expect(section.getByText(`#${regressing!.runNumber}`)).toBeInTheDocument();
    // pr_preview is rendered as plain English, not as the stored enum value.
    expect(section.getByText("PR preview")).toBeInTheDocument();
  });

  it("renders one regression entry per regressing run", () => {
    const regressing = runs.filter((r) => r.status === "regression");
    render(<OverviewDashboard runs={runs} />);
    const section = within(screen.getByTestId("regressions"));

    expect(section.getAllByRole("status")).toHaveLength(regressing.length);
  });

  it("never renders a healed pass as a plain pass", () => {
    render(<OverviewDashboard runs={runs} />);
    expect(screen.getByText("Passed · healed")).toBeInTheDocument();
  });
});
