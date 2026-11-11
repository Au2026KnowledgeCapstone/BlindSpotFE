import { AccountSettings, RequireSession } from "@/features/auth";
import { Providers } from "@/app/providers";
import { StandaloneHeader } from "@/shared/ui/StandaloneHeader";

export default function AccountSettingsPage() {
  return (
    <Providers>
      <RequireSession>
        <div className="min-h-screen bg-canvas text-fg">
          <StandaloneHeader />
          <main className="mx-auto max-w-2xl p-6">
            <AccountSettings />
          </main>
        </div>
      </RequireSession>
    </Providers>
  );
}
