import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../app-shell";

const mocks = vi.hoisted(() => ({ pathname: "/projects/11111111-1111-4111-8111-111111111111", params: { projectId: "11111111-1111-4111-8111-111111111111" } }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname, useParams: () => mocks.params }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/features/auth", () => ({ AccountMenu: () => <div /> }));
vi.mock("@/features/workspace/notifications-panel", () => ({ NotificationsPanel: () => <div /> }));
vi.mock("../header-context", () => ({ HeaderContext: ({ projectId }: { projectId: string }) => <div>{projectId}</div> }));
vi.mock("../theme-store", () => ({ useThemeStore: (selector: (state: { theme: string; toggleTheme: () => void }) => unknown) => selector({ theme: "light", toggleTheme: vi.fn() }) }));

afterEach(() => { cleanup(); });

describe("AppShell project navigation", () => {
  it("uses the route project ID when the parent layout provides an empty ID", () => {
    render(<AppShell projectId=""><div>Project page</div></AppShell>);
    for (const [section, label] of [["", "Overview"], ["/flows", "Flows"], ["/runs", "Runs"], ["/setup", "Project setup"], ["/members", "Members"]] as const) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", `/projects/${mocks.params.projectId}${section}`);
    }
  });

  it("keeps only directory navigation when no project route is active", () => {
    mocks.pathname = "/projects";
    mocks.params = { projectId: undefined as unknown as string };
    render(<AppShell projectId=""><div>Project directory</div></AppShell>);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    expect(screen.queryByRole("link", { name: "Overview" })).not.toBeInTheDocument();
  });
});
