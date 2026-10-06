"use client";

import React from "react";
import type { Failure, TestStepRun } from "@/features/runs";
import { AiAnalysisTab } from "./ai-analysis-tab";
import { NetworkTab } from "./network-tab";
import { ConsoleTab } from "./console-tab";
import { DiscussionTab } from "./discussion-tab";
import { Sparkles, Network, Terminal, MessageSquare, type LucideIcon } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { id: "ai", label: "AI analysis", icon: Sparkles },
  { id: "network", label: "Network", icon: Network },
  { id: "console", label: "Console", icon: Terminal },
  { id: "discussion", label: "Discussion", icon: MessageSquare },
];

export interface DetailsTabsProps {
  steps: TestStepRun[];
  currentStep: TestStepRun | undefined;
  failure?: Failure | undefined;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

function tabButtonClass(active: boolean): string {
  if (active) {
    return "border-[var(--bs-accent)] text-[var(--bs-text-primary)] bg-[var(--bs-bg-panel)]";
  }
  return "border-transparent text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-secondary)]";
}

function TabContent({
  tab,
  failure,
  steps,
  currentStep,
}: {
  tab: string;
  failure?: Failure | undefined;
  steps: TestStepRun[];
  currentStep: TestStepRun | undefined;
}) {
  if (tab === "ai") return <AiAnalysisTab failure={failure} />;
  if (tab === "network") return <NetworkTab steps={steps} currentStep={currentStep} />;
  if (tab === "console") return <ConsoleTab logs={currentStep?.consoleLogs ?? []} />;
  if (tab === "discussion") return <DiscussionTab />;
  return null;
}

export function DetailsTabs({ steps, currentStep, failure, activeTab, onSelectTab }: DetailsTabsProps) {
  return (
    <section
      aria-label="Details and tabs"
      className="border border-[var(--bs-border-default)] bg-[var(--bs-bg-panel)] rounded-lg overflow-hidden flex flex-col lg:h-[750px]"
    >
      <div className="flex items-center border-b border-[var(--bs-border-subtle)] bg-[var(--bs-bg-raised)] px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bs-focus-ring)] ${tabButtonClass(isActive)}`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <TabContent tab={activeTab} failure={failure} steps={steps} currentStep={currentStep} />
      </div>
    </section>
  );
}
