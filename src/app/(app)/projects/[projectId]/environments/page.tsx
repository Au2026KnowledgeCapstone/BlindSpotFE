import React from "react";
import { EnvironmentsContent } from "./environments-content";

export default async function EnvironmentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <EnvironmentsContent projectId={projectId} />;
}
