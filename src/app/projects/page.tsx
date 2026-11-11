import { ProjectsDirectory } from "@/features/workspace/projects-directory";
import { Providers } from "@/app/providers";
import { RequireSession } from "@/features/auth";
import { StandaloneHeader } from "@/shared/ui/StandaloneHeader";

export default function ProjectsPage() {
  return (
    <Providers>
      <RequireSession>
        <div className="min-h-screen bg-canvas text-fg">
          <StandaloneHeader />
          <main className="mx-auto max-w-2xl space-y-6 p-6">
            <ProjectsDirectory />
          </main>
        </div>
      </RequireSession>
    </Providers>
  );
}
