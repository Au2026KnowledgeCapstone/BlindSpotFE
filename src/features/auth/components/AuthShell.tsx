
import type { ReactNode } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";

interface AuthShellProps {
  children: ReactNode;
}

function DemoFinding() {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-canvas">
      <figcaption className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 text-xs">
        <span className="font-medium text-secondary">Demo finding</span>
        <span className="text-tertiary">Checkout / Total consistency</span>
      </figcaption>
      <div className="space-y-5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0 text-fail" />
          Checkout total changed
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <dt className="text-xs text-secondary">Expected total</dt>
            <dd className="font-mono text-2xl font-medium tabular-nums">$278</dd>
          </div>
          <div className="space-y-1 border-l border-border pl-4">
            <dt className="text-xs text-secondary">Observed total</dt>
            <dd className="font-mono text-2xl font-medium tabular-nums text-fail">$249</dd>
          </div>
        </dl>
        <p className="border-t border-border pt-4 text-sm leading-relaxed text-secondary">
          <span className="font-medium text-primary">Evidence:</span> The $29
          protection plan appears on the order but is missing from the total.
        </p>
      </div>
    </figure>
  );
}

function ProductIntroduction() {
  return (
    <section className="flex flex-col justify-center gap-8 border-b border-border bg-panel px-8 py-14 lg:border-b-0 lg:border-r lg:px-16">
      <div className="text-xl font-semibold tracking-tight">
        Blind<span className="text-accent">Spot</span>
      </div>
      <div className="max-w-lg space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your app changed.<br />Did its behavior?
          </h1>
          <p className="leading-relaxed text-secondary">
            Discover user flows, capture a baseline, and replay checks against
            your next build—with evidence for every finding.
          </p>
        </div>
        <ol aria-label="Testing workflow" className="flex flex-wrap items-center gap-3 text-xs font-medium text-secondary">
          <li>Discover</li>
          <li className="flex items-center gap-3"><ArrowRight aria-hidden="true" className="size-3 text-tertiary" />Baseline</li>
          <li className="flex items-center gap-3"><ArrowRight aria-hidden="true" className="size-3 text-tertiary" />Replay</li>
        </ol>
        <DemoFinding />
        <p className="text-xs leading-relaxed text-tertiary">
          Observed evidence. Labelled AI interpretation. Clear coverage gaps.
        </p>
      </div>
    </section>
  );
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-canvas text-primary lg:grid-cols-2">

      <ProductIntroduction />

      {/* Right panel: Login or Signup form */}
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </section>

    </main>
  );
}
