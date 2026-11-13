import React from "react";
import type { LucideIcon } from "lucide-react";

export interface StatTileProps {
  label: string;
  value: number;
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
      className={`rounded-2xl border p-5 ${
        featured ? "border-strong bg-contrast text-on-contrast" : "border-border bg-panel text-fg"
      }`}
    >
      <div className="flex items-start justify-between gap-2 text-xs">
        <span className={featured ? "text-on-contrast/70" : "text-fg-tertiary"}>{label}</span>
        <Icon className={`size-4 ${featured ? "text-on-contrast/70" : "text-fg-tertiary"}`} />
      </div>
      <strong className="mt-4 block text-4xl font-medium tracking-tight tabular-nums">
        {value}
      </strong>
      {children ?? (
        <small className={`text-[10px] ${featured ? "text-on-contrast/70" : "text-fg-tertiary"}`}>
          {detail}
        </small>
      )}
    </section>
  );
}
