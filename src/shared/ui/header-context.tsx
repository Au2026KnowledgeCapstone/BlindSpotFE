"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FolderKanban } from "lucide-react";
import { useDashboard } from "@/features/workspace";

/**
 * Plain label, not a control. It used to be a dropdown offering "Project
 * overview" and "Switch project" — both now fully duplicated by the
 * sidebar's persistent Overview and Projects links, so the menu added a
 * second, less discoverable way to do the same two things.
 */
function ProjectLabel({ projectName }: { projectName: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2 px-2 py-1.5 text-sm font-medium text-fg">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-accent-tint text-accent">
        <FolderKanban aria-hidden="true" className="size-4" strokeWidth={1.5} />
      </span>
      <span className="max-w-40 truncate">{projectName}</span>
    </span>
  );
}

const SECTION_LABELS: Record<string, string> = {
  requirements: "Requirements",
  runs: "Runs",
  setup: "Project setup",
  members: "Members",
  settings: "Settings",
};

// eslint-disable-next-line complexity -- Breadcrumb rendering depends on the active route depth and section.
export function HeaderContext({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeProjectId = segments[0] === "projects" && segments[1] ? segments[1] : projectId;
  const { projects } = useDashboard();
  const projectName = projects.data?.find((project) => project.id === activeProjectId)?.name ?? (activeProjectId ? "Project" : "Dashboard");
  const section = segments[2];
  const sectionLabel = section ? SECTION_LABELS[section] ?? "Overview" : "Overview";

  if (segments[0] === "account") {
    return <span className="text-sm font-medium text-fg">Account settings</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <ProjectLabel projectName={projectName} />
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
        <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-fg-quaternary" />
        {segments[3] ? (
          <>
            <Link href={`/projects/${activeProjectId}/${section}`} className="rounded text-fg-secondary hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50">{sectionLabel}</Link>
            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-fg-quaternary" />
            <span aria-current="page" className="truncate text-fg-secondary">Run details</span>
          </>
        ) : <span aria-current="page" className="truncate text-fg-secondary">{sectionLabel}</span>}
      </nav>
    </div>
  );
}
