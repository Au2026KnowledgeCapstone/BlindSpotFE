import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";

const PROJECTS = [{ id: "acme-corp", name: "Acme Corp" }];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-canvas text-fg p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <span className="font-bold text-sm tracking-tight text-primary">
            Blind<span className="text-accent">Spot</span>
          </span>
          <h1 className="text-lg font-bold text-primary mt-3">Projects</h1>
        </div>

        <div className="border border-border bg-panel rounded-md divide-y divide-border">
          {PROJECTS.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
            >
              <Building2 className="w-4 h-4 shrink-0 text-tertiary" />
              <span className="flex-1 font-medium text-primary">{project.name}</span>
              <ChevronRight className="w-4 h-4 text-tertiary" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
