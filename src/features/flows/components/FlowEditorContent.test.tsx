import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { FlowEditorContent } from "./FlowEditorContent";

function renderEditor() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <FlowEditorContent projectId="acme-corp" />
    </QueryClientProvider>,
  );
}

function fillGoalAndGenerate(name: string, goal: string) {
  fireEvent.change(screen.getByLabelText(/Flow name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/^Goal$/i), { target: { value: goal } });
  fireEvent.click(screen.getByRole("button", { name: /Generate plan/i }));
}

describe("FlowEditorContent", () => {
  it("creates a flow, edits its generated plan, saves it and lists it", async () => {
    renderEditor();
    await screen.findByTestId("flows-list");

    fillGoalAndGenerate("Gift card redemption", "redeem a gift card at checkout");

    const stepGoal = screen.getAllByLabelText(/^Goal$/i)[1];
    expect(stepGoal).toBeDefined();
    fireEvent.change(stepGoal!, { target: { value: "Open the gift card page" } });

    fireEvent.click(screen.getByRole("button", { name: /Save flow/i }));

    expect(await screen.findByText("Flow saved.")).toBeInTheDocument();
    const list = screen.getByTestId("flows-list");
    expect(within(list).getByText("Gift card redemption")).toBeInTheDocument();
  });

  it("keeps the draft plan inside Inference until it is saved", async () => {
    renderEditor();
    await screen.findByTestId("flows-list");

    fillGoalAndGenerate("Gift card redemption", "redeem a gift card at checkout");
    expect(screen.getByTestId("inference-wrapper")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Save flow/i }));

    expect(await screen.findByText("Flow saved.")).toBeInTheDocument();
    expect(screen.queryByTestId("inference-wrapper")).toBeNull();
    expect(screen.getByText(/Saved plan steps/i)).toBeInTheDocument();
  });

  it("reports a form error instead of saving an empty plan", async () => {
    renderEditor();
    await screen.findByTestId("flows-list");

    fireEvent.change(screen.getByLabelText(/Flow name/i), { target: { value: "Empty flow" } });
    fireEvent.change(screen.getByLabelText(/^Goal$/i), { target: { value: "do something" } });
    fireEvent.click(screen.getByRole("button", { name: /Save flow/i }));

    expect(await screen.findByText(/Generate a plan before saving/i)).toBeInTheDocument();
  });
});
