import React, { useState } from "react";
import { Search, Star, StarOff } from "lucide-react";
import { FONT_LIBRARY } from "@/contexts/ReaderSettingsContext";

type FontOption = (typeof FONT_LIBRARY)[0];

interface FontSelectorProps {
  selectedFont: FontOption;
  favoriteFonts: string[];
  filteredFonts: FontOption[];
  favoriteFontsList: FontOption[];
  onSelectFont: (font: FontOption) => void;
  onToggleFavorite: (fontName: string) => void;
  fontSearch: string;
  onFontSearchChange: (value: string) => void;
}

/**
 * Font selector with search, favorites, and dropdown list
 */
const FontSelector: React.FC<FontSelectorProps> = ({
  selectedFont,
  favoriteFonts,
  filteredFonts,
  favoriteFontsList,
  onSelectFont,
  onToggleFavorite,
  fontSearch,
  onFontSearchChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Font Family</h3>

      {/* Current font preview */}
      <div className="mb-2 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
        <span
          className="text-white font-medium"
          style={{ fontFamily: selectedFont.family }}
        >
          {selectedFont.name}
        </span>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
        <input
          type="text"
          placeholder="Search fonts..."
          value={fontSearch}
          onChange={(e) => onFontSearchChange(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
        />

        {dropdownOpen && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />

            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-20">
              {/* Favorites section */}
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
                          onSelectFont(font);
                          setDropdownOpen(false);
                          onFontSearchChange("");
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
                            onToggleFavorite(font.name);
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

              {/* All fonts section */}
              <div className="p-2">
                <h4 className="text-xs font-semibold text-slate-400 mb-2 px-2">
                  All Fonts
                </h4>
                <div className="space-y-1">
                  {filteredFonts.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => {
                        onSelectFont(font);
                        setDropdownOpen(false);
                        onFontSearchChange("");
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
                          onToggleFavorite(font.name);
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
  );
};

export default FontSelector;
