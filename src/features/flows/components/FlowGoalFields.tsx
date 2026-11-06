import React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { FlowFormValues } from "../api/flow-form.schema";
import { FIELD_DENSE } from "@/shared/ui/field";
import { Button } from "@/components/ui/button";

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
        <span className="text-xs text-fg-secondary font-medium">Flow name</span>
        <input {...register("name")} className={NAME_FIELD} />
        {errors.name && <span className="text-[11px] text-fail">{errors.name.message}</span>}
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-fg-secondary font-medium">Goal</span>
        <div className="flex gap-2">
          <textarea
            {...register("goal")}
            className={`${FIELD_DENSE} h-20 resize-y`}
            placeholder="Describe what the agent should achieve"
          />
          <Button
            variant="outline"
            onClick={onGeneratePlan}
            disabled={isGenerating}
            className="shrink-0"
          >
            {isGenerating ? "Generating…" : "Generate plan"}
          </Button>
        </div>
        {errors.goal && <span className="text-[11px] text-fail">{errors.goal.message}</span>}
      </label>
    </>
  );
}

const NAME_FIELD = FIELD_DENSE;
