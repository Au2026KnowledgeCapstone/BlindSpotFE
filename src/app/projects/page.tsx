import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { AccountMenu } from "@/features/auth";
import { PageHeader } from "@/shared/ui/PageHeader";

const PROJECTS = [{ id: "acme-corp", name: "Acme Corp" }];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-canvas text-fg">
      <header className="flex h-14 items-center justify-between border-b border-border bg-panel px-4 sm:px-6">
        <span className="text-sm font-semibold tracking-tight text-fg">
          Blind<span className="text-accent">Spot</span>
        </span>
        <AccountMenu />
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <PageHeader
          title="Projects"
          description="Pick a project to see what its flows have been doing."
        />

        <ul className="divide-y divide-subtle overflow-hidden rounded-md border border-border bg-panel shadow-ambient">
          {PROJECTS.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="group flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-hover focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-accent-tint text-accent">
                  <Building2 aria-hidden className="size-4" strokeWidth={1.5} />
                </span>
                <span className="flex-1 font-medium text-fg">{project.name}</span>
                <ChevronRight
                  aria-hidden
                  className="size-4 text-fg-quaternary transition-colors group-hover:text-fg-tertiary"
                />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
