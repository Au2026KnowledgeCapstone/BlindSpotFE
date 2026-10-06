import React from "react";

export interface ExpectedObservedProps {
  expected: React.ReactNode;
  observed: React.ReactNode;
  className?: string;
}

export const ExpectedObserved: React.FC<ExpectedObservedProps> = ({
  expected,
  observed,
  className = "",
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--bs-bg-panel)",
        borderColor: "var(--bs-border-default)",
      }}
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border ${className}`}
    >
      <div className="space-y-1">
        <span className="block text-[11px] font-semibold tracking-wider uppercase text-[var(--bs-text-tertiary)]">
          Expected
        </span>
        <div className="text-[15px] font-normal leading-snug text-[var(--bs-text-primary)]">
          {expected}
        </div>
      </div>

      <div className="space-y-1">
        <span className="block text-[11px] font-semibold tracking-wider uppercase text-[var(--bs-fail)]">
          Observed
        </span>
        <div className="text-[15px] font-normal leading-snug text-[var(--bs-text-primary)]">
          {observed}
        </div>
      </div>
    </div>
  );
};
