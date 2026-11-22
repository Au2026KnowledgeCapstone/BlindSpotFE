import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultCard } from "./result-card";
import type { Evidence, Result } from "@/features/analysis";

vi.mock("@/features/workspace", () => ({ workspaceApi: { evidenceUrl: (id: string) => `https://api.example.test/evidence/${id}` } }));

const evidence = (id: string, type: Evidence["type"]): Evidence => ({ id, type });
const result = (items: Evidence[]): Result => ({
  id: "res-1", runId: "run-1", requirementId: "req-1", requirementTitle: "Checkout completes",
  verdict: "fail", classification: "criteria_violated", observedBehavior: "Stayed on the cart page.",
  criterionAssessments: [], actions: [], evidence: items,
});

beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test"); });

describe("screenshot evidence", () => {
  it("renders a screenshot as the image itself, not a link to one", () => {
    render(<ResultCard result={result([evidence("shot-1", "screenshot")])} />);
    const image = screen.getByAltText("Captured screenshot");
    expect(image).toHaveAttribute("src", "https://api.example.test/evidence/shot-1");
    // BE answers /evidence/{id} with a 302 to a signed URL; without credentials
    // on the image request the browser cannot follow it to the bytes.
    expect(image).toHaveAttribute("crossorigin", "use-credentials");
    expect(screen.getByRole("link", { name: /View full size/ })).toHaveAttribute("href", "https://api.example.test/evidence/shot-1");
  });

  it("keeps non-image evidence as links beside it", () => {
    render(<ResultCard result={result([evidence("shot-1", "screenshot"), evidence("log-1", "log")])} />);
    expect(screen.getByAltText("Captured screenshot")).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
