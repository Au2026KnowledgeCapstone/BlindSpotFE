import React from "react";
import { FlowsContent } from "./flows-content";

export default async function FlowsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <FlowsContent projectId={projectId} />;
}
