import React, { useState } from "react";
import { FONT_LIBRARY } from "@/contexts/ReaderSettingsContext";

type FontOption = (typeof FONT_LIBRARY)[0];

import FontSelector from "./FontSelector";
import ColorPicker from "./ColorPicker";

interface ReadingTabProps {
  selectedFont: FontOption;
  favoriteFonts: string[];
  fontSize: number;
  textColor: string;
  contentBgColor: string;
  screenBgColor: string;
  favoriteColors: { text: string[]; bg: string[]; screen: string[] };
  onSelectFont: (font: FontOption) => void;
  onToggleFavoriteFont: (fontName: string) => void;
  onFontSizeChange: (size: number) => void;
  onTextColorChange: (color: string) => void;
  onContentBgColorChange: (color: string) => void;
  onScreenBgColorChange: (color: string) => void;
  onToggleFavoriteColor: (
    color: string,
    type: "text" | "bg" | "screen",
  ) => void;
  viewMode: "paged" | "scroll";
  onViewModeChange: (mode: "paged" | "scroll") => void;
}

/**
 * Reading tab: font, font size, and color settings
 */
const ReadingTab: React.FC<ReadingTabProps> = ({
  selectedFont,
  favoriteFonts,
  fontSize,
  textColor,
  contentBgColor,
  screenBgColor,
  favoriteColors,
  onSelectFont,
  onToggleFavoriteFont,
  onFontSizeChange,
  onTextColorChange,
  onContentBgColorChange,
  onScreenBgColorChange,
  onToggleFavoriteColor,
  viewMode,
  onViewModeChange,
}) => {
  const [fontSearch, setFontSearch] = useState("");

  const filteredFonts = FONT_LIBRARY.filter((font) =>
    font.name.toLowerCase().includes(fontSearch.toLowerCase()),
  );

  const favoriteFontsList = FONT_LIBRARY.filter((font) =>
    favoriteFonts.includes(font.name),
  );

  return (
    <div className="space-y-6">
      <FontSelector
        selectedFont={selectedFont}
        favoriteFonts={favoriteFonts}
        filteredFonts={filteredFonts}
        favoriteFontsList={favoriteFontsList}
        onSelectFont={onSelectFont}
        onToggleFavorite={onToggleFavoriteFont}
        fontSearch={fontSearch}
        onFontSearchChange={setFontSearch}
      />

      {/* View Mode */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">View Mode</h3>
        <div className="flex bg-slate-700/50 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => onViewModeChange("paged")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              viewMode === "paged"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Paged
          </button>
          <button
            onClick={() => onViewModeChange("scroll")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              viewMode === "scroll"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Scroll
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Font Size</h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="12"
            max="32"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <span className="text-white font-mono text-sm w-12 text-right">
            {fontSize}px
          </span>
        </div>
      </div>

      <ColorPicker
        label="Text Color"
        value={textColor}
        favoriteColors={favoriteColors.text}
        onChange={onTextColorChange}
        onToggleFavorite={() => onToggleFavoriteColor(textColor, "text")}
      />

      <ColorPicker
        label="Content Background"
        value={contentBgColor}
        favoriteColors={favoriteColors.bg}
        onChange={onContentBgColorChange}
        onToggleFavorite={() => onToggleFavoriteColor(contentBgColor, "bg")}
      />

      <ColorPicker
        label="Screen Background"
        value={screenBgColor}
        favoriteColors={favoriteColors.screen ?? []}
        onChange={onScreenBgColorChange}
        onToggleFavorite={() => onToggleFavoriteColor(screenBgColor, "screen")}
      />
    </div>
  );
};

export default ReadingTab;
