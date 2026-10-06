import "@/test/setup";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActionBadge } from "../ActionBadge";
import { ExpectedObserved } from "../ExpectedObserved";
import { EvidencePanel } from "../EvidencePanel";
import { StabilityStrip } from "../StabilityStrip";
import { CostChip } from "../CostChip";
import { ScreenshotFrame } from "../ScreenshotFrame";

describe("ActionBadge & ExpectedObserved", () => {
  it("renders ActionBadge", () => {
    render(<ActionBadge action="CLICK" />);
    expect(screen.getByText("CLICK")).toBeInTheDocument();
  });

  it("renders ExpectedObserved", () => {
    render(<ExpectedObserved expected="200 OK" observed="500 Internal Error" />);
    expect(screen.getByText("Expected")).toBeInTheDocument();
    expect(screen.getByText("Observed")).toBeInTheDocument();
  });
});

describe("EvidencePanel & ScreenshotFrame", () => {
  it("renders EvidencePanel", () => {
    render(
      <EvidencePanel title="Console output" rawTextToCopy="error line 1">
        <code>error line 1</code>
      </EvidencePanel>
    );
    expect(screen.getByText("Console output")).toBeInTheDocument();
  });

  it("renders ScreenshotFrame", () => {
    render(<ScreenshotFrame url="https://example.com" />);
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });
});

describe("StabilityStrip & CostChip", () => {
  it("renders StabilityStrip", () => {
    render(<StabilityStrip runs={[{ id: "1", status: "passed" }]} />);
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("renders CostChip", () => {
    render(<CostChip durationSeconds={14.6} actionsCount={23} estimatedCostUsd={0.12} />);
    expect(screen.getByText("⏱ 14.6s")).toBeInTheDocument();
  });
});
