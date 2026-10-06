import "@/test/setup";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders status label and icon for passed", () => {
    render(<StatusBadge status="passed" />);
    expect(screen.getByText("Passed")).toBeInTheDocument();
  });

  it("renders passed_healed with distinct text 'Passed · healed'", () => {
    render(<StatusBadge status="passed_healed" />);
    expect(screen.getByText("Passed · healed")).toBeInTheDocument();
  });

  it("renders compact mode with aria-label", () => {
    render(<StatusBadge status="failed" compact />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Failed");
  });
});
