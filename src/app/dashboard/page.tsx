import { DashboardContent } from "@/features/workspace/dashboard-content";
import { Providers } from "@/app/providers";
import { RequireSession } from "@/features/auth";
import { AppShell } from "@/shared/ui/app-shell";

export default function DashboardPage() {
  return (
    <Providers>
      <RequireSession>
        <AppShell projectId="">
          <DashboardContent />
        </AppShell>
      </RequireSession>
    </Providers>
  );
}
