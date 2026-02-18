import React from "react";
import { useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useReaderSettings } from "@/contexts/ReaderSettingsContext";
import { useTTS } from "@/contexts/TTSContext";
import {
  useChapterSync,
  useChapterNavigation,
  useNovelData,
  useTTSAutoScroll,
} from "@/hooks";
import ReaderSettingsSidebar from "@/components/ReaderSettingsSidebar";
import TTSPlayer from "@/components/TTSPlayer";
import {
  ReaderTopBar,
  ReaderNavigation,
  ChapterHeader,
  ChapterContent,
} from "@/components/Reader";

const ReaderPage: React.FC = () => {
  const { book_id } = useParams<{ book_id: string }>();

  // Data fetching
  const {
    novel,
    chapters,
    currentChapterIndex,
    setCurrentChapterIndex,
    loading,
  } = useNovelData(book_id);

  // Settings & TTS
  const { isFullscreen, sidebarOpen, isDetached, setSidebarOpen } =
    useReaderSettings();
  const tts = useTTS();

  // Auto-scroll to active TTS paragraph
  useTTSAutoScroll();

  // URL ↔ state sync + read progress tracking
  useChapterSync({
    currentChapterIndex,
    setCurrentChapterIndex,
    chapters,
    bookId: book_id || "",
  });

  // Prev / Next / TTS handlers
  const { handlePrevious, handleNext, handleTTS, hasPrevious, hasNext } =
    useChapterNavigation({
      currentChapterIndex,
      setCurrentChapterIndex,
      totalChapters: chapters.length,
      currentChapter: chapters[currentChapterIndex] || null,
    });

  const currentChapter = chapters[currentChapterIndex];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
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

      {/* Sidebar open button (shown when sidebar is closed) */}
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
        <ReaderSettingsSidebar
          onTTS={handleTTS}
          onPrev={handlePrevious}
          onNext={handleNext}
          hasPrev={hasPrevious}
          hasNext={hasNext}
          bookId={book_id || ""}
        />

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
            />

            <ChapterHeader
              title={currentChapter.title}
              currentIndex={currentChapterIndex + 1}
              totalChapters={chapters.length}
              novelTitle={novel?.title}
            />

            <ChapterContent
              content={currentChapter.content}
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

      <TTSPlayer />
    </div>
  );
};

export default ReaderPage;
