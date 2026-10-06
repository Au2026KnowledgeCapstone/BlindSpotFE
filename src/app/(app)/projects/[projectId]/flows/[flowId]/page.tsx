import React from "react";
import { FlowDetailContent } from "./flow-detail-content";

export default async function FlowDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; flowId: string }>;
}) {
  const { projectId, flowId } = await params;
  return <FlowDetailContent projectId={projectId} flowId={flowId} />;
}
