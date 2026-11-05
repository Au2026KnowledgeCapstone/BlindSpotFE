import React from "react";
import { RequirementsContent } from "./requirements-content";

export default async function RequirementsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <RequirementsContent projectId={projectId} />;
}
