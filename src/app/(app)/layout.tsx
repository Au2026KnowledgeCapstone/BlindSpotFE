import React from "react";
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
  const projectId = resolvedParams.projectId ?? "acme-corp";

  return (
    <Providers>
      <AppShell projectId={projectId}>{children}</AppShell>
    </Providers>
  );
}
