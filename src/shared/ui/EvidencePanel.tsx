import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export interface EvidencePanelProps {
  title?: string;
  children: React.ReactNode;
  rawTextToCopy?: string;
  className?: string;
}

const CopyButton: React.FC<{ rawText: string }> = ({ rawText }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 hover:text-[var(--bs-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)] rounded px-1 py-0.5"
      aria-label="Copy evidence"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-[var(--bs-pass)]" />
          <span className="text-[var(--bs-pass)]">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  title,
  children,
  rawTextToCopy,
  className = "",
}) => (
  <div
    style={{ backgroundColor: "var(--bs-bg-inset)", borderColor: "var(--bs-border-default)" }}
    className={`rounded-md border p-3 font-mono text-[12px] text-[var(--bs-text-secondary)] ${className}`}
  >
    {(title || rawTextToCopy) && (
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--bs-border-subtle)] text-[11px] text-[var(--bs-text-tertiary)]">
        <span className="font-medium uppercase tracking-wider">{title}</span>
        {rawTextToCopy && <CopyButton rawText={rawTextToCopy} />}
      </div>
    )}
    <div className="overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">{children}</div>
  </div>
);
