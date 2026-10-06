import React from "react";
import type { Control, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Inference } from "@/shared/ui/Inference";
import type { FlowFormValues } from "../api/flow-form.schema";

export function FlowPlanSteps({
  control,
  register,
  isSaved,
}: {
  control: Control<FlowFormValues>;
  register: UseFormRegister<FlowFormValues>;
  isSaved: boolean;
}) {
  const { fields, remove } = useFieldArray({ control, name: "steps" });
  if (fields.length === 0) return null;

  const body = (
    <div className="space-y-3 pt-2">
      {fields.map((field, idx) => (
        <div key={field.id} className="border border-border bg-panel rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Step {idx + 1}</span>
            <button type="button" onClick={() => remove(idx)} className="text-[11px] text-fail">
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StepField label="Goal" {...register(`steps.${idx}.title` as const)} />
            <StepField label="Expected outcome" {...register(`steps.${idx}.expectedOutcome` as const)} />
          </div>
        </div>
      ))}
    </div>
  );

  // Draft plan is AI output, so it stays inside Inference until the user saves it (§P6).
  return isSaved ? (
    <div className="border border-border bg-panel rounded-md p-3">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Saved plan steps</h3>
      {body}
    </div>
  ) : (
    <Inference title="AI analysis · draft plan">{body}</Inference>
  );
}

function StepField({ label, ...field }: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="text-[11px] text-tertiary">{label}</span>
      <input
        {...field}
        className="w-full bg-raised border border-border rounded px-2 py-1 text-xs text-primary"
      />
    </label>
  );
}
