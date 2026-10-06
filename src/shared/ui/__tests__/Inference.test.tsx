import "@/test/setup";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Inference } from "../Inference";

describe("Inference", () => {
  it("renders AI analysis content and evidence links", () => {
    render(
      <Inference
        certainty="high"
        evidenceLinks={[{ label: "network #3" }, { label: "console #1" }]}
      >
        <p>Possible network timeout at gateway</p>
      </Inference>
    );

    expect(screen.getByText("AI analysis · likely cause")).toBeInTheDocument();
    expect(screen.getByText("Possible network timeout at gateway")).toBeInTheDocument();
    expect(screen.getByText("high certainty")).toBeInTheDocument();
    expect(screen.getByText("network #3")).toBeInTheDocument();
  });
});
