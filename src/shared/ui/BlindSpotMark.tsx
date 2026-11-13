/** The BlindSpot eye mark, inline so its stroke is `currentColor` and
 * follows the surrounding text color across themes — an `<img>` of the
 * static SVG can't do that; it stays whatever color the file hardcodes. */
export function BlindSpotMark({ size = 24, className }: { size?: number; className?: string }) {
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
      <path d="M 148 236 A 115 115 0 0 1 364 236" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      <path d="M 148 276 A 115 115 0 0 0 364 276" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
    </svg>
  );
}
