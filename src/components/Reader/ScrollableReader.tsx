import React, { useEffect, useRef } from "react";
import { useScrollReading } from "@/hooks/useScrollReading";
import type { Chapter } from "@/types";
import { ChapterContent } from "@/components/Reader";
import { useTTS } from "@/contexts/TTSContext";

interface ScrollableReaderProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  setCurrentChapterIndex: (index: number) => void;
  onPrevious: () => void; // Used for non-scroll actions if any
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  saveProgress: (progress: {
    chapterIndex: number;
    paragraphIndex: number;
    offset?: number;
  }) => void;
  initialParagraphIndex?: number;
}

const ScrollableReader: React.FC<ScrollableReaderProps> = ({
  chapters,
  currentChapterIndex,
  setCurrentChapterIndex,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  saveProgress,
  initialParagraphIndex,
}) => {
  const { visibleIndices, containerRef, loadMoreIndices } = useScrollReading({
    chapters,
    currentChapterIndex,
    setCurrentChapterIndex,
    initialParagraphIndex,
  });

  // Track progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Find the most visible paragraph
      // Simple heuristic: Element at viewport center + offset
      const checkY = window.innerHeight * 0.3; // Check at 30% down the screen (reading line)
      const element = document.elementFromPoint(window.innerWidth / 2, checkY);

      if (element) {
        // Must be a paragraph or inside one
        const paragraph = element.closest("[data-paragraph-index]");
        if (paragraph) {
          const pIndex = parseInt(
            paragraph.getAttribute("data-paragraph-index") || "0",
          );
          // Find parent chapter container to get chapter index (more reliable in scroll mode)
          const chapterContainer = paragraph.closest("[data-chapter-index]");
          const cIndex = chapterContainer
            ? parseInt(
                chapterContainer.getAttribute("data-chapter-index") || "0",
              )
            : currentChapterIndex;

          saveProgress({
            chapterIndex: cIndex,
            paragraphIndex: pIndex,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentChapterIndex, saveProgress]);

  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const tts = useTTS();

  // Observer for infinite scrolling sentinels
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === topSentinelRef.current) {
              loadMoreIndices("up");
            } else if (entry.target === bottomSentinelRef.current) {
              loadMoreIndices("down");
            }
          }
        });
      },
      { rootMargin: "200px" },
    );

    if (topSentinelRef.current) observer.observe(topSentinelRef.current);
    if (bottomSentinelRef.current) observer.observe(bottomSentinelRef.current);

    return () => observer.disconnect();
  }, [loadMoreIndices]);

  return (
    <div ref={containerRef} className="space-y-8 relative">
      {/* Top Sentinel */}
      <div ref={topSentinelRef} className="h-4 w-full absolute -top-20" />

      {visibleIndices.map((index) => {
        const chapter = chapters[index];
        if (!chapter) return null;

        return (
          <div
            key={chapter.id || index}
            data-chapter-index={index}
            className="scroll-mt-20"
            id={`chapter-container-${index}`}
          >
            {/* Minimal Header for Scroll Mode? Or full header? */}
            <div className="text-center mb-4 text-slate-400">
              <h2 className="text-xl font-bold text-slate-200">
                {chapter.title}
              </h2>
              <span className="text-sm">
                Chapter {index + 1} of {chapters.length}
              </span>
            </div>

            <ChapterContent
              content={chapter.content}
              ttsPlaying={tts.isPlaying}
              ttsCurrentParagraph={
                tts.currentChapterIndex === index
                  ? tts.currentParagraphIndex
                  : -1
              }
              onPrevious={onPrevious} // Hidden in scroll mode
              onNext={onNext} // Hidden in scroll mode
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              viewMode="scroll"
              chapterIndex={index}
            />
          </div>
        );
      })}

      {/* Bottom Sentinel */}
      <div ref={bottomSentinelRef} className="h-4 w-full absolute -bottom-20" />
    </div>
  );
};

export default ScrollableReader;
