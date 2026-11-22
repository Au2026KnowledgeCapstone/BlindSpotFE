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
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-1">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[32px] sm:leading-tight">{title}</h1>
        {description && (
          <p className="max-w-prose text-sm leading-relaxed text-fg-tertiary">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
