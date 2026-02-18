import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useReaderSettings } from "@/contexts/ReaderSettingsContext";
import { useTTS } from "@/contexts/TTSContext";
import {
  useChapterNavigation,
  useNovelData,
  useTTSAutoScroll,
  useReadingSession,
  useReadingProgress,
} from "@/hooks";
import ReaderSettingsSidebar from "@/components/ReaderSettingsSidebar";
import TTSPlayer from "@/components/TTSPlayer";
import {
  ReaderNavigation,
  ChapterHeader,
  ChapterContent,
} from "@/components/Reader";
import ScrollableReader from "@/components/Reader/ScrollableReader";

const ReaderPage: React.FC = () => {
  const { book_id } = useParams<{ book_id: string }>();

  // 1. Session Management
  const { sessionId, loadingSession } = useReadingSession(book_id || "");

  // 2. Data Fetching
  const { novel, chapters, loading: loadingNovel } = useNovelData(book_id);

  // 3. Progress Tracking
  const {
    currentChapterIndex,
    initialParagraphIndex,
    setCurrentChapterIndex,
    saveProgress,
    resetParagraphIndex,
    progressLoading,
  } = useReadingProgress(book_id || "", sessionId);

  // Settings & TTS
  const { isFullscreen, sidebarOpen, isDetached, setSidebarOpen, viewMode } =
    useReaderSettings();
  const tts = useTTS();
  const loading = loadingSession || loadingNovel || progressLoading;

  // Auto-scroll to active TTS paragraph
  useTTSAutoScroll();

  // Track progress in Paged Mode (Local Effect)
  usePagedProgressTracking(
    viewMode,
    currentChapterIndex,
    saveProgress,
    sessionId,
  );

  // Prev / Next / TTS handlers
  const { handlePrevious, handleNext, handleTTS, hasPrevious, hasNext } =
    useChapterNavigation({
      currentChapterIndex,
      setCurrentChapterIndex,
      totalChapters: chapters.length,
      currentChapter: chapters[currentChapterIndex] || null,
    });

  // Wrappers to reset paragraph index on manual navigation
  const onPreviousChapter = () => {
    resetParagraphIndex();
    handlePrevious();
  };

  const onNextChapter = () => {
    resetParagraphIndex();
    handleNext();
  };

  const currentChapter = chapters[currentChapterIndex];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4" />
        <p className="text-slate-400 animate-pulse">
          {loadingSession
            ? "Initializing Session..."
            : loadingNovel
              ? "Loading Novel..."
              : "Restoring Progress..."}
        </p>
      </div>
    );
  }

  if (!currentChapter) {
    // ... existing error UI ...
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">
          No chapters available. Please scrape the novel first.
        </p>
      </div>
    );
  }

  // Smart TTS Handler: Starts from visible paragraph
  const handleSmartTTS = () => {
    // 1. Try to find the visible paragraph in the viewport
    const checkY = window.innerHeight * 0.3; // Check at 30% down the screen
    const element = document.elementFromPoint(window.innerWidth / 2, checkY);
    let startIndex = 0;

    if (element) {
      const paragraph = element.closest("[data-paragraph-index]");
      if (paragraph) {
        startIndex = parseInt(
          paragraph.getAttribute("data-paragraph-index") || "0",
        );
      } else {
        // Fallback: Check if we are inside a chapter container
        // If so, maybe find the first paragraph that is visible?
        // simple fallback is 0 if not found.
      }
    }

    // 2. Call TTS with detected index
    handleTTS(startIndex);
  };

  return (
    <div className="relative min-h-screen">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=PT+Serif:wght@400;700&family=Crimson+Text:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Raleway:wght@400;600;700&family=Ubuntu:wght@400;500;700&family=Nunito:wght@400;600;700&family=Quicksand:wght@400;500;700&family=Josefin+Sans:wght@400;600;700&family=Bitter:wght@400;700&family=Libre+Baskerville:wght@400;700&family=EB+Garamond:wght@400;700&family=Noto+Serif:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Sidebar open button */}
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
          onTTS={handleSmartTTS}
          onPrev={onPreviousChapter}
          onNext={onNextChapter}
          hasPrev={hasPrevious}
          hasNext={hasNext}
          bookId={book_id || ""}
          onChapterSelect={setCurrentChapterIndex}
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
            <ReaderNavigation
              bookId={book_id || ""}
              onPrevious={onPreviousChapter}
              onNext={onNextChapter}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
            />

            {viewMode === "scroll" ? (
              <ScrollableReader
                chapters={chapters}
                currentChapterIndex={currentChapterIndex}
                setCurrentChapterIndex={setCurrentChapterIndex}
                onPrevious={onPreviousChapter}
                onNext={onNextChapter}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                saveProgress={saveProgress}
                initialParagraphIndex={initialParagraphIndex}
              />
            ) : (
              <>
                <ChapterHeader
                  title={currentChapter.title}
                  currentIndex={currentChapterIndex + 1}
                  totalChapters={chapters.length}
                  novelTitle={novel?.title}
                />

                <ChapterContent
                  content={currentChapter.content}
                  ttsPlaying={tts.isPlaying}
                  ttsCurrentParagraph={
                    tts.currentChapterIndex === currentChapterIndex
                      ? tts.currentParagraphIndex
                      : -1
                  }
                  onPrevious={onPreviousChapter}
                  onNext={onNextChapter}
                  hasPrevious={hasPrevious}
                  hasNext={hasNext}
                  chapterIndex={currentChapterIndex}
                  viewMode="paged"
                  initialParagraphIndex={initialParagraphIndex}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <TTSPlayer />
    </div>
  );
};

// Hook/Effect to track paged mode progress
// We place it inside ReaderPage but scoped to viewMode="paged"
function usePagedProgressTracking(
  viewMode: string,
  currentChapterIndex: number,
  saveProgress: (p: any) => void,
  sessionId: string | null,
) {
  useEffect(() => {
    if (viewMode !== "paged" || !sessionId) return;

    const handleScroll = () => {
      // Find visible paragraph
      const checkY = window.innerHeight * 0.3;
      const element = document.elementFromPoint(window.innerWidth / 2, checkY);

      if (element) {
        const paragraph = element.closest("[data-paragraph-index]");
        if (paragraph) {
          const pIndex = parseInt(
            paragraph.getAttribute("data-paragraph-index") || "0",
          );
          saveProgress({
            chapterIndex: currentChapterIndex,
            paragraphIndex: pIndex,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewMode, currentChapterIndex, saveProgress, sessionId]);
}

export default ReaderPage;
