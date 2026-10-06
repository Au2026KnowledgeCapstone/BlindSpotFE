"use client";

import React from "react";
import { FlowEditorContent } from "@/features/flows";

export function FlowsContent({ projectId }: { projectId: string }) {
  return <FlowEditorContent projectId={projectId} />;
}
