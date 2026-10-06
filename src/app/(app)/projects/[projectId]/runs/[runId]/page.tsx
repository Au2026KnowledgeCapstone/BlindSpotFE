import React from "react";
import { RunDetailContent } from "./run-detail-content";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; runId: string }>;
}) {
  const { projectId, runId } = await params;
  return <RunDetailContent projectId={projectId} runId={runId} />;
}
