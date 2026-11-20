"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { AccountMenu } from "@/features/auth";
import { PanelLeftClose, PanelLeft, LayoutDashboard, FileText, CirclePlay, Layers, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/features/workspace/notifications-bell";
import { useDashboard } from "@/features/workspace/use-dashboard";
import { HeaderContext } from "./header-context";
import { BlindSpotMark } from "./BlindSpotMark";

export interface AppShellProps { children: React.ReactNode; projectId: string }
const NAV_ITEMS = [
  { label: "Overview", display: "Overview", suffix: "", icon: LayoutDashboard },
  { label: "Requirements", display: "Requirements", suffix: "/requirements", icon: FileText },
  { label: "Runs", display: "Test Runs", suffix: "/runs", icon: CirclePlay },
  { label: "Members", display: "Team", suffix: "/members", icon: Users },
  { label: "Project setup", display: "Project Setup", suffix: "/setup", icon: Layers },
];
function navClass(active: boolean) {
  return `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 ${active ? "bg-contrast text-on-contrast shadow-ambient" : "text-fg-secondary hover:bg-hover hover:text-fg"}`;
}
function ShellNavigation({ projectId, collapsed }: { projectId: string; collapsed: boolean }) {
  const pathname = usePathname();
  return <nav aria-label="Project navigation" className="flex flex-1 flex-col gap-1 py-4">
    {!projectId && <Link href="/dashboard" aria-label="Dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined} className={navClass(pathname === "/dashboard")}><LayoutDashboard className="size-5 shrink-0" />{!collapsed && <span className="hidden sm:inline">Dashboard</span>}</Link>}
    {projectId && NAV_ITEMS.map(({ label, display, suffix, icon: Icon }) => {
      const href = `/projects/${projectId}${suffix}`;
      const active = suffix ? pathname.startsWith(href) : pathname === href;
      return <Link key={label} href={href} aria-label={label} aria-current={active ? "page" : undefined} className={navClass(active)}><Icon className="size-5 shrink-0" strokeWidth={1.7} />{!collapsed && <span className="hidden sm:inline">{display}</span>}</Link>;
    })}
    {projectId && <Link href="/dashboard" aria-label="Dashboard" className={`${navClass(false)} mt-auto`}><ArrowLeft className="size-5 shrink-0" />{!collapsed && <span className="hidden sm:inline">All projects</span>}</Link>}
  </nav>;
}
function accountProject(pathname: string, projects: { id: string }[] | undefined) {
  if (!pathname.startsWith("/account")) return "";
  return projects?.[0]?.id ?? "";
}
export function AppShell({ children, projectId }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const params = useParams<{ projectId?: string }>();
  const pathname = usePathname();
  const { projects } = useDashboard();
  const activeProjectId = params.projectId || projectId || accountProject(pathname, projects.data);
  return <div className="stitch-shell flex h-dvh w-full overflow-hidden bg-canvas text-fg">
    <aside className={`flex w-16 shrink-0 flex-col border-r border-border bg-panel px-2 sm:px-4 ${collapsed ? "sm:w-20" : "sm:w-64"}`}>
      <div className={`flex h-[88px] shrink-0 items-center justify-center border-b border-subtle ${collapsed ? "flex-col gap-2" : "gap-3"}`}>
        <Link href="/dashboard" aria-label="BlindSpot home" className={`flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 ${collapsed ? "shrink-0" : "flex-1"}`}><BlindSpotMark size={30} className="shrink-0" />{!collapsed && <span className="hidden min-w-0 sm:block"><span className="block text-xl font-bold tracking-tight">BlindSpot</span><span className="mt-1 block text-[11px] uppercase tracking-wider text-fg-tertiary">Product validation</span></span>}</Link>
        <Button variant="ghost" size="icon-xs" className="hidden shrink-0 sm:inline-flex" aria-expanded={!collapsed} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeft /> : <PanelLeftClose />}</Button>
      </div>
      <ShellNavigation projectId={activeProjectId} collapsed={collapsed} />
    </aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-panel px-4 sm:px-8"><HeaderContext projectId={activeProjectId} /><div className="flex items-center gap-3"><NotificationsBell /><AccountMenu /></div></header>
      <main className="min-w-0 flex-1 overflow-auto px-4 py-7 sm:px-8 sm:py-9"><div className="mx-auto w-full max-w-[1600px]">{children}</div></main>
    </div>
  </div>;
}
