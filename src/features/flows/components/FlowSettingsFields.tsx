import React from "react";
import type { UseFormRegister } from "react-hook-form";
import type { FlowFormValues } from "../api/flow-form.schema";

export function FlowSettingsFields({ register }: { register: UseFormRegister<FlowFormValues> }) {
  return (
    <div className="border border-border rounded p-3 space-y-3 bg-raised">
      <h3 className="text-xs font-semibold text-primary">Flow settings</h3>
      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="text-xs text-secondary">Environment</span>
          <select {...register("settings.environment")} className={FIELD}>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
            <option value="pr_preview">Preview</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-secondary">Schedule</span>
          <select {...register("settings.schedule")} className={FIELD}>
            <option value="now">Now</option>
            <option value="weekly">Weekly</option>
            <option value="on_pr">On PR</option>
            <option value="manual">Manual</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-secondary">Credentials reference</span>
          {/* Reference only — secret values are never fetched or displayed (§P6). */}
          <input {...register("settings.credentialsReference")} className={FIELD} placeholder="vault://flow-creds" />
        </label>
      </div>
    </div>
  );
}

const FIELD = "w-full bg-panel border border-border rounded p-1.5 text-xs text-primary mt-1";
