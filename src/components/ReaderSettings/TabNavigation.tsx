import React from "react";
import type { TabType, TabConfig } from "@/types/readerSettings";

interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * Tab navigation for reader settings sidebar
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-2 mb-4 border-b border-slate-700/50 pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/50"
                : "text-slate-400 hover:text-white hover:bg-slate-700/30"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
