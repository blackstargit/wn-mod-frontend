import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { novelApi } from "@/api/client";
import type { Chapter, Novel } from "@/types";
import { Settings, ChevronRight, BookOpen } from "lucide-react";
import { useReaderSettings } from "@/contexts/ReaderSettingsContext";
import ReaderSettingsSidebar from "@/components/ReaderSettingsSidebar";

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

  // Get settings from context (only what we need for rendering)
  const {
    selectedFont,
    fontSize,
    textColor,
    contentBgColor,
    isFullscreen,
    sidebarOpen,
    isDetached,
    setSidebarOpen,
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
        {/* Reader Settings Sidebar Component */}
        <ReaderSettingsSidebar />

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
