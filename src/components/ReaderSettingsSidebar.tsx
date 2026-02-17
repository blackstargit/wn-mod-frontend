import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
  Search,
  Star,
  StarOff,
  Maximize,
  Minimize,
  Pin,
  PinOff,
  Sun,
  Volume2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Mic,
} from "lucide-react";
import {
  useReaderSettings,
  FONT_LIBRARY,
} from "@/contexts/ReaderSettingsContext";
import { useTTS } from "@/contexts/TTSContext";

interface ReaderSettingsSidebarProps {
  onTTS: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

type TabType = "general" | "reading" | "tts";

const ReaderSettingsSidebar: React.FC<ReaderSettingsSidebarProps> = ({
  onTTS,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const [fontSearch, setFontSearch] = useState("");
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem("readerSettingsActiveTab");
    return (saved as TabType) || "general";
  });

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

  const filteredFonts = FONT_LIBRARY.filter((font) =>
    font.name.toLowerCase().includes(fontSearch.toLowerCase()),
  );

  const favoriteFontsList = FONT_LIBRARY.filter((font) =>
    favoriteFonts.includes(font.name),
  );

  // Persist active tab
  useEffect(() => {
    localStorage.setItem("readerSettingsActiveTab", activeTab);
  }, [activeTab]);

  const tabs = [
    { id: "general" as TabType, label: "General", icon: Settings },
    { id: "reading" as TabType, label: "Reading", icon: BookOpen },
    { id: "tts" as TabType, label: "TTS", icon: Mic },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50 transition-all duration-300 z-50 ${
        sidebarOpen ? "w-80" : "translate-x-[-100%] w-80"
      } overflow-hidden`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Reader Settings
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDetached}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title={isDetached ? "Attach sidebar" : "Detach sidebar"}
            >
              {isDetached ? (
                <Pin className="w-4 h-4 text-purple-400" />
              ) : (
                <PinOff className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-slate-700/50 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Navigation Controls */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Navigation
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onPrev}
                    disabled={!hasPrev}
                    className="col-span-1 flex items-center justify-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    onClick={onNext}
                    disabled={!hasNext}
                    className="col-span-1 flex items-center justify-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Brightness */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Brightness
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="text-white font-mono text-sm w-12 text-right">
                    {brightness}%
                  </span>
                </div>
              </div>

              {/* Reading Width */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Reading Width
                </h3>
                <button
                  onClick={toggleFullscreen}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    isFullscreen
                      ? "bg-purple-600/20 border border-purple-500/50"
                      : "bg-slate-900/50 border border-slate-700/50 hover:bg-slate-700/30"
                  }`}
                >
                  <span className="text-white font-medium flex items-center gap-2">
                    {isFullscreen ? (
                      <>
                        <Minimize className="w-4 h-4" />
                        Reduce Size
                      </>
                    ) : (
                      <>
                        <Maximize className="w-4 h-4" />
                        Increase Screen Size
                      </>
                    )}
                  </span>
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${
                      isFullscreen ? "bg-purple-600" : "bg-slate-600"
                    } relative`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isFullscreen ? "translate-x-6" : ""
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Reading Tab */}
          {activeTab === "reading" && (
            <div className="space-y-6">
              {/* Font Selection */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Font Family
                </h3>

                <div className="mb-2 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                  <span
                    className="text-white font-medium"
                    style={{ fontFamily: selectedFont.family }}
                  >
                    {selectedFont.name}
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search fonts..."
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    onFocus={() => setFontDropdownOpen(true)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />

                  {fontDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setFontDropdownOpen(false)}
                      />

                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-20">
                        {favoriteFontsList.length > 0 && (
                          <div className="p-2 border-b border-slate-700/50">
                            <h4 className="text-xs font-semibold text-slate-400 mb-2 px-2 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              Favorites
                            </h4>
                            <div className="space-y-1">
                              {favoriteFontsList.map((font) => (
                                <button
                                  key={font.name}
                                  onClick={() => {
                                    setSelectedFont(font);
                                    setFontDropdownOpen(false);
                                    setFontSearch("");
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                                    selectedFont.name === font.name
                                      ? "bg-purple-600/20 border border-purple-500/50"
                                      : "hover:bg-slate-700/50"
                                  }`}
                                >
                                  <span
                                    className="text-white text-sm"
                                    style={{ fontFamily: font.family }}
                                  >
                                    {font.name}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(font.name);
                                    }}
                                    className="p-1 hover:bg-slate-600/50 rounded"
                                  >
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  </button>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-2">
                          <h4 className="text-xs font-semibold text-slate-400 mb-2 px-2">
                            All Fonts
                          </h4>
                          <div className="space-y-1">
                            {filteredFonts.map((font) => (
                              <button
                                key={font.name}
                                onClick={() => {
                                  setSelectedFont(font);
                                  setFontDropdownOpen(false);
                                  setFontSearch("");
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                                  selectedFont.name === font.name
                                    ? "bg-purple-600/20 border border-purple-500/50"
                                    : "hover:bg-slate-700/50"
                                }`}
                              >
                                <span
                                  className="text-white text-sm"
                                  style={{ fontFamily: font.family }}
                                >
                                  {font.name}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(font.name);
                                  }}
                                  className="p-1 hover:bg-slate-600/50 rounded"
                                >
                                  {favoriteFonts.includes(font.name) ? (
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ) : (
                                    <StarOff className="w-4 h-4 text-slate-500" />
                                  )}
                                </button>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Font Size
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="text-white font-mono text-sm w-12 text-right">
                    {fontSize}px
                  </span>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Text Color
                </h3>

                {favoriteColors.text.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {favoriteColors.text.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 ${
                          textColor === color
                            ? "border-purple-500"
                            : "border-slate-700/50"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700/50"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={() => toggleFavoriteColor(textColor, "text")}
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      {favoriteColors.text.includes(textColor) ? (
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Background Color */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Content Background
                </h3>

                {favoriteColors.bg.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {favoriteColors.bg.map((color) => (
                      <button
                        key={color}
                        onClick={() => setContentBgColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 ${
                          contentBgColor === color
                            ? "border-purple-500"
                            : "border-slate-700/50"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={contentBgColor}
                    onChange={(e) => setContentBgColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700/50"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={contentBgColor}
                      onChange={(e) => setContentBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={() => toggleFavoriteColor(contentBgColor, "bg")}
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      {favoriteColors.bg.includes(contentBgColor) ? (
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Screen Background Color */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Screen Background
                </h3>

                {favoriteColors.screen?.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {favoriteColors.screen?.map((color) => (
                      <button
                        key={color}
                        onClick={() => setScreenBgColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 ${
                          screenBgColor === color
                            ? "border-purple-500"
                            : "border-slate-700/50"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={screenBgColor}
                    onChange={(e) => setScreenBgColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700/50"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={screenBgColor}
                      onChange={(e) => setScreenBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={() =>
                        toggleFavoriteColor(screenBgColor, "screen")
                      }
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      {favoriteColors.screen?.includes(screenBgColor) ? (
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TTS Tab */}
          {activeTab === "tts" && (
            <div className="space-y-6">
              {/* Voice Selection */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Voice
                </h3>
                <select
                  value={tts.selectedVoice?.name || ""}
                  onChange={(e) => {
                    const voice = tts.availableVoices.find(
                      (v) => v.name === e.target.value,
                    );
                    if (voice) tts.setVoice(voice);
                  }}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                >
                  {tts.availableVoices.length === 0 && (
                    <option>Loading voices...</option>
                  )}
                  {tts.availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  {tts.availableVoices.length} voice
                  {tts.availableVoices.length !== 1 ? "s" : ""} available
                </p>
              </div>

              {/* Playback Speed */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Playback Speed
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={tts.playbackRate}
                    onChange={(e) =>
                      tts.setPlaybackRate(parseFloat(e.target.value))
                    }
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="text-white font-mono text-sm w-12 text-right">
                    {tts.playbackRate.toFixed(1)}x
                  </span>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => tts.setPlaybackRate(rate)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        tts.playbackRate === rate
                          ? "bg-purple-600/20 text-purple-400 border border-purple-500/50"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Start TTS Button */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Text to Speech
                </h3>
                <button
                  onClick={onTTS}
                  disabled={!tts.selectedVoice}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-400 rounded-lg transition-colors border border-blue-500/30"
                >
                  <Volume2 className="w-5 h-5" />
                  <span className="font-semibold">Start Text to Speech</span>
                </button>
                <p className="mt-3 text-xs text-slate-400">
                  Click to start reading the current chapter aloud using your
                  browser's text-to-speech engine.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReaderSettingsSidebar;
