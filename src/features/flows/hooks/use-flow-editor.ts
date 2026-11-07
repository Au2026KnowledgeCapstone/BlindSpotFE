"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flowCreateSchema, type FlowFormValues } from "../api/flow-form.schema";
import { useFlows } from "../api/use-flows";
import { draftPlanForGoal } from "../lib/draft-plan-for-goal";

type SaveState = "idle" | "pending" | "error" | "success" | "unavailable";

export function useFlowEditor(projectId: string) {
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
    setSaveState("unavailable");
  });

  return { flowsQuery, form, submit, generatePlan, isGenerating, saveState };
}
