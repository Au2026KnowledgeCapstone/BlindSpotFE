
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-canvas text-primary lg:grid-cols-2">

      {/* Left panel: Information about BlindSpot */}
      <section className="flex flex-col justify-center gap-8 border-b border-border bg-panel px-8 py-14 lg:border-b-0 lg:border-r lg:px-16">

        <div className="text-xl font-semibold tracking-tight">
          Blind<span className="text-accent">Spot</span>
        </div>

        <div className="max-w-lg space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Know what broke. And why.
          </h1>

          <p className="text-secondary">
            BlindSpot is an AI-powered testing platform that
            discovers application behavior, detects regressions,
            and provides evidence to help developers understand
            failures.
          </p>
        </div>

      </section>

      {/* Right panel: Login or Signup form */}
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </section>

    </main>
  );
}
