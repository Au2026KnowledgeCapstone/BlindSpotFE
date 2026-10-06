import React from "react";
import { HealsContent } from "./heals-content";

export default async function HealsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <HealsContent projectId={projectId} />;
}
