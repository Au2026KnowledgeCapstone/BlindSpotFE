"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { ArrowLeftRight, ChevronDown, ChevronRight, FolderKanban } from "lucide-react";

const menuItemClassName = "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-secondary outline-none data-[highlighted]:bg-hover data-[highlighted]:text-primary";

function ProjectMenu({ projectId, projectName }: { projectId: string; projectName: string }) {
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={`Project: ${projectName}`} className="group flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)] data-[popup-open]:bg-hover">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-accent-tint text-accent">
          <FolderKanban aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </span>
        <span className="max-w-40 truncate">{projectName}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-tertiary" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
          <Menu.Popup className="w-56 rounded-lg border border-border bg-overlay p-1 shadow-lg outline-none">
            <Menu.LinkItem render={<Link href={`/projects/${projectId}`} />} closeOnClick className={menuItemClassName}>
              <FolderKanban aria-hidden="true" className="size-4" />Project overview
            </Menu.LinkItem>
            <Menu.LinkItem render={<Link href="/projects" />} closeOnClick className={menuItemClassName}>
              <ArrowLeftRight aria-hidden="true" className="size-4" />Switch project
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

const SECTION_LABELS: Record<string, string> = {
  flows: "Flows",
  runs: "Runs",
  environments: "Environments",
};

export function HeaderContext({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeProjectId = segments[0] === "projects" ? segments[1] ?? projectId : projectId;
  const projectName = activeProjectId === "acme-corp" ? "Acme Corp" : activeProjectId.replace(/[-_]/g, " ");
  const section = segments[2];
  const sectionLabel = section ? SECTION_LABELS[section] ?? "Overview" : "Overview";

  if (segments[0] === "account") {
    return <span className="text-sm font-medium text-primary">Account settings</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <ProjectMenu projectId={activeProjectId} projectName={projectName} />
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
        <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-quaternary" />
        {segments[3] ? (
          <>
            <Link href={`/projects/${activeProjectId}/${section}`} className="rounded text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]">{sectionLabel}</Link>
            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-quaternary" />
            <span aria-current="page" className="truncate text-secondary">{section === "runs" ? "Run details" : "Flow details"}</span>
          </>
        ) : <span aria-current="page" className="truncate text-secondary">{sectionLabel}</span>}
      </nav>
    </div>
  );
}
