/**
 * Shared form-field styling.
 *
 * DESIGN.md requires a visible focus ring on every interactive element
 * (--bs-focus-ring at 3px). Most inputs in the app shipped without one, each
 * repeating its own border/bg/text string, so the treatment is centralised
 * here: FIELD for standard density, FIELD_DENSE for the packed in-app forms.
 */

/** Border, fill, text, hover, focus ring, and invalid state. No size or radius. */
const FIELD_BASE =
  "w-full border border-border bg-raised text-fg transition-colors " +
  "placeholder:text-fg-quaternary hover:border-strong " +
  "focus-visible:border-focus-ring focus-visible:ring-3 focus-visible:ring-focus-ring/50 focus-visible:outline-none " +
  "aria-invalid:border-fail aria-invalid:ring-3 aria-invalid:ring-fail-border " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/** Standard density: 14px text in an 8px-radius field. Auth and settings forms. */
export const FIELD = `${FIELD_BASE} rounded-lg px-3 py-2 text-sm`;

/** Packed density: 12px text in a 6px-radius field. In-app flow and env editors. */
export const FIELD_DENSE = `${FIELD_BASE} rounded-md px-2.5 py-1.5 text-xs`;

/** Multi-line variant of the standard field. */
export const FIELD_TEXTAREA = `${FIELD} resize-y`;

/** Checkboxes keep the native control but take the system's border and ring. */
export const FIELD_CHECKBOX =
  "rounded border-border text-accent-solid " +
  "focus-visible:ring-3 focus-visible:ring-focus-ring/50 focus-visible:outline-none";
