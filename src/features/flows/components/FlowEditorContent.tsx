"use client";

import React from "react";
import { FlowsList } from "./FlowsList";
import { FlowGoalFields } from "./FlowGoalFields";
import { FlowPlanSteps } from "./FlowPlanSteps";
import { FlowSettingsFields } from "./FlowSettingsFields";
import { useFlowEditor } from "../hooks/use-flow-editor";

export function FlowEditorContent({ projectId }: { projectId: string }) {
  const { flows, form, submit, generatePlan, isGenerating, saveState } = useFlowEditor();
  const { register, control, formState } = form;

  return (
    <div className="space-y-6" data-testid="flow-editor-view">
      <h1 className="text-lg font-bold text-primary">Flows · {projectId}</h1>
      <FlowsList flows={flows} />

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
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saveState === "pending"}
            className="px-4 py-2 border border-border rounded text-xs font-medium text-accent"
          >
            {saveState === "pending" ? "Saving…" : "Save flow"}
          </button>
          {saveState === "error" && (
            <span className="text-xs text-fail">Generate a plan before saving this flow.</span>
          )}
          {saveState === "success" && <span className="text-xs text-pass">Flow saved.</span>}
        </div>
      </form>
    </div>
  );
}
