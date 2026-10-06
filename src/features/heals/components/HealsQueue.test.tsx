import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HealsQueue } from "./HealsQueue";

describe("HealsQueue", () => {
  it("accepting a heal marks the source run as healed, not a plain pass", () => {
    render(<HealsQueue />);
    const row = screen.getByTestId("heal-heal-01");

    fireEvent.click(within(row).getByRole("button", { name: "Accept" }));

    expect(within(row).getByText("Passed · healed")).toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: "Accept" })).toBeNull();
  });

  it("rejecting a heal turns the source run into a failure", () => {
    render(<HealsQueue />);
    const row = screen.getByTestId("heal-heal-02");

    fireEvent.click(within(row).getByRole("button", { name: "Reject" }));

    expect(within(row).getByText("Failed")).toBeInTheDocument();
  });
});
