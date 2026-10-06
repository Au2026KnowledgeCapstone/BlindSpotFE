import React from "react";
import { RunsContent } from "./runs-content";

export default async function RunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <RunsContent projectId={projectId} />;
}
