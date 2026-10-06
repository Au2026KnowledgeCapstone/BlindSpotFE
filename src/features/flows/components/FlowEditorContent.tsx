"use client";

import React from "react";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { FlowsList } from "./FlowsList";
import { FlowGoalFields } from "./FlowGoalFields";
import { FlowPlanSteps } from "./FlowPlanSteps";
import { FlowSettingsFields } from "./FlowSettingsFields";
import { FlowSaveRow } from "./FlowSaveRow";
import { useFlowEditor } from "../hooks/use-flow-editor";
import type { Flow } from "../types";

export function FlowEditorContent({ projectId }: { projectId: string }) {
  const { flowsQuery, form, submit, generatePlan, isGenerating, saveState } = useFlowEditor(projectId);
  const { register, control, formState } = form;

  return (
    <div className="space-y-6" data-testid="flow-editor-view">
      <h1 className="text-lg font-bold text-primary">Flows · {projectId}</h1>

      <AsyncBoundary<Flow[]>
        isLoading={flowsQuery.isLoading}
        error={flowsQuery.error}
        data={flowsQuery.data ?? null}
        onRetry={() => void flowsQuery.refetch()}
      >
        {(flows) => <FlowsList flows={flows} />}
      </AsyncBoundary>

      <form onSubmit={submit} className="border border-border bg-panel rounded-md p-4 space-y-4">
        <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">New flow</h2>
        <FlowGoalFields
          register={register}
          errors={formState.errors}
          isGenerating={isGenerating}
          onGeneratePlan={generatePlan}
        />
        <FlowPlanSteps control={control} register={register} isSaved={saveState === "success"} />
        <FlowSettingsFields register={register} />
        <FlowSaveRow saveState={saveState} />
      </form>
    </div>
  );
}
