import React from "react";
import { RunDetailContent } from "./run-detail-content";

export default async function RunDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; runId: string }>;
  searchParams: Promise<{ environmentId?: string }>;
}) {
  const { projectId, runId } = await params;
  const { environmentId } = await searchParams;
  return <RunDetailContent projectId={projectId} runId={runId} environmentId={environmentId} />;
}
