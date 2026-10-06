import React from "react";
import { InlineError } from "./InlineError";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface AsyncBoundaryProps<T> {
  isLoading?: boolean;
  error?: Error | string | null;
  data?: T[] | T | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingFallback?: React.ReactNode;
  emptyFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

const DefaultLoading = () => (
  <div className="space-y-2 p-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const checkEmpty = (data: unknown, isEmpty?: boolean): boolean => {
  if (typeof isEmpty === "boolean") return isEmpty;
  if (!data) return true;
  return Array.isArray(data) && data.length === 0;
};

const renderError = (error: Error | string, onRetry?: () => void) => {
  const msg = typeof error === "string" ? error : error.message;
  const props = onRetry ? { title: "Failed to load data", message: msg, onRetry } : { title: "Failed to load data", message: msg };
  return <InlineError {...props} />;
};

export function AsyncBoundary<T>({
  isLoading = false,
  error = null,
  data = null,
  isEmpty,
  onRetry,
  loadingFallback,
  emptyFallback,
  errorFallback,
  children,
}: AsyncBoundaryProps<T>): React.ReactElement {
  if (isLoading) return <>{loadingFallback || <DefaultLoading />}</>;
  if (error) return <>{errorFallback || renderError(error, onRetry)}</>;
  if (checkEmpty(data, isEmpty)) {
    return <>{emptyFallback || <EmptyState title="No data available" description="There are no items to display at this time." />}</>;
  }
  return <>{children(data as T)}</>;
}
