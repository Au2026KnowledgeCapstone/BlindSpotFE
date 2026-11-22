import { Providers } from "@/app/providers";
import { notFound } from "next/navigation";
import { ResultsPreview } from "./results-preview";

export default function ResultsPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Providers><ResultsPreview /></Providers>;
}
