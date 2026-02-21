import { useTTS } from "@/contexts/TTSContext";
import type { Chapter } from "@/types";

interface UseChapterNavigationProps {
  currentChapterIndex: number;
  setCurrentChapterIndex: (index: number) => void;
  chapters: Chapter[];
}

/**
 * Hook for handling chapter navigation (previous, next, TTS)
 */
export function useChapterNavigation({
  currentChapterIndex,
  setCurrentChapterIndex,
  chapters = [],
}: UseChapterNavigationProps) {
  const tts = useTTS();

  const handlePrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < chapters?.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleTTS = (
    startParagraphIndex: number = 0,
    startChapterIndex: number = currentChapterIndex,
    onComplete?: () => void,
  ) => {
    const chapter = chapters[startChapterIndex];
    if (chapter) {
      // Parse chapter content into paragraphs robustly
      const paragraphs = chapter.content
        .split(/\r?\n\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      // Start TTS from the specified index
      tts.speak(paragraphs, startParagraphIndex, startChapterIndex, onComplete);
    }
  };

  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters?.length - 1;

  return {
    handlePrevious,
    handleNext,
    handleTTS,
    hasPrevious,
    hasNext,
  };
}
