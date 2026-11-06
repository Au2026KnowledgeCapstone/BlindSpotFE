import React from "react";

export interface PageHeaderProps {
  title: string;
  /** One plain line on what this surface is for. Optional. */
  description?: string;
  /** Primary actions for the surface, rendered trailing on the same baseline. */
  actions?: React.ReactNode;
}

/**
 * The one page-title treatment.
 *
 * Every surface previously rolled its own: Overview had no heading at all,
 * Flows read "Flows · acme-corp", Runs read "Runs — acme-corp". The project
 * name is already in the breadcrumb, so repeating it in the title was
 * duplication that pushed the actual subject rightward.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-subtle pb-4">
      <div className="min-w-0 space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-fg">{title}</h1>
        {description && (
          <p className="max-w-prose text-xs leading-relaxed text-fg-tertiary">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
