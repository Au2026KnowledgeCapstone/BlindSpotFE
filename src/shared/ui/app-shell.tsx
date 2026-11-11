"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { AccountMenu } from "@/features/auth";
import { HeaderContext } from "./header-context";
import { PanelLeftClose, PanelLeft, ArrowLeft, LayoutDashboard, FileCheck2, Play, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/features/workspace/notifications-bell";
import { BlindSpotMark } from "./BlindSpotMark";

export interface AppShellProps {
  children: React.ReactNode;
  projectId: string;
}

/** Leaves the current project entirely — the one item here that isn't a tab within it. */
const ESCAPE_ITEM = { label: "Projects", href: "/projects", icon: ArrowLeft };

const NAV_ITEMS = [
  { label: "Overview", suffix: "", icon: LayoutDashboard },
  { label: "Requirements", suffix: "/requirements", icon: FileCheck2 },
  { label: "Runs", suffix: "/runs", icon: Play },
  { label: "Project setup", suffix: "/setup", icon: Globe },
  { label: "Members", suffix: "/members", icon: Users },
];

function SidebarLogo({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="mb-3 flex shrink-0 items-center gap-2">
      <Link
        href="/projects"
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"
      >
        <BlindSpotMark size={24} className="shrink-0 text-fg" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-tight text-fg">BlindSpot</p>
            <p className="truncate text-[11px] text-fg-tertiary">Product validation</p>
          </div>
        )}
      </Link>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="shrink-0"
      >
        {collapsed ? <PanelLeft /> : <PanelLeftClose />}
      </Button>
    </div>
  );
}

function navItemClass(isActive: boolean) {
  return `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 ${
    isActive
      ? "border border-border bg-panel font-semibold text-fg shadow-ambient"
      : "border border-transparent text-fg-secondary hover:text-fg hover:bg-hover"
  }`;
}

function NavList({ projectId, collapsed }: { projectId: string; collapsed: boolean }) {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = params.projectId || projectId;
  const EscapeIcon = ESCAPE_ITEM.icon;

  return (
    <nav aria-label="Project navigation" className="flex flex-1 flex-col text-xs font-medium">
      <Link href={ESCAPE_ITEM.href} className={navItemClass(pathname === ESCAPE_ITEM.href)}>
        <EscapeIcon className="w-4 h-4 shrink-0" />
        {!collapsed && <span>{ESCAPE_ITEM.label}</span>}
      </Link>
      {!!activeProjectId && (
        /* The top and (when expanded) left guide lines are gradient fades
           rather than solid borders, so they meet at the box's top-left
           corner and taper off instead of reading as hard, disconnected
           lines — the left one fades out as it runs down to the sidebar's
           bottom edge. */
        <div className={`relative mt-2 flex-1 space-y-1 pt-2 ${collapsed ? "" : "pl-3"}`}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-border to-transparent"
          />
          {!collapsed && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-border to-transparent"
            />
          )}
          {NAV_ITEMS.map((item) => {
            const href = `/projects/${activeProjectId}${item.suffix}`;
            const Icon = item.icon;
            return (
              <Link key={href} href={href} className={navItemClass(pathname === href)}>
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

function TopHeader({ projectId }: { projectId: string }) {
  return (
    <header className="mt-3 mr-3 mb-3 flex h-14 shrink-0 items-center justify-between gap-3 rounded-xl border border-border bg-panel px-4 text-xs shadow-ambient sm:px-6">
      <HeaderContext projectId={projectId} />
      <div className="flex shrink-0 items-center gap-3">
        <NotificationsBell />
        <AccountMenu />
      </div>
    </header>
  );
}

export function AppShell({ children, projectId }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-fg">
      <aside
        className={`m-3 flex flex-col rounded-xl border border-border bg-panel p-3 shadow-ambient transition-all duration-180 ${
          collapsed ? "w-20" : "w-[240px]"
        }`}
      >
        <SidebarLogo collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <NavList projectId={projectId} collapsed={collapsed} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader projectId={projectId} />
        {/* Content caps its measure so tables and headers don't stretch to the
            full width of an ultrawide display and lose their left-edge anchor. */}
        <main className="flex-1 overflow-auto bg-canvas p-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
