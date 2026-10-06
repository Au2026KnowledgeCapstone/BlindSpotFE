import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OverviewDashboard } from "./OverviewDashboard";
import { mapRun } from "@/features/runs";
import { fixtureSeedRuns } from "@/test/fixtures";

const runs = fixtureSeedRuns.map(mapRun);

describe("OverviewDashboard", () => {
  it("shows the regression alert before the recent runs table", () => {
    render(<OverviewDashboard runs={runs} />);

    const regressionHeading = screen.getByText(/Regressions & Alerts/i);
    const runsHeading = screen.getByText(/Recent Runs/i);

    expect(regressionHeading.compareDocumentPosition(runsHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByText(/Regression detected/i)).toBeInTheDocument();
  });

  it("never renders a healed pass as a plain pass", () => {
    render(<OverviewDashboard runs={runs} />);
    expect(screen.getByText("Passed · healed")).toBeInTheDocument();
  });
});
