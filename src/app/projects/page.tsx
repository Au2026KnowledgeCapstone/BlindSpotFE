import { ProjectsDirectory } from "@/features/workspace/projects-directory";
import { Providers } from "@/app/providers";
import { RequireSession, AccountMenu } from "@/features/auth";

export default function ProjectsPage() {
  return (
    <Providers>
      <RequireSession>
        <div className="min-h-screen bg-canvas text-fg">
          <header className="flex h-14 items-center justify-between border-b border-border bg-panel px-4 sm:px-6">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-fg">
              <img src="/blindspot-icon.svg" alt="" width={20} height={20} />
              <span>BlindSpot</span>
            </span>
            <AccountMenu />
          </header>
          <main className="mx-auto max-w-2xl space-y-6 p-6">
            <ProjectsDirectory />
          </main>
        </div>
      </RequireSession>
    </Providers>
  );
}
