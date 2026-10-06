"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, LayoutDashboard, Zap, Play, Bandage, Globe } from "lucide-react";

export interface AppShellProps {
  children: React.ReactNode;
  projectId: string;
}

const NAV_ITEMS = [
  { label: "Overview", suffix: "", icon: LayoutDashboard },
  { label: "Flows", suffix: "/flows", icon: Zap },
  { label: "Runs", suffix: "/runs", icon: Play },
  { label: "Heals Queue", suffix: "/heals", icon: Bandage },
  { label: "Environments", suffix: "/environments", icon: Globe },
];

function SidebarHeader({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="flex h-12 items-center justify-between px-4 border-b border-border">
      {!collapsed && (
        <span className="font-bold text-sm tracking-tight text-primary">
          Blind<span className="text-accent">Spot</span>
        </span>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="p-1 text-tertiary hover:text-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>
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
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)] ${
              isActive
                ? "bg-selected text-primary font-semibold"
                : "text-secondary hover:text-primary hover:bg-hover"
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
    <header className="flex h-12 items-center justify-between px-6 border-b border-border bg-panel text-xs">
      <div className="flex items-center gap-3">
        <select
          defaultValue={projectId}
          className="bg-raised border border-border rounded px-2.5 py-1 text-xs text-primary font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
        >
          <option value="acme-corp">Acme Corp</option>
        </select>
        <span className="text-quaternary">/</span>
        <select
          defaultValue="staging"
          className="bg-raised border border-border rounded px-2.5 py-1 text-xs text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
        >
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="pr_preview">PR Preview #482</option>
          <option value="development">Development</option>
        </select>
      </div>
      <ThemeToggle />
    </header>
  );
}

function ThemeToggle() {
  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="px-2.5 py-1 text-xs border border-border rounded bg-raised text-secondary hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bs-focus-ring)]"
    >
      Theme
    </button>
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
        <main className="flex-1 overflow-auto p-6 bg-canvas">{children}</main>
      </div>
    </div>
  );
}
