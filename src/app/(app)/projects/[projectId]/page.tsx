import React from "react";
import { OverviewContent } from "./overview-content";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <OverviewContent projectId={projectId} />;
}
