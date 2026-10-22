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
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-panel shadow-ambient ${className}`}
    >
      <div className="space-y-1">
        <span className="block text-[11px] font-semibold tracking-wider uppercase text-fg-tertiary">
          Expected
        </span>
        <div className="text-[15px] font-normal leading-snug text-fg">
          {expected}
        </div>
      </div>

      <div className="space-y-1">
        <span className="block text-[11px] font-semibold tracking-wider uppercase text-fail">
          Observed
        </span>
        <div className="text-[15px] font-normal leading-snug text-fg">
          {observed}
        </div>
      </div>
    </div>
  );
};
