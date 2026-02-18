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
}) => {
  const { selectedFont, fontSize, textColor, contentBgColor } =
    useReaderSettings();

  const paragraphs = content
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div
      className="rounded-2xl p-8 shadow-xl border border-slate-700/50"
      style={{ background: contentBgColor }}
    >
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
          {paragraphs.map((paragraph, idx) => (
            <p
              key={idx}
              data-paragraph-index={idx}
              className={`mb-4 transition-all duration-300 rounded-lg ${
                ttsPlaying && ttsCurrentParagraph === idx
                  ? "bg-purple-600/20 px-4 py-2 border-l-4 border-purple-500"
                  : ""
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex gap-4 justify-between items-center border-t border-slate-700 pt-6">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
        >
          ← Previous
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ChapterContent;
