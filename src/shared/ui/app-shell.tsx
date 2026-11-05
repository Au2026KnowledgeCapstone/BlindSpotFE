"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/features/auth";
import { HeaderContext } from "./header-context";
import { PanelLeftClose, PanelLeft, LayoutDashboard, FileCheck2, Zap, Play, Globe, Sun, Moon } from "lucide-react";
import { useThemeStore } from "./theme-store";
import { Button } from "@/components/ui/button";

export interface AppShellProps {
  children: React.ReactNode;
  projectId: string;
}

const NAV_ITEMS = [
  { label: "Overview", suffix: "", icon: LayoutDashboard },
  { label: "Requirements", suffix: "/requirements", icon: FileCheck2 },
  { label: "Flows", suffix: "/flows", icon: Zap },
  { label: "Runs", suffix: "/runs", icon: Play },
  { label: "Environments", suffix: "/environments", icon: Globe },
];

function SidebarLogo({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <img src="/blindspot-icon.svg" alt="" width={24} height={24} className="shrink-0" />
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold tracking-tight text-fg">BlindSpot</p>
          <p className="truncate text-[11px] text-fg-tertiary">Product validation</p>
        </div>
      )}
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

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-raised text-[11px] font-semibold text-fg-secondary">
        PM
      </span>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-fg">Product manager</p>
          <p className="truncate text-[11px] text-fg-tertiary">Local workspace</p>
        </div>
      )}
    </div>
  );
}

function NavList({ projectId, collapsed }: { projectId: string; collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 text-xs font-medium">
      {!collapsed && (
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-fg-tertiary">
          Workspace
        </p>
      )}
      {NAV_ITEMS.map((item) => {
        const href = `/projects/${projectId}${item.suffix}`;
        const Icon = item.icon;
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 ${
              isActive
                ? "border border-border bg-panel font-semibold text-fg shadow-ambient"
                : "border border-transparent text-fg-secondary hover:text-fg hover:bg-hover"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function TopHeader({ projectId }: { projectId: string }) {
  return (
    <header className="mt-3 mr-3 mb-3 flex h-14 shrink-0 items-center justify-between gap-3 rounded-xl border border-border bg-panel px-4 text-xs shadow-ambient sm:px-6">
      <HeaderContext projectId={projectId} />
      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />
        <AccountMenu />
      </div>
    </header>
  );
}

/**
 * Reads the shared theme store rather than poking the DOM directly, and names
 * the theme it switches to — the old control just said "Theme", which told you
 * neither the current state nor what pressing it would do.
 */
function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  /**
   * Until mounted, render as if the SSR default theme (light — see
   * app/layout.tsx) is active, even if localStorage disagrees. Reading the
   * real `theme` before mount produces a label/icon that matches the client
   * but not the server-rendered markup, which React flags as a hydration
   * mismatch.
   */
  const displayTheme = mounted ? theme : "light";
  const next = displayTheme === "dark" ? "light" : "dark";
  const label = `Switch to ${next} theme`;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {displayTheme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

export function AppShell({ children, projectId }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-fg">
      <aside
        className={`m-3 flex flex-col gap-3 rounded-xl border border-border bg-panel p-3 shadow-ambient transition-all duration-180 ${
          collapsed ? "w-20" : "w-[240px]"
        }`}
      >
        <SidebarLogo collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <NavList projectId={projectId} collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} />
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
