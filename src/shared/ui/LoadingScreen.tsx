import { LoadingMark } from "./LoadingMark";

/** A full-bleed loading state: the spinning eye mark, centered both axes.
 * Use for whole-surface loads (route transitions, session checks) — a
 * region that already has content loading more of it wants AsyncBoundary's
 * skeleton instead. */
export function LoadingScreen({ label = "Loading", size = 64, className = "min-h-[50vh]" }: { label?: string; size?: number; className?: string }) {
  return (
    <div role="status" className={`flex h-full w-full items-center justify-center ${className}`}>
      <LoadingMark size={size} className="text-fg-tertiary" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
