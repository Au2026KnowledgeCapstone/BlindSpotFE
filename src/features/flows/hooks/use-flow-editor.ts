"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { flowCreateSchema, type FlowFormValues } from "../api/flow-form.schema";
import { flowsQueryKey, useFlows } from "../api/use-flows";
import { draftPlanForGoal } from "../lib/draft-plan-for-goal";
import type { Flow } from "../types";

type SaveState = "idle" | "pending" | "error" | "success";

export function useFlowEditor(projectId: string) {
  const queryClient = useQueryClient();
  const flowsQuery = useFlows(projectId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const form = useForm<FlowFormValues>({
    resolver: zodResolver(flowCreateSchema),
    defaultValues: {
      name: "",
      goal: "",
      settings: { environment: "staging", schedule: "on_pr", credentialsReference: "" },
      steps: [],
    },
  });

  const generatePlan = () => {
    setIsGenerating(true);
    setSaveState("idle");
    form.setValue("steps", draftPlanForGoal(form.getValues("goal")));
    setIsGenerating(false);
  };

  const submit = form.handleSubmit((values) => {
    setSaveState("pending");
    if (values.steps.length === 0) {
      setSaveState("error");
      return;
    }
    queryClient.setQueryData<Flow[]>(flowsQueryKey(projectId), (prev) => [
      ...(prev ?? []),
      toSavedFlow(values, projectId, prev?.length ?? 0),
    ]);
    setSaveState("success");
  });

  return { flowsQuery, form, submit, generatePlan, isGenerating, saveState };
}

function toSavedFlow(values: FlowFormValues, projectId: string, existingCount: number): Flow {
  return {
    id: `flow-${existingCount + 1}`,
    projectId,
    name: values.name,
    description: values.goal,
    goal: values.goal,
    status: "active",
    featureArea: "Uncategorised",
    steps: values.steps,
    settings: values.settings,
    history: [],
    lastStatus: "Queued",
    lastRunAt: "not yet run",
  };
}
