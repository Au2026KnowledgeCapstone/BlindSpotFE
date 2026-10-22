import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className={`p-3 rounded-lg border border-fail-border bg-fail-tint text-fg flex items-start gap-2.5 text-xs ${className}`}
      role="alert"
    >
      <AlertTriangle className="w-4 h-4 text-fail shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="font-semibold text-fail">{title}</div>
        {message && (
          <div className="leading-relaxed text-fg-secondary">{message}</div>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" size="xs" onClick={onRetry} className="shrink-0">
          <RefreshCw />
          Retry
        </Button>
      )}
    </div>
  );
};
