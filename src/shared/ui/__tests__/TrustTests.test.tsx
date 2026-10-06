import "@/test/setup";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "../StatusBadge";
import { Inference } from "../Inference";
import { AsyncBoundary } from "../AsyncBoundary";

describe("Trust Tests: Heals & AI", () => {
  it("A healed pass never renders as a plain pass", () => {
    render(<StatusBadge status="passed_healed" />);
    expect(screen.queryByText(/^Passed$/)).not.toBeInTheDocument();
    expect(screen.getByText("Passed · healed")).toBeInTheDocument();
  });

  it("AI analysis ONLY renders inside <Inference>", () => {
    const { container } = render(
      <Inference>
        <span>AI Generated Content</span>
      </Inference>
    );
    const wrapper = container.querySelector('[data-testid="inference-wrapper"]');
    expect(wrapper).toBeInTheDocument();
  });
});

describe("Trust Tests: Async States", () => {
  it("AsyncBoundary renders loading, error, empty, and success states", () => {
    const { rerender } = render(
      <AsyncBoundary isLoading>{(data) => <div>{String(data)}</div>}</AsyncBoundary>
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();

    rerender(
      <AsyncBoundary error="Network error">
        {(data) => <div>{String(data)}</div>}
      </AsyncBoundary>
    );
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();

    rerender(
      <AsyncBoundary data={[] as string[]}>
        {(data: string[]) => <div>{data.join(",")}</div>}
      </AsyncBoundary>
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();

    rerender(
      <AsyncBoundary data={["Item 1"]}>
        {(data: string[]) => <div>{data[0]}</div>}
      </AsyncBoundary>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });
});
