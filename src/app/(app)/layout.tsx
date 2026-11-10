import React from "react";
import { RequireSession } from "@/features/auth";
import { Providers } from "@/app/providers";
import { AppShell } from "@/shared/ui/app-shell";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId?: string }>;
}) {
  const resolvedParams = await params;
  const projectId = resolvedParams.projectId ?? "";

  return (
    <Providers>
      <RequireSession>
        <AppShell projectId={projectId}>{children}</AppShell>
      </RequireSession>
    </Providers>
  );
}
