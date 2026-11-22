import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { RequireSession } from "./RequireSession";

const mocks = vi.hoisted(() => ({ path: "/dashboard", getUser: vi.fn(), replace: vi.fn() }));
const router = { replace: mocks.replace };
vi.mock("next/navigation", () => ({ usePathname: () => mocks.path, useRouter: () => router }));
vi.mock("../services/auth-service", () => ({ authService: { getUser: mocks.getUser } }));
beforeEach(() => { vi.resetAllMocks(); mocks.path = "/dashboard"; });

it("keeps the app mounted during a route recheck and hides it if the session expires", async () => {
  mocks.getUser.mockResolvedValueOnce({ id: "user" });
  const view = render(<RequireSession><div>App content</div></RequireSession>);
  expect(await screen.findByText("App content")).toBeInTheDocument();
  let finish!: (user: null) => void;
  mocks.getUser.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  mocks.path = "/projects/example";
  view.rerender(<RequireSession><div>App content</div></RequireSession>);
  expect(screen.getByText("App content")).toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await act(async () => finish(null));
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
  expect(screen.queryByText("App content")).not.toBeInTheDocument();
});

it("hides the app immediately when the account changes", async () => {
  mocks.getUser.mockResolvedValueOnce({ id: "user" });
  render(<RequireSession><div>App content</div></RequireSession>);
  await screen.findByText("App content");
  mocks.getUser.mockImplementation(() => new Promise(() => {}));
  act(() => window.dispatchEvent(new Event("blindspot:auth-changed")));
  expect(screen.queryByText("App content")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toBeInTheDocument();
});
