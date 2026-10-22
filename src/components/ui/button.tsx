import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Variants are written against BlindSpot's own token vocabulary (globals.css
 * @theme), not shadcn's. The shadcn names this file shipped with — primary,
 * muted, ring, destructive, foreground, input, background — were never mapped
 * into @theme, so they compiled to nothing: `default` rendered the *text*
 * colour as its background with no foreground colour at all, `ghost` had no
 * hover, and no variant had a focus ring. The `dark:` modifiers were dead too;
 * this app themes via [data-theme], not the `dark` class.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-focus-ring focus-visible:ring-3 focus-visible:ring-focus-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-fail aria-invalid:ring-3 aria-invalid:ring-fail-border [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-accent-solid text-white hover:bg-accent-solid-hover",
        outline:
          "border-border bg-canvas text-fg hover:bg-panel aria-expanded:bg-panel",
        secondary:
          "bg-raised text-fg hover:bg-overlay aria-expanded:bg-overlay",
        ghost:
          "text-fg-secondary hover:bg-hover hover:text-fg aria-expanded:bg-hover aria-expanded:text-fg",
        destructive:
          "bg-fail-tint text-fail hover:border-fail-border focus-visible:border-fail focus-visible:ring-fail-border",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
