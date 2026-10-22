import React from "react";

export interface SectionHeadingProps {
  children: React.ReactNode;
  /** Count, status, or link rendered trailing on the same line. */
  aside?: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
}

/**
 * Section label in the Micro role (11px / 600 / 0.06em / uppercase).
 *
 * Section labels were previously set at text-sm or text-xs in primary text —
 * which made the label louder than the content under it. They are signposts,
 * so they sit in tertiary and recede; the content carries the weight.
 */
export function SectionHeading({
  children,
  aside,
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${className}`}>
      <Tag className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">
        {children}
      </Tag>
      {aside && <span className="text-[11px] text-fg-quaternary">{aside}</span>}
    </div>
  );
}
