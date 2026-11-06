import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountMenu } from "./AccountMenu";

const mocks = vi.hoisted(() => ({ signOut: vi.fn(), replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));
vi.mock("../services/auth-service", () => ({ authService: { signOut: mocks.signOut } }));

afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

async function openMenu() {
  render(<AccountMenu />);
  fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
  return screen.findByRole("menu");
}

describe("AccountMenu", () => {
  it("offers account settings and closes with Escape", async () => {
    const menu = await openMenu();
    expect(screen.getByRole("menuitem", { name: "Account settings" })).toHaveAttribute("href", "/account/settings");
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeInTheDocument();
    fireEvent.keyDown(menu, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("button", { name: "Account menu" })).toHaveFocus());
  });

  it("ends the session before returning to login", async () => {
    mocks.signOut.mockResolvedValue(undefined);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("shows logout failures and allows retry without redirecting", async () => {
    mocks.signOut.mockRejectedValue(new Error("Unavailable"));
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to log out");
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("menuitem", { name: "Log out" })).not.toHaveAttribute("aria-disabled", "true");
  });
});
