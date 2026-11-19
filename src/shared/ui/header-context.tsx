"use client";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/features/workspace";

export function HeaderContext({ projectId }: { projectId: string }) {
  const { projects } = useDashboard();
  const pathname = usePathname();
  const active = projects.data?.find((project) => project.id === projectId);
  return <div className="flex min-w-0 items-center gap-3 text-sm font-semibold"><span aria-hidden className="size-2 shrink-0 rounded-full bg-infer" /><span className="max-w-32 truncate sm:max-w-64">{active?.name || (pathname.startsWith("/account") ? "Account settings" : "All projects")}</span></div>;
}
