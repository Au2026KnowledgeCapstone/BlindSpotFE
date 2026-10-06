import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export interface InlineErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--bs-fail-tint)",
        borderColor: "var(--bs-fail-border)",
        color: "var(--bs-text-primary)",
      }}
      className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${className}`}
      role="alert"
    >
      <AlertTriangle className="w-4 h-4 text-[var(--bs-fail)] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="font-semibold text-[var(--bs-fail)]">{title}</div>
        {message && (
          <div className="text-[var(--bs-text-secondary)] leading-relaxed">
            {message}
          </div>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--bs-bg-panel)] border border-[var(--bs-border-default)] hover:bg-[var(--bs-bg-raised)] text-[var(--bs-text-primary)] font-medium text-[11px] shrink-0 focus:outline-none focus:ring-1 focus:ring-[var(--bs-focus-ring)]"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
