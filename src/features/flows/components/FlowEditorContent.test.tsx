import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlowEditorContent } from "./FlowEditorContent";

function createFlow(name: string, goal: string) {
  fireEvent.change(screen.getByLabelText(/Flow name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/^Goal$/i), { target: { value: goal } });
  fireEvent.click(screen.getByRole("button", { name: /Generate plan/i }));
}

describe("FlowEditorContent", () => {
  it("creates a flow, edits its generated plan, saves it and lists it", async () => {
    render(<FlowEditorContent projectId="acme-corp" />);

    createFlow("Gift card redemption", "redeem a gift card at checkout");

    const firstStep = screen.getAllByLabelText(/^Goal$/i)[1];
    expect(firstStep).toBeDefined();
    fireEvent.change(firstStep!, { target: { value: "Open the gift card page" } });

    fireEvent.click(screen.getByRole("button", { name: /Save flow/i }));

    expect(await screen.findByText("Flow saved.")).toBeInTheDocument();
    const list = screen.getByTestId("flows-list");
    expect(within(list).getByText("Gift card redemption")).toBeInTheDocument();
  });

  it("keeps the draft plan inside Inference until it is saved", async () => {
    render(<FlowEditorContent projectId="acme-corp" />);
    createFlow("Gift card redemption", "redeem a gift card at checkout");

    expect(screen.getByTestId("inference-wrapper")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Save flow/i }));

    expect(await screen.findByText("Flow saved.")).toBeInTheDocument();
    expect(screen.queryByTestId("inference-wrapper")).toBeNull();
    expect(screen.getByText(/Saved plan steps/i)).toBeInTheDocument();
  });

  it("reports a form error instead of saving an empty plan", async () => {
    render(<FlowEditorContent projectId="acme-corp" />);

    fireEvent.change(screen.getByLabelText(/Flow name/i), { target: { value: "Empty flow" } });
    fireEvent.change(screen.getByLabelText(/^Goal$/i), { target: { value: "do something" } });
    fireEvent.click(screen.getByRole("button", { name: /Save flow/i }));

    expect(await screen.findByText(/Generate a plan before saving/i)).toBeInTheDocument();
  });
});
