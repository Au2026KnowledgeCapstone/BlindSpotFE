/** The BlindSpot eye mark as a loading indicator: the outer circle holds
 * still, the inner eyelid arcs spin — same `animate-spin` utility the
 * status spinners use, so it already degrades to an opacity pulse under
 * `prefers-reduced-motion` (see globals.css) without any extra handling here. */
export function LoadingMark({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="256" cy="256" r="190" stroke="currentColor" strokeWidth="20" />
      <g className="animate-spin" style={{ transformBox: "view-box", transformOrigin: "256px 256px" }}>
        <path d="M 148 236 A 115 115 0 0 1 364 236" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
        <path d="M 148 276 A 115 115 0 0 0 364 276" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      </g>
    </svg>
  );
}
