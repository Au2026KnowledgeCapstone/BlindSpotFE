import "@/test/setup";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { RunDetailContent } from "@/app/(app)/projects/[projectId]/runs/[runId]/run-detail-content";

function renderRunDetail() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={queryClient}><NuqsAdapter><RunDetailContent runId="run-4821" /></NuqsAdapter></QueryClientProvider>);
}

describe("RunDetailContent", () => {
  it("does not fabricate execution detail when the project engine is unavailable", async () => {
    renderRunDetail();
    expect(await screen.findByText("Run details are unavailable until the project execution service is integrated.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /steps and actions/i })).toBeNull();
    expect(screen.queryByText("Application defect")).toBeNull();
  });
});
