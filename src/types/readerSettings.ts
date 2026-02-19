/**
 * Types for Reader Settings Sidebar
 */

export type TabType = "general" | "reading" | "tts" | "toc";

export interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ReaderSettingsSidebarProps {
  onTTS: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  bookId: string;
}
