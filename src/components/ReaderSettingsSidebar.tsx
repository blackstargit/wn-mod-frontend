import React from "react";
import { Settings, BookOpen, Mic, List } from "lucide-react";
import { useReaderSettings } from "@/contexts/ReaderSettingsContext";
import { useTTS } from "@/contexts/TTSContext";
import { useTabPersistence, useTOCData } from "@/hooks";
import {
  SidebarHeader,
  TabNavigation,
  GeneralTab,
  ReadingTab,
  TTSTab,
  TOCTab,
} from "@/components/ReaderSettings";
import type { TabType } from "@/types/readerSettings";

interface ReaderSettingsSidebarProps {
  onTTS: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  bookId: string;
}

const TABS = [
  { id: "general" as TabType, label: "", icon: Settings },
  { id: "reading" as TabType, label: "", icon: BookOpen },
  { id: "tts" as TabType, label: "", icon: Mic },
  { id: "toc" as TabType, label: "", icon: List },
];

const ReaderSettingsSidebar: React.FC<ReaderSettingsSidebarProps> = ({
  onTTS,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  bookId,
}) => {
  const { activeTab, setActiveTab } = useTabPersistence();
  const { tocData, tocLoading, expandedVolumes, setExpandedVolumes } =
    useTOCData(bookId);

  const {
    selectedFont,
    favoriteFonts,
    fontSize,
    textColor,
    contentBgColor,
    screenBgColor,
    favoriteColors = { text: [], bg: [], screen: [] },
    isFullscreen,
    brightness,
    sidebarOpen,
    isDetached,
    setSelectedFont,
    setFontSize,
    setTextColor,
    setContentBgColor,
    setScreenBgColor,
    setBrightness,
    setSidebarOpen,
    toggleFavorite,
    toggleFavoriteColor,
    toggleFullscreen,
    toggleDetached,
  } = useReaderSettings();

  const tts = useTTS();

  const handleToggleVolume = (index: number) => {
    setExpandedVolumes((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50 transition-all duration-300 z-50 ${
        sidebarOpen ? "w-80" : "translate-x-[-100%] w-80"
      } overflow-hidden`}
    >
      <div className="p-6 h-full flex flex-col">
        <SidebarHeader
          isDetached={isDetached}
          onToggleDetached={toggleDetached}
          onClose={() => setSidebarOpen(false)}
        />

        <TabNavigation
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Scrollable tab content */}
        <div className="flex-1 overflow-y-auto pr-2">
          {activeTab === "general" && (
            <GeneralTab
              onPrev={onPrev}
              onNext={onNext}
              hasPrev={hasPrev}
              hasNext={hasNext}
              brightness={brightness}
              onBrightnessChange={setBrightness}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          )}

          {activeTab === "reading" && (
            <ReadingTab
              selectedFont={selectedFont}
              favoriteFonts={favoriteFonts}
              fontSize={fontSize}
              textColor={textColor}
              contentBgColor={contentBgColor}
              screenBgColor={screenBgColor}
              favoriteColors={favoriteColors}
              onSelectFont={setSelectedFont}
              onToggleFavoriteFont={toggleFavorite}
              onFontSizeChange={setFontSize}
              onTextColorChange={setTextColor}
              onContentBgColorChange={setContentBgColor}
              onScreenBgColorChange={setScreenBgColor}
              onToggleFavoriteColor={toggleFavoriteColor}
            />
          )}

          {activeTab === "tts" && (
            <TTSTab
              availableVoices={tts.availableVoices}
              selectedVoice={tts.selectedVoice}
              playbackRate={tts.playbackRate}
              onVoiceChange={tts.setVoice}
              onPlaybackRateChange={tts.setPlaybackRate}
              onStartTTS={onTTS}
            />
          )}

          {activeTab === "toc" && (
            <TOCTab
              bookId={bookId}
              tocData={tocData}
              tocLoading={tocLoading}
              expandedVolumes={expandedVolumes}
              onToggleVolume={handleToggleVolume}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReaderSettingsSidebar;
