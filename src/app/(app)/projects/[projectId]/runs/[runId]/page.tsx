import React from "react";
import { RunDetailContent } from "./run-detail-content";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  return <RunDetailContent runId={runId} />;
}
