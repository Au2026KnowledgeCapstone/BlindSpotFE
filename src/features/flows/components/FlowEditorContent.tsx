"use client";

import React from "react";
import { Plus } from "lucide-react";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { Button } from "@/components/ui/button";
import { FlowsList } from "./FlowsList";
import { FlowGoalFields } from "./FlowGoalFields";
import { FlowPlanSteps } from "./FlowPlanSteps";
import { FlowSettingsFields } from "./FlowSettingsFields";
import { FlowSaveRow } from "./FlowSaveRow";
import { useFlowEditor } from "../hooks/use-flow-editor";
import type { Flow } from "../types";

type Editor = ReturnType<typeof useFlowEditor>;

interface ComposerProps {
  onSubmit: Editor["submit"];
  onClose: () => void;
  register: Editor["form"]["register"];
  control: Editor["form"]["control"];
  errors: Editor["form"]["formState"]["errors"];
  isGenerating: boolean;
  onGeneratePlan: Editor["generatePlan"];
  saveState: Editor["saveState"];
}

function Composer({
  onSubmit,
  onClose,
  register,
  control,
  errors,
  isGenerating,
  onGeneratePlan,
  saveState,
}: ComposerProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-md border border-border bg-panel p-4 shadow-ambient"
    >
      <SectionHeading
        aside={
          <Button variant="ghost" size="xs" onClick={onClose}>
            Cancel
          </Button>
        }
      >
        New flow
      </SectionHeading>
      <FlowGoalFields
        register={register}
        errors={errors}
        isGenerating={isGenerating}
        onGeneratePlan={onGeneratePlan}
      />
      <FlowPlanSteps
        control={control}
        register={register}
        isSaved={saveState === "success"}
      />
      <FlowSettingsFields register={register} />
      <FlowSaveRow saveState={saveState} />
    </form>
  );
}

export function FlowEditorContent({ projectId }: { projectId: string }) {
  const { flowsQuery, form, submit, generatePlan, isGenerating, saveState } =
    useFlowEditor(projectId);
  const { register, control, formState } = form;

  // The composer used to sit open permanently, so an empty form took up half
  // the page above the flows it was meant to add to. It is now gated the same
  // way the environments composer is.
  // Deliberately not auto-closed on save: the composer is where "Flow saved."
  // and the saved plan steps are shown, so closing it on success would throw
  // away the confirmation the user just earned. They close it themselves.
  const [isComposing, setIsComposing] = React.useState(false);

  return (
    <div className="space-y-8" data-testid="flow-editor-view">
      <PageHeader
        title="Flows"
        description="Plain English journeys the agent runs in a real browser."
        actions={
          !isComposing && (
            <Button size="sm" onClick={() => setIsComposing(true)}>
              <Plus />
              New flow
            </Button>
          )
        }
      />

      {isComposing && (
        <Composer
          onSubmit={submit}
          onClose={() => setIsComposing(false)}
          register={register}
          control={control}
          errors={formState.errors}
          isGenerating={isGenerating}
          onGeneratePlan={generatePlan}
          saveState={saveState}
        />
      )}

      <AsyncBoundary<Flow[]>
        isLoading={flowsQuery.isLoading}
        error={flowsQuery.error}
        data={flowsQuery.data ?? null}
        onRetry={() => void flowsQuery.refetch()}
      >
        {(flows) => <FlowsList flows={flows} />}
      </AsyncBoundary>
    </div>
  );
}
