import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HealsQueue } from "./HealsQueue";
import { Providers } from "@/app/providers";

describe("HealsQueue", () => {
  it("accepting a heal marks the source run as healed via StatusBadge", async () => {
    render(
      <Providers>
        <HealsQueue projectId="acme-corp" />
      </Providers>,
    );

    const row = await screen.findByTestId("heal-heal-4819-3");
    fireEvent.click(within(row).getByRole("button", { name: "Accept" }));

    await waitFor(() => {
      expect(within(row).getByText("Passed · healed")).toBeInTheDocument();
    });
    expect(within(row).queryByRole("button", { name: "Accept" })).toBeNull();
  });

  it("rejecting a heal turns the source run into a failure status badge", async () => {
    render(
      <Providers>
        <HealsQueue projectId="acme-corp" />
      </Providers>,
    );

    const row = await screen.findByTestId("heal-heal-4820-2");
    fireEvent.click(within(row).getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(within(row).getByText("Failed")).toBeInTheDocument();
    });
  });
});
