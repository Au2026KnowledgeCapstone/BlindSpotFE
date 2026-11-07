import "@/test/setup";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { RunDetailContent } from "@/app/(app)/projects/[projectId]/runs/[runId]/run-detail-content";

describe("RunDetailContent execution boundary", () => {
  it("keeps the run UI shell and never fabricates streamed execution", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><NuqsAdapter><RunDetailContent runId="run-4821" /></NuqsAdapter></QueryClientProvider>);
    expect(await screen.findByRole("status")).toHaveTextContent("Run details are unavailable until the project execution service is integrated.");
    expect(screen.queryByTestId("stream-state-badge")).toBeNull();
  });
});
