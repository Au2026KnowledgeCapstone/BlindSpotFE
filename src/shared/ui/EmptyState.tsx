import React from "react";
import { Inbox, type LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--bs-bg-panel)",
        borderColor: "var(--bs-border-subtle)",
      }}
      className={`p-8 rounded-lg border text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="p-3 rounded-full bg-[var(--bs-bg-raised)] text-[var(--bs-text-tertiary)]">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-medium text-[var(--bs-text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[var(--bs-text-tertiary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
