import React from "react";
import type { LucideIcon } from "lucide-react";

export interface StatTileProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Small caption under the value. Ignored if `children` is given. */
  detail?: string | undefined;
  /** A dark, theme-invariant tile reserved for the single primary stat in a row. */
  featured?: boolean;
  /** Overrides `detail` — e.g. a row of outcome badges instead of plain text. */
  children?: React.ReactNode;
}

/**
 * The one stat-tile treatment, shared across pages so a "featured" tile looks
 * the same everywhere.
 */
export function StatTile({ label, value, icon: Icon, detail, featured, children }: StatTileProps) {
  return (
    <section
      className={`flex min-h-40 flex-col rounded-[20px] border p-6 shadow-ambient ${
        featured ? "border-strong bg-contrast text-on-contrast" : "border-border bg-panel text-fg"
      }`}
    >
      <div className="flex items-start justify-between gap-2 text-xs">
        <span className={featured ? "text-on-contrast/70" : "text-fg-tertiary"}>{label}</span>
        <Icon className={`size-4 ${featured ? "text-on-contrast/70" : "text-fg-tertiary"}`} />
      </div>
      <strong className="mt-8 mb-2 block text-4xl font-medium tracking-tight tabular-nums">
        {value}
      </strong>
      {children ?? (
        <small className={`mt-auto text-xs ${featured ? "text-on-contrast/70" : "text-fg-tertiary"}`}>
          {detail}
        </small>
      )}
    </section>
  );
}
