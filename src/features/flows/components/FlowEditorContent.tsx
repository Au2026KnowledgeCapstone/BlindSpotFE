import React, { useState } from "react";
import { StabilityStrip } from "@/shared/ui/StabilityStrip";
import { Inference } from "@/shared/ui/Inference";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flowCreateSchema, type FlowFormValues } from "../api/flow.schema";

export function FlowEditorContent({ projectId }: { projectId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [flowsList, setFlowsList] = useState([
    {
      id: "flow-checkout",
      name: "Checkout Flow",
      featureArea: "E-Commerce",
      lastStatus: "failed" as const,
      lastRunTime: "12m ago",
      stability: ["pass", "pass", "fail", "pass", "pass", "healed", "fail"],
    },
    {
      id: "flow-signup",
      name: "Signup & Onboarding",
      featureArea: "Authentication",
      lastStatus: "passed" as const,
      lastRunTime: "2h ago",
      stability: ["pass", "pass", "pass", "pass", "pass", "pass", "pass"],
    },
  ]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FlowFormValues>({
    resolver: zodResolver(flowCreateSchema),
    defaultValues: {
      name: "",
      goal: "",
      settings: {
        environment: "staging",
        schedule: "on_pr",
        credentialsReference: "vault://staging-test-creds",
      },
      steps: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setValue("steps", [
        { id: "s1", title: "Navigate to landing page & click login", expectedOutcome: "URL changes to /login", order: 1, type: "action" },
        { id: "s2", title: "Fill credentials and submit", expectedOutcome: "Redirects to dashboard", order: 2, type: "action" },
        { id: "s3", title: "Verify user profile loaded", expectedOutcome: "Profile name visible", order: 3, type: "check" },
      ]);
      setIsGenerating(false);
    }, 600);
  };

  const onSubmit = (data: FlowFormValues) => {
    setSavedSuccess(false);
    setTimeout(() => {
      setFlowsList((prev) => [
        ...prev,
        {
          id: `flow-${Date.now()}`,
          name: data.name,
          featureArea: "Custom",
          lastStatus: "passed",
          lastRunTime: "Just now",
          stability: ["pass", "pass", "pass"],
        },
      ]);
      setSavedSuccess(true);
    }, 400);
  };

  return (
    <div className="space-y-6" data-testid="flow-editor-view">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Flows & Test Editor</h1>
      </div>

      {/* Flows list with StabilityStrip */}
      <div className="border border-border bg-panel rounded-md p-4 space-y-3">
        <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Active Flows by Feature Area</h2>
        <div className="space-y-2">
          {flowsList.map((f) => (
            <div key={f.id} className="border border-border bg-raised rounded-md p-3 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary">{f.name}</span>
                  <span className="text-[10px] text-tertiary font-mono px-1.5 py-0.5 rounded bg-panel border border-border">
                    {f.featureArea}
                  </span>
                </div>
                <div className="text-xs text-secondary">Last run: {f.lastRunTime} ({f.lastStatus})</div>
              </div>
              <div className="flex items-center gap-4">
                <StabilityStrip runs={f.stability} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Editor Form with NL Goal -> Generate plan -> editable steps inside Inference */}
      <form onSubmit={handleSubmit(onSubmit)} className="border border-border bg-panel rounded-md p-4 space-y-4">
        <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Create / Edit Flow</h2>

        <div className="space-y-1">
          <label className="text-xs text-secondary font-medium">Flow Name</label>
          <input
            {...register("name")}
            className="w-full bg-raised border border-border rounded px-3 py-1.5 text-xs text-primary"
            placeholder="e.g. User Signup & Onboarding"
          />
          {errors.name && <span className="text-[10px] text-fail">{errors.name.message}</span>}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-secondary font-medium">Natural Language Goal</label>
          <div className="flex gap-2">
            <textarea
              {...register("goal")}
              className="w-full bg-raised border border-border rounded p-2 text-xs text-primary h-20"
              placeholder="Describe what the agent should achieve, e.g. 'Test user login with valid credentials and verify dashboard loads'"
            />
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="px-4 py-2 bg-accent text-white text-xs font-medium rounded hover:bg-accent/90 disabled:opacity-50 shrink-0 h-fit"
            >
              {isGenerating ? "Generating..." : "Generate plan"}
            </button>
          </div>
          {errors.goal && <span className="text-[10px] text-fail">{errors.goal.message}</span>}
        </div>

        {/* Editable steps shown inside Inference until saved */}
        {fields.length > 0 && (
          <Inference title="AI Generated Plan Steps (Editable)">
            <div className="space-y-3 pt-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="border border-border bg-panel rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">Step {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-[10px] text-fail hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-tertiary">Step Action / Goal</label>
                      <input
                        {...register(`steps.${idx}.title` as const)}
                        className="w-full bg-raised border border-border rounded px-2 py-1 text-xs text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-tertiary">Expected Outcome</label>
                      <input
                        {...register(`steps.${idx}.expectedOutcome` as const)}
                        className="w-full bg-raised border border-border rounded px-2 py-1 text-xs text-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Inference>
        )}

        {/* Per-flow settings */}
        <div className="border border-border rounded p-3 space-y-3 bg-raised">
          <h3 className="text-xs font-semibold text-primary">Per-Flow Settings</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-secondary">Environment</label>
              <select
                {...register("settings.environment")}
                className="w-full bg-panel border border-border rounded p-1.5 text-xs text-primary mt-1"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
                <option value="pr_preview">PR Preview</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary">Schedule</label>
              <select
                {...register("settings.schedule")}
                className="w-full bg-panel border border-border rounded p-1.5 text-xs text-primary mt-1"
              >
                <option value="now">Run Now</option>
                <option value="weekly">Weekly</option>
                <option value="on_pr">On PR</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary">Credentials Reference</label>
              <input
                {...register("settings.credentialsReference")}
                className="w-full bg-panel border border-border rounded p-1.5 text-xs text-primary mt-1"
                placeholder="vault://secret-key"
                type="password"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-accent text-white text-xs font-medium rounded hover:bg-accent/90"
          >
            {isSubmitting ? "Saving..." : "Save Flow & Steps"}
          </button>
          {savedSuccess && <span className="text-xs text-pass font-medium">Flow successfully created & saved!</span>}
        </div>
      </form>
    </div>
  );
}
