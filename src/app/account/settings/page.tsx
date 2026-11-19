import { AccountSettings, RequireSession } from "@/features/auth";
import { Providers } from "@/app/providers";
import { AppShell } from "@/shared/ui/app-shell";

export default function AccountSettingsPage() {
  return (
    <Providers>
      <RequireSession>
        <AppShell projectId=""><AccountSettings /></AppShell>
      </RequireSession>
    </Providers>
  );
}
