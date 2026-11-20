/** The outer ring stays still while the inner eye rotates around its center. */
export function LoadingMark({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex shrink-0 align-middle ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 512 512" fill="none" className="absolute inset-0 size-full" aria-hidden="true">
        <circle cx="256" cy="256" r="190" stroke="currentColor" strokeWidth="20" />
      </svg>
      <svg viewBox="0 0 512 512" fill="none" className="absolute inset-0 size-full animate-spin" style={{ transformOrigin: "50% 50%" }} aria-hidden="true">
        <path d="M 148 236 A 115 115 0 0 1 364 236" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
        <path d="M 148 276 A 115 115 0 0 0 364 276" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      </svg>
    </span>
  );
}
