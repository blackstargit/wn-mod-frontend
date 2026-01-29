import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { novelApi } from "@/api/client";
import type { Chapter, Novel } from "@/types";
import {
  Settings,
  X,
  Search,
  Star,
  StarOff,
  Maximize,
  Minimize,
  ChevronRight,
  Pin,
  PinOff,
  BookOpen,
  Sun,
} from "lucide-react";
import {
  useReaderSettings,
  FONT_LIBRARY,
} from "@/contexts/ReaderSettingsContext";

const ReaderPage: React.FC = () => {
  const { book_id, chapter } = useParams<{
    book_id: string;
    chapter?: string;
  }>();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSearch, setFontSearch] = useState("");
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

  // Get settings from context
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

  useEffect(() => {
    if (book_id) {
      loadNovelAndChapters();
    }
  }, [book_id]);

  useEffect(() => {
    if (book_id && chapters.length > 0) {
      const chapterNumber = currentChapterIndex + 1;
      navigate(`/read/${book_id}/${chapterNumber}`, { replace: true });
      updateReadProgress();
    }
  }, [currentChapterIndex, book_id, chapters.length, navigate]);

  const loadNovelAndChapters = async () => {
    try {
      setLoading(true);

      const novelResponse = await novelApi.getNovel(book_id!);
      setNovel(novelResponse.data);

      const chaptersResponse = await novelApi.getChapters(book_id!);
      setChapters(chaptersResponse.data);

      let initialChapterIndex = 0;

      if (chapter) {
        initialChapterIndex = parseInt(chapter) - 1;
      } else if (novelResponse.data.last_read_chapter > 0) {
        initialChapterIndex = novelResponse.data.last_read_chapter - 1;
      }

      if (initialChapterIndex >= chaptersResponse.data.length) {
        initialChapterIndex = chaptersResponse.data.length - 1;
      }
      if (initialChapterIndex < 0) {
        initialChapterIndex = 0;
      }

      setCurrentChapterIndex(initialChapterIndex);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateReadProgress = async () => {
    try {
      await novelApi.updateMetadata(book_id!, {
        last_read_chapter: currentChapterIndex + 1,
        last_accessed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update read progress:", error);
    }
  };

  const currentChapter = chapters[currentChapterIndex];

  const handlePrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleTTS = () => {
    if (currentChapter) {
      const utterance = new SpeechSynthesisUtterance(currentChapter.content);
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredFonts = FONT_LIBRARY.filter((font) =>
    font.name.toLowerCase().includes(fontSearch.toLowerCase()),
  );

  const favoriteFontsList = FONT_LIBRARY.filter((font) =>
    favoriteFonts.includes(font.name),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">
          No chapters available. Please scrape the novel first.
        </p>
      </div>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=PT+Serif:wght@400;700&family=Crimson+Text:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Raleway:wght@400;600;700&family=Ubuntu:wght@400;500;700&family=Nunito:wght@400;600;700&family=Quicksand:wght@400;500;700&family=Josefin+Sans:wght@400;600;700&family=Bitter:wght@400;700&family=Libre+Baskerville:wght@400;700&family=EB+Garamond:wght@400;700&family=Noto+Serif:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Fixed Chevron Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-24 z-50 p-2 bg-slate-800/95 hover:bg-slate-700/95 rounded-lg transition-colors border border-slate-700/50 backdrop-blur-md"
        >
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50 transition-all duration-300 z-50 ${
            sidebarOpen ? "w-80" : "translate-x-[-100%] w-80"
          } overflow-hidden`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-6">
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2">
              {/* Font Selection */}
              <div className="mb-6">
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
              <div className="mb-6">
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

              {/* Brightness */}
              <div className="mb-6">
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

              {/* Color Settings */}
              <div className="space-y-6">
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
                        onClick={() =>
                          toggleFavoriteColor(contentBgColor, "bg")
                        }
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

                  {favoriteColors.screen.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {favoriteColors.screen.map((color) => (
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
                        {favoriteColors.screen.includes(screenBgColor) ? (
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fullscreen Mode */}
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
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen && !isDetached ? "ml-80" : "ml-0"
          }`}
        >
          <div
            className={`mx-auto transition-all duration-300 ${
              isFullscreen ? "max-w-full p-2" : "max-w-4xl p-2"
            }`}
          >
            {/* Top Bar */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  ← Back to Library
                </button>
                <button
                  onClick={() => navigate(`/book/${book_id}`)}
                  className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Book Details
                </button>
              </div>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-700/50"
              >
                <Settings className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            <div
              className="rounded-2xl p-8 shadow-xl border border-slate-700/50"
              style={{ background: contentBgColor }}
            >
              {/* Chapter Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 text-white">
                  {currentChapter.title}
                </h1>
                <div className="flex items-center gap-4 text-slate-400">
                  <p>
                    Chapter {currentChapterIndex + 1} of {chapters.length}
                  </p>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Progress Saved
                  </span>
                  {novel?.title && (
                    <p className="text-sm text-slate-500">({novel.title})</p>
                  )}
                </div>
              </div>

              {/* Chapter Content */}
              <div className="prose prose-invert max-w-none mb-8">
                <div
                  className="leading-relaxed"
                  style={{
                    fontFamily: selectedFont.family,
                    color: textColor,
                    fontSize: `${fontSize}px`,
                  }}
                >
                  {currentChapter.content
                    .split("\n\n")
                    .map((paragraph, idx) => (
                      <p key={idx} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-4 justify-between items-center border-t border-slate-700 pt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentChapterIndex === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
                >
                  ← Previous
                </button>

                <button
                  onClick={handleTTS}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg"
                >
                  🔊 TTS
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentChapterIndex === chapters.length - 1}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReaderPage;
