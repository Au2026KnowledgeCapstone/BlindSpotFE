import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FlowDetailContent } from "./flow-detail-content";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

afterEach(cleanup);

describe("FlowDetailContent", () => {
  it("does not display a fabricated run as flow steps or results", () => {
    render(<FlowDetailContent projectId="project-1" flowId="flow-1" />);
    expect(screen.getByRole("heading", { name: "Flow: flow-1" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Flow execution is unavailable");
    expect(screen.getByRole("link", { name: "Back to flows" })).toHaveAttribute("href", "/projects/project-1/flows");
    expect(screen.queryByText("Configured Steps")).not.toBeInTheDocument();
  });
});
