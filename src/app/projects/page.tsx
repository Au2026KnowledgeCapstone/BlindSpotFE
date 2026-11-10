import { ProjectsDirectory } from "@/features/workspace/projects-directory";
import { Providers } from "@/app/providers";
import { RequireSession } from "@/features/auth";
import { AppShell } from "@/shared/ui/app-shell";

export default function ProjectsPage() {
  return <Providers><RequireSession><AppShell projectId=""><ProjectsDirectory /></AppShell></RequireSession></Providers>;
}
