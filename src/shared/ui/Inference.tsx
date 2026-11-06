import React from "react";
import { Sparkles } from "lucide-react";

export interface EvidenceLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface InferenceProps {
  title?: string;
  certainty?: "high" | "medium" | "low" | string;
  evidenceLinks?: EvidenceLink[];
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
}

const EvidenceFooter: React.FC<{ links: EvidenceLink[] }> = ({ links }) => (
  <div className="mt-2.5 pt-2 border-t border-infer-border text-[11px] text-fg-tertiary flex flex-wrap items-center gap-1">
    <span className="font-medium">Based on:</span>
    {links.map((link, idx) => (
      <React.Fragment key={idx}>
        {idx > 0 && <span>·</span>}
        {link.onClick || link.href ? (
          <button
            type="button"
            onClick={link.onClick}
            className="rounded px-0.5 text-infer hover:underline focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"
          >
            {link.label}
          </button>
        ) : (
          <span>{link.label}</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

export const Inference: React.FC<InferenceProps> = ({
  title = "AI analysis · likely cause",
  certainty,
  evidenceLinks = [],
  children,
  compact = false,
  className = "",
}) => (
  <div
    data-testid="inference-wrapper"
    className={`rounded-r-md border-l-2 border-l-infer bg-infer-tint p-3 text-xs text-fg ${compact ? "py-1.5 px-2 text-[11px]" : ""} ${className}`}
  >
    <div className="flex items-center justify-between gap-2 mb-1.5 font-medium text-infer">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{title}</span>
      </div>
      {certainty && (
        <span className="text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-infer-border text-fg-secondary">
          {certainty} certainty
        </span>
      )}
    </div>
    <div className="space-y-1 text-fg">{children}</div>
    {evidenceLinks.length > 0 && <EvidenceFooter links={evidenceLinks} />}
  </div>
);
