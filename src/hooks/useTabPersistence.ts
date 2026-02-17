import { useState, useEffect } from "react";
import type { TabType } from "@/types/readerSettings";

/**
 * Hook for persisting active tab selection in localStorage
 */
export function useTabPersistence(defaultTab: TabType = "general") {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem("readerSettingsActiveTab");
    return (saved as TabType) || defaultTab;
  });

  useEffect(() => {
    localStorage.setItem("readerSettingsActiveTab", activeTab);
  }, [activeTab]);

  return { activeTab, setActiveTab };
}
