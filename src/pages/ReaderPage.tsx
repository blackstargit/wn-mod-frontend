import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { novelApi } from "@/api/client";
import type { Chapter, Novel } from "@/types";
import { ChevronRight } from "lucide-react";
import { useReaderSettings } from "@/contexts/ReaderSettingsContext";
import { useTTS } from "@/contexts/TTSContext";
import { useChapterSync, useChapterNavigation } from "@/hooks";
import ReaderSettingsSidebar from "@/components/ReaderSettingsSidebar";
import TTSPlayer from "@/components/TTSPlayer";
import {
  ReaderTopBar,
  ReaderNavigation,
  ChapterHeader,
  ChapterContent,
} from "@/components/Reader";

const ReaderPage: React.FC = () => {
  const { book_id } = useParams<{
    book_id: string;
  }>();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get settings from context
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

  const tts = useTTS();

  // Auto-scroll to current TTS paragraph
  useEffect(() => {
    if (tts.isPlaying && tts.currentParagraphIndex >= 0) {
      const paragraphElement = document.querySelector(
        `[data-paragraph-index="${tts.currentParagraphIndex}"]`,
      );
      if (paragraphElement) {
        paragraphElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [tts.currentParagraphIndex, tts.isPlaying]);

  // Use custom hooks for chapter sync and navigation
  useChapterSync({
    currentChapterIndex,
    setCurrentChapterIndex,
    chapters,
    bookId: book_id || "",
  });

  const { handlePrevious, handleNext, handleTTS, hasPrevious, hasNext } =
    useChapterNavigation({
      currentChapterIndex,
      setCurrentChapterIndex,
      totalChapters: chapters.length,
      currentChapter: chapters[currentChapterIndex] || null,
    });

  useEffect(() => {
    if (book_id) {
      loadNovelAndChapters();
    }
  }, [book_id]);

  const loadNovelAndChapters = async () => {
    try {
      setLoading(true);

      const novelResponse = await novelApi.getNovel(book_id!);
      setNovel(novelResponse.data);

      const chaptersResponse = await novelApi.getChapters(book_id!);
      setChapters(chaptersResponse.data);

      let initialChapterIndex = 0;

      // Get chapter from URL params
      const chapterParam = window.location.pathname.split("/").pop();

      if (chapterParam && !isNaN(parseInt(chapterParam))) {
        initialChapterIndex = parseInt(chapterParam) - 1;
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

  const currentChapter = chapters[currentChapterIndex];

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
    <div className="relative min-h-screen">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=PT+Serif:wght@400;700&family=Crimson+Text:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Raleway:wght@400;600;700&family=Ubuntu:wght@400;500;700&family=Nunito:wght@400;600;700&family=Quicksand:wght@400;500;700&family=Josefin+Sans:wght@400;600;700&family=Bitter:wght@400;700&family=Libre+Baskerville:wght@400;700&family=EB+Garamond:wght@400;700&family=Noto+Serif:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Fixed Chevron Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ position: "fixed", left: "1rem", top: "5rem", zIndex: 9999 }}
          className="p-2 bg-slate-800/95 hover:bg-slate-700/95 rounded-lg transition-colors border border-slate-700/50 backdrop-blur-md shadow-xl"
        >
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      )}

      <div className="flex">
        {/* Reader Settings Sidebar Component */}
        <ReaderSettingsSidebar
          onTTS={handleTTS}
          onPrev={handlePrevious}
          onNext={handleNext}
          hasPrev={hasPrevious}
          hasNext={hasNext}
          bookId={book_id || ""}
        />

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
            <ReaderTopBar bookId={book_id || ""} />

            <ReaderNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              // sidebarOpen={sidebarOpen}
            />

            <ChapterHeader
              title={currentChapter.title}
              currentIndex={currentChapterIndex + 1}
              totalChapters={chapters.length}
              novelTitle={novel?.title}
            />

            <ChapterContent
              content={currentChapter.content}
              fontFamily={selectedFont.family}
              fontSize={fontSize}
              textColor={textColor}
              backgroundColor={contentBgColor}
              ttsPlaying={tts.isPlaying}
              ttsCurrentParagraph={tts.currentParagraphIndex}
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
            />
          </div>
        </div>
      </div>

      {/* TTS Player Popup */}
      <TTSPlayer />
    </div>
  );
};

export default ReaderPage;
