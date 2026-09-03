"use client";

import { useState } from "react";
import { Settings2, Terminal } from "lucide-react";
import { SettingsForm } from "@/components/settings/settings-form";
import { DeveloperTab } from "@/components/settings/developer-tab";
import type { Store } from "@prisma/client";

const TABS = [
  { id: "general", label: "Général", icon: Settings2 },
  { id: "developer", label: "Développeur", icon: Terminal },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface SettingsTabsProps {
  store: Store;
}

export function SettingsTabs({ store }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-line">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-3 hover:text-ink-2"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-accent" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "general" && <SettingsForm store={store} />}
      {activeTab === "developer" && <DeveloperTab storeId={store.id} />}
    </div>
  );
}
