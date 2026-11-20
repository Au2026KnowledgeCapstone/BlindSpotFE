import { describe, expect, it } from "vitest";
import { documentFormData, documentValidation, type DocumentSet } from "./import-documents";
const file = (name: string, body = "Requirements") => new File([body], name, { type: "text/plain" });
const documents = (): DocumentSet => ({ brd: file("BRD.md"), srs: file("SRS.txt"), design_spec: null });
describe("document set import", () => {
  it("requires both source documents and permits an optional design specification", () => {
    expect(documentValidation({ ...documents(), srs: null })).toMatch(/BRD and SRS/);
    expect(documentValidation({ ...documents(), design_spec: file("DESIGN_SPEC.docx") })).toBeNull();
  });
  it("blocks empty, unsupported, and oversized uploads before any request", () => {
    expect(documentValidation({ ...documents(), brd: file("BRD.md", "") })).toMatch(/empty/);
    expect(documentValidation({ ...documents(), brd: file("requirements.exe") })).toMatch(/Choose Word/);
    expect(documentValidation({ ...documents(), brd: new File([new Uint8Array(10 * 1024 * 1024)], "BRD.pdf") })).toMatch(/10 MiB/);
  });
  it("uses the backend's multipart role names without serializing document bytes as JSON", () => {
    const set = { ...documents(), design_spec: file("DESIGN_SPEC.md") };
    const form = documentFormData(set);
    expect([...form.keys()]).toEqual(["brd", "srs", "design_spec"]);
    expect((form.get("brd") as File).name).toBe("BRD.md");
    expect((form.get("design_spec") as File).size).toBe(set.design_spec.size);
  });
});
