export type DocumentRole = "brd" | "srs" | "design_spec";
export type DocumentSet = Record<DocumentRole, File | null>;
export const DOCUMENT_ROLES = [
  { role: "brd", label: "Business Requirements Document (BRD)", required: true },
  { role: "srs", label: "Software Requirements Specification (SRS)", required: true },
  { role: "design_spec", label: "Design specification", required: false },
] as const;
export function documentValidation(files: DocumentSet): string | null {
  if (!files.brd || !files.srs) return "BRD and SRS are required. Design specifications are optional.";
  const selected = Object.values(files).filter((file): file is File => !!file);
  if (selected.some((file) => !/\.(pdf|docx|md|markdown|txt)$/i.test(file.name))) return "Choose Word (.docx), PDF, Markdown, or plain-text documents.";
  if (selected.some((file) => !file.size)) return "Documents cannot be empty.";
  if (selected.some((file) => file.name.length > 200 || /[/\\\x00\r\n]/.test(file.name))) return "Use document filenames under 200 characters without slashes or control characters.";
  if (selected.reduce((sum, file) => sum + file.size, 0) > 10 * 1024 * 1024) return "The complete document set must not exceed 10 MiB.";
  return null;
}
export function documentFormData(files: DocumentSet) {
  const error = documentValidation(files);
  if (error) throw new Error(error);
  const form = new FormData();
  for (const { role } of DOCUMENT_ROLES) if (files[role]) form.append(role, files[role]);
  return form;
}
