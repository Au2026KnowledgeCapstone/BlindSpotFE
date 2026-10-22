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
      className={`p-8 rounded-lg border border-subtle bg-panel shadow-ambient text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="p-3 rounded-full bg-raised text-fg-tertiary">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-medium text-fg">{title}</h3>
        {description && (
          <p className="text-xs leading-relaxed text-fg-tertiary">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
