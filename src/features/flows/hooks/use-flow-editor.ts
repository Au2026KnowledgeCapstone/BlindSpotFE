"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flowCreateSchema, type FlowFormValues } from "../api/flow.schema";
import { draftPlanForGoal } from "../lib/draft-plan-for-goal";
import type { FlowListRow } from "../components/FlowsList";
import { SEED_FLOWS } from "../lib/seed-flows";

type SaveState = "idle" | "pending" | "error" | "success";

export function useFlowEditor() {
  const [flows, setFlows] = useState<FlowListRow[]>(SEED_FLOWS);
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
    setFlows((prev) => [
      ...prev,
      {
        id: `flow-${prev.length + 1}`,
        name: values.name,
        featureArea: "Uncategorised",
        lastStatus: "Queued",
        lastRunAt: "not yet run",
        history: [],
      },
    ]);
    setSaveState("success");
  });

  return { flows, form, submit, generatePlan, isGenerating, saveState };
}
