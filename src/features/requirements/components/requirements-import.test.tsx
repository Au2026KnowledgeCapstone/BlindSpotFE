import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RequirementsImport } from "./requirements-import";
import { workspaceApi, WorkspaceApiError } from "@/features/workspace/workspace-api";

const ids = { user: "11111111-1111-4111-8111-111111111111", project: "22222222-2222-4222-8222-222222222222" };
vi.mock("@/shared/ui/Modal", () => ({ Modal: ({ title, children }: { title: string; children: React.ReactNode }) => <div role="dialog" aria-label={title}>{children}</div> }));
vi.mock("@/features/workspace/workspace-api", async (original) => ({
  ...(await original<typeof import("@/features/workspace/workspace-api")>()),
  workspaceApi: { importRequirements: vi.fn() },
}));

const importMock = () => vi.mocked(workspaceApi.importRequirements);
const emptyResult = { import_id: "33333333-3333-4333-8333-333333333333", documents: [], requirements: [], warnings: [] };
const keysUsed = () => importMock().mock.calls.map((call) => call[2]);

function renderImport() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><RequirementsImport projectId={ids.project} projectName="Project" userId={ids.user} onClose={() => {}} /></QueryClientProvider>);
}
// jsdom will not accept an array assigned to input.files, so define it directly.
function attach(label: string, name: string) {
  const input = screen.getByLabelText(label, { exact: true });
  Object.defineProperty(input, "files", { value: [new File(["Documented expectation"], name, { type: "text/markdown" })], configurable: true });
  fireEvent.change(input);
}
function selectBothDocuments() {
  attach("Business Requirements Document (BRD)", "BRD.md");
  attach("Software Requirements Specification (SRS)", "SRS.md");
}
const submitButton = () => screen.getByRole("button", { name: /Extract requirements|Retry import/ });
// The role inputs are `required`, and jsdom's constraint validation cannot see a
// synthetic FileList — so submit the form rather than clicking through it.
const submit = () => fireEvent.submit(submitButton().closest("form")!);

beforeEach(() => { importMock().mockReset(); });
afterEach(() => { vi.clearAllMocks(); });

describe("import recovery", () => {
  it("retries an aborted extraction under the same key so BE replays it instead of importing twice", async () => {
    importMock().mockRejectedValueOnce(new WorkspaceApiError(0, undefined, "Workspace service unavailable. Retry."));
    importMock().mockResolvedValueOnce(emptyResult);
    renderImport();
    selectBothDocuments();
    submit();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/did not report back and may still be running/));
    expect(screen.getByRole("alert")).toHaveTextContent(/will not create duplicate drafts/);
    expect(submitButton()).toHaveAccessibleName("Retry import");
    expect(submitButton()).toBeEnabled();
    submit();
    await waitFor(() => expect(screen.getByRole("heading", { name: /ready for review/ })).toBeVisible());
    const [first, second] = keysUsed();
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(second).toBe(first);
  });

  it("never reports BE's internal retry instructions to a reviewer", async () => {
    importMock().mockRejectedValue(new WorkspaceApiError(409, "import_pending", "This import has not completed; retry the same upload with its Idempotency-Key."));
    renderImport();
    selectBothDocuments();
    submit();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/still being extracted/));
    expect(screen.getByRole("alert")).not.toHaveTextContent(/Idempotency-Key/);
  });

  it("mints a fresh key after a rejected fingerprint so the next attempt is a new import", async () => {
    importMock().mockRejectedValueOnce(new WorkspaceApiError(409, "conflict", "Idempotency-Key was reused with different documents."));
    importMock().mockResolvedValueOnce(emptyResult);
    renderImport();
    selectBothDocuments();
    submit();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/documents changed since the last attempt/));
    submit();
    await waitFor(() => expect(importMock()).toHaveBeenCalledTimes(2));
    const [first, second] = keysUsed();
    expect(second).not.toBe(first);
  });

  it("starts a new key when the document set changes, and keeps it stable while it does not", async () => {
    importMock().mockRejectedValue(new WorkspaceApiError(0, undefined, "Workspace service unavailable. Retry."));
    renderImport();
    selectBothDocuments();
    submit();
    await waitFor(() => expect(importMock()).toHaveBeenCalledTimes(1));
    submit();
    await waitFor(() => expect(importMock()).toHaveBeenCalledTimes(2));
    attach("Software Requirements Specification (SRS)", "SRS-v2.md");
    submit();
    await waitFor(() => expect(importMock()).toHaveBeenCalledTimes(3));
    const [first, second, third] = keysUsed();
    expect(second).toBe(first);
    expect(third).not.toBe(first);
  });

  it("surfaces a rejected document without offering a pointless replay", async () => {
    importMock().mockRejectedValue(new WorkspaceApiError(415, "invalid_document", "Upload a simple TXT, Markdown, PDF or DOCX filename."));
    renderImport();
    selectBothDocuments();
    submit();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Upload a simple TXT, Markdown, PDF or DOCX filename."));
  });
});
