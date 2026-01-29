import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react";

// Google Fonts library
const FONT_LIBRARY = [
  { name: "Inter", family: "Inter, sans-serif" },
  { name: "Roboto", family: "Roboto, sans-serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif" },
  { name: "Lato", family: "Lato, sans-serif" },
  { name: "Montserrat", family: "Montserrat, sans-serif" },
  { name: "Poppins", family: "Poppins, sans-serif" },
  { name: "Merriweather", family: "Merriweather, serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Lora", family: "Lora, serif" },
  { name: "PT Serif", family: "'PT Serif', serif" },
  { name: "Crimson Text", family: "'Crimson Text', serif" },
  { name: "Source Sans Pro", family: "'Source Sans Pro', sans-serif" },
  { name: "Raleway", family: "Raleway, sans-serif" },
  { name: "Ubuntu", family: "Ubuntu, sans-serif" },
  { name: "Nunito", family: "Nunito, sans-serif" },
  { name: "Quicksand", family: "Quicksand, sans-serif" },
  { name: "Josefin Sans", family: "'Josefin Sans', sans-serif" },
  { name: "Bitter", family: "Bitter, serif" },
  { name: "Libre Baskerville", family: "'Libre Baskerville', serif" },
  { name: "EB Garamond", family: "'EB Garamond', serif" },
  { name: "Noto Serif", family: "'Noto Serif', serif" },
  { name: "Georgia", family: "Georgia, serif" },
  { name: "Times New Roman", family: "'Times New Roman', serif" },
  { name: "Arial", family: "Arial, sans-serif" },
];

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

  // Reader settings
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(FONT_LIBRARY[0]);
  const [favoriteFonts, setFavoriteFonts] = useState<string[]>([]);
  const [fontSearch, setFontSearch] = useState("");
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDetached, setIsDetached] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Color settings
  const [textColor, setTextColor] = useState("#e2e8f0");
  const [contentBgColor, setContentBgColor] = useState("#1e293b");
  const [favoriteColors, setFavoriteColors] = useState<{
    text: string[];
    bg: string[];
  }>({
    text: [],
    bg: [],
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedFont = localStorage.getItem("reader-font");
    const savedFavorites = localStorage.getItem("reader-favorite-fonts");
    const savedTextColor = localStorage.getItem("reader-text-color");
    const savedContentBg = localStorage.getItem("reader-content-bg");
    const savedFullscreen = localStorage.getItem("reader-fullscreen");
    const savedSidebarWidth = localStorage.getItem("reader-sidebar-width");
    const savedDetached = localStorage.getItem("reader-sidebar-detached");
    const savedFavoriteColors = localStorage.getItem("reader-favorite-colors");

    if (savedFont) {
      const font = FONT_LIBRARY.find((f) => f.name === savedFont);
      if (font) setSelectedFont(font);
    }

    if (savedFavorites) {
      setFavoriteFonts(JSON.parse(savedFavorites));
    }

    if (savedTextColor) setTextColor(savedTextColor);
    if (savedContentBg) setContentBgColor(savedContentBg);
    if (savedFullscreen) setIsFullscreen(savedFullscreen === "true");
    if (savedSidebarWidth) setSidebarWidth(parseInt(savedSidebarWidth));
    if (savedDetached) setIsDetached(savedDetached === "true");
    if (savedFavoriteColors) setFavoriteColors(JSON.parse(savedFavoriteColors));
  }, []);

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

  const handleFontChange = (font: (typeof FONT_LIBRARY)[0]) => {
    setSelectedFont(font);
    localStorage.setItem("reader-font", font.name);
  };

  const toggleFavorite = (fontName: string) => {
    const newFavorites = favoriteFonts.includes(fontName)
      ? favoriteFonts.filter((f) => f !== fontName)
      : [...favoriteFonts, fontName];

    setFavoriteFonts(newFavorites);
    localStorage.setItem("reader-favorite-fonts", JSON.stringify(newFavorites));
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    localStorage.setItem("reader-text-color", color);
  };

  const handleContentBgChange = (color: string) => {
    setContentBgColor(color);
    localStorage.setItem("reader-content-bg", color);
  };

  const toggleFullscreen = () => {
    const newValue = !isFullscreen;
    setIsFullscreen(newValue);
    localStorage.setItem("reader-fullscreen", newValue.toString());
  };

  const toggleDetached = () => {
    const newValue = !isDetached;
    setIsDetached(newValue);
    localStorage.setItem("reader-sidebar-detached", newValue.toString());
  };

  const toggleFavoriteColor = (color: string, type: "text" | "bg") => {
    const newFavorites = { ...favoriteColors };
    if (newFavorites[type].includes(color)) {
      newFavorites[type] = newFavorites[type].filter((c) => c !== color);
    } else {
      newFavorites[type] = [...newFavorites[type], color];
    }
    setFavoriteColors(newFavorites);
    localStorage.setItem(
      "reader-favorite-colors",
      JSON.stringify(newFavorites),
    );
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 280 && newWidth <= 600) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem("reader-sidebar-width", sidebarWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

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
          className="fixed left-4 top-25 z-50 p-2 bg-slate-800/95 hover:bg-slate-700/95 rounded-lg transition-colors border border-slate-700/50 backdrop-blur-md"
        >
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <div
          className={`${isDetached ? "fixed" : "fixed"} left-0 top-0 h-full bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50 transition-all duration-300 z-50 ${
            sidebarOpen ? "" : "translate-x-[-100%]"
          } overflow-hidden`}
          style={{ width: sidebarOpen ? `${sidebarWidth}px` : "0px" }}
        >
          <div className="p-6 h-full flex flex-col relative">
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
                                    handleFontChange(font);
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
                                  handleFontChange(font);
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

              {/* Color Settings */}
              <div className="space-y-6">
                {/* Text Color */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    Text Color
                  </h3>

                  {/* Favorite Colors */}
                  {favoriteColors.text.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {favoriteColors.text.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleTextColorChange(color)}
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
                      onChange={(e) => handleTextColorChange(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700/50"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => handleTextColorChange(e.target.value)}
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

                  {/* Favorite Colors */}
                  {favoriteColors.bg.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {favoriteColors.bg.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleContentBgChange(color)}
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
                      onChange={(e) => handleContentBgChange(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700/50"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={contentBgColor}
                        onChange={(e) => handleContentBgChange(e.target.value)}
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

                {/* Fullscreen Mode */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    Fullscreen Mode
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

            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-purple-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen && !isDetached ? `ml-[${sidebarWidth}px]` : "ml-0"
          }`}
          style={{
            marginLeft:
              sidebarOpen && !isDetached ? `${sidebarWidth}px` : "0px",
          }}
        >
          <div
            className={`mx-auto transition-all duration-300 ${
              isFullscreen ? "max-w-full p-2" : "max-w-4xl p-2"
            }`}
          >
            {/* Top Bar */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                ← Back to Library
              </button>

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
                  className="leading-relaxed text-lg"
                  style={{ fontFamily: selectedFont.family, color: textColor }}
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
