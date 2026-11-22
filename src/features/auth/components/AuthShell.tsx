import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BlindSpotMark } from "@/shared/ui/BlindSpotMark";

export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-canvas text-fg">
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-7">
      <Link href="/login" className="flex items-center gap-2 rounded-lg text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"><BlindSpotMark size={30} /><span>BlindSpot</span></Link>
      <span className="flex items-center gap-2 text-xs text-fg-tertiary"><ShieldCheck className="size-4" />Secure workspace</span>
    </header>
    <main className="flex flex-1 items-center justify-center px-5 py-12">
      <section className="w-full max-w-[460px] rounded-2xl border border-subtle bg-panel p-7 shadow-ambient sm:p-10">
        <div className="mb-6 flex justify-center"><BlindSpotMark size={36} /></div>
        {children}
      </section>
    </main>
    <footer className="px-6 pb-7 text-center text-xs text-fg-tertiary">BlindSpot · Browser testing with evidence for every finding.</footer>
  </div>;
}
