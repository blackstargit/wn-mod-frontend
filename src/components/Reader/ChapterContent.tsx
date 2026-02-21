import React from "react";
import { useReaderSettings } from "@/contexts/ReaderSettingsContext";

interface ChapterContentProps {
  content: string;
  ttsPlaying: boolean;
  ttsCurrentParagraph: number;
  onPrevious: () => void;
  onNext: () => void;

  hasPrevious: boolean;
  hasNext: boolean;
  viewMode?: "paged" | "scroll";
  chapterIndex?: number;
  initialParagraphIndex?: number;
}

/**
 * Chapter content display with TTS highlighting and navigation.
 * Reads font/color settings directly from ReaderSettingsContext.
 */
const ChapterContent: React.FC<ChapterContentProps> = ({
  content,
  ttsPlaying,
  ttsCurrentParagraph,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  viewMode = "paged",
  chapterIndex,
  initialParagraphIndex,
}) => {
  const { selectedFont, fontSize, textColor } = useReaderSettings();

  // Parse paragraphs (simple split by newline for now)
  const paragraphs = React.useMemo(() => {
    return content
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [content]);

  // Scroll to initial paragraph on mount/change
  React.useEffect(() => {
    if (initialParagraphIndex !== undefined && initialParagraphIndex >= 0) {
      // Small timeout to ensure rendering
      setTimeout(() => {
        const el = document.querySelector(
          `[data-paragraph-index="${initialParagraphIndex}"]`,
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [initialParagraphIndex, chapterIndex]); // Re-run when chapter changes if index is provided

  return (
    <div
      className={`rounded-2xl p-8 shadow-xl border border-slate-700/50 ${
        viewMode === "paged" ? "mb-20" : ""
      }`}
      style={{
        background: useReaderSettings().contentBgColor || "#1e293b", // Fallback or context value
      }}
    >
      <div
        className="prose prose-invert max-w-none"
        style={{
          fontFamily: selectedFont.family,
          fontSize: `${fontSize}px`,
          color: textColor,
        }}
      >
        {paragraphs.map((paragraph, idx) => (
          <div key={idx} className="mb-6 leading-relaxed">
            <p
              id={
                chapterIndex !== undefined
                  ? `chapter-${chapterIndex}-para-${idx}`
                  : undefined
              }
              data-paragraph-index={idx}
              className={`transition-all duration-300 rounded-lg ${
                ttsPlaying && ttsCurrentParagraph === idx
                  ? "bg-purple-600/20 px-4 py-2 border-l-4 border-purple-500"
                  : ""
              }`}
            >
              {paragraph}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Footer for Paged Mode */}
      {viewMode === "paged" && (
        <div className="mt-16 pt-8 border-t border-slate-700/30 flex justify-between items-center no-print">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              !hasPrevious
                ? "opacity-0 cursor-default"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-lg hover:shadow-purple-500/10"
            }`}
          >
            Previous Chapter
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              !hasNext
                ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/20"
            }`}
          >
            Next Chapter
          </button>
        </div>
      )}
    </div>
  );
};

export default ChapterContent;
