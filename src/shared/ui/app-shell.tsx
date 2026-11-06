"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/features/auth";
import { HeaderContext } from "./header-context";
import { PanelLeftClose, PanelLeft, LayoutDashboard, Zap, Play, Globe, Sun, Moon } from "lucide-react";
import { useThemeStore } from "./theme-store";
import { Button } from "@/components/ui/button";

export interface AppShellProps {
  children: React.ReactNode;
  projectId: string;
}

const NAV_ITEMS = [
  { label: "Overview", suffix: "", icon: LayoutDashboard },
  { label: "Flows", suffix: "/flows", icon: Zap },
  { label: "Runs", suffix: "/runs", icon: Play },
  { label: "Environments", suffix: "/environments", icon: Globe },
];

function SidebarHeader({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="flex h-12 items-center justify-between px-4 border-b border-border">
      {!collapsed && (
        <span className="font-bold text-sm tracking-tight text-fg">
          Blind<span className="text-accent">Spot</span>
        </span>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeft /> : <PanelLeftClose />}
      </Button>
    </div>
  );
}

function NavList({ projectId, collapsed }: { projectId: string; collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-2 space-y-1 text-xs font-medium">
      {NAV_ITEMS.map((item) => {
        const href = `/projects/${projectId}${item.suffix}`;
        const Icon = item.icon;
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 ${
              isActive
                ? "bg-selected text-fg font-semibold"
                : "text-fg-secondary hover:text-fg hover:bg-hover"
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
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-panel px-4 text-xs sm:px-6">
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

  const next = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${next} theme`;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {mounted && theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

export function AppShell({ children, projectId }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-fg">
      <aside
        className={`flex flex-col border-r border-border bg-panel transition-all duration-180 ${
          collapsed ? "w-16" : "w-[240px]"
        }`}
      >
        <SidebarHeader collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
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
