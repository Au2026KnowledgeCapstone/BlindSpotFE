import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountSettings } from "./AccountSettings";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), requestPasswordReset: vi.fn() }));
vi.mock("../services/auth-service", () => ({ authService: mocks }));

afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

describe("AccountSettings", () => {
  it("loads the signed-in email and sends the reset link to that account", async () => {
    mocks.getUser.mockResolvedValue({ email: "stevie@example.com" });
    mocks.requestPasswordReset.mockResolvedValue(undefined);
    render(<AccountSettings />);
    expect(await screen.findByText("stevie@example.com")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send password reset email" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Check your inbox");
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith("stevie@example.com");
  });

  it("disables reset when the account cannot be loaded", async () => {
    mocks.getUser.mockRejectedValue(new Error("Unavailable"));
    render(<AccountSettings />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load your account");
    expect(screen.getByRole("button", { name: "Send password reset email" })).toBeDisabled();
  });

  it("shows reset failures without reporting success", async () => {
    mocks.getUser.mockResolvedValue({ email: "stevie@example.com" });
    mocks.requestPasswordReset.mockRejectedValue(new Error("Unavailable"));
    render(<AccountSettings />);
    await screen.findByText("stevie@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send password reset email" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to send a reset email");
    expect(screen.getByRole("button", { name: "Send password reset email" })).toBeEnabled();
  });
});
