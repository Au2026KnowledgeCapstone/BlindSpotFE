import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <span className="relative inline-flex min-w-0"><select {...props} className={`h-10 w-full cursor-pointer appearance-none rounded-xl border border-border bg-panel py-2 pl-3.5 pr-10 text-sm font-medium text-fg shadow-sm transition-colors hover:border-strong hover:bg-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>{children}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary" /></span>;
}
