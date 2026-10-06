"use client";

import React from "react";
import type { Failure } from "@/features/runs";
import { Inference } from "@/shared/ui/Inference";

export interface AiAnalysisTabProps {
  failure?: Failure | undefined;
}

export function AiAnalysisTab({ failure }: AiAnalysisTabProps) {
  const evidenceLinks = (failure?.linkedEvidence ?? []).map((label) => ({ label }));

  return (
    <Inference title="AI analysis · likely cause" certainty="high" evidenceLinks={evidenceLinks}>
      <p className="text-[13px] font-medium">
        {failure?.likelyCause ?? "No AI analysis recorded for this run."}
      </p>

      {failure && failure.suggestedNextSteps.length > 0 && (
        <div className="mt-2 space-y-1 text-xs">
          <span className="font-medium text-[var(--bs-infer)]">Suggested next steps</span>
          <ul className="list-disc pl-4 space-y-0.5 text-[var(--bs-text-secondary)]">
            {failure.suggestedNextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </Inference>
  );
}
