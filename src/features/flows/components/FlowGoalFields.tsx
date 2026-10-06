import React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { FlowFormValues } from "../api/flow-form.schema";

export function FlowGoalFields({
  register,
  errors,
  isGenerating,
  onGeneratePlan,
}: {
  register: UseFormRegister<FlowFormValues>;
  errors: FieldErrors<FlowFormValues>;
  isGenerating: boolean;
  onGeneratePlan: () => void;
}) {
  return (
    <>
      <label className="block space-y-1">
        <span className="text-xs text-secondary font-medium">Flow name</span>
        <input {...register("name")} className={NAME_FIELD} />
        {errors.name && <span className="text-[11px] text-fail">{errors.name.message}</span>}
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-secondary font-medium">Goal</span>
        <div className="flex gap-2">
          <textarea
            {...register("goal")}
            className="w-full bg-raised border border-border rounded p-2 text-xs text-primary h-20"
            placeholder="Describe what the agent should achieve"
          />
          <button
            type="button"
            onClick={onGeneratePlan}
            disabled={isGenerating}
            className="px-4 py-2 border border-border rounded text-xs font-medium text-accent h-fit shrink-0"
          >
            {isGenerating ? "Generating…" : "Generate plan"}
          </button>
        </div>
        {errors.goal && <span className="text-[11px] text-fail">{errors.goal.message}</span>}
      </label>
    </>
  );
}

const NAME_FIELD = "w-full bg-raised border border-border rounded px-3 py-1.5 text-xs text-primary";
