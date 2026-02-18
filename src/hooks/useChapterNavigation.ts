import { useTTS } from "@/contexts/TTSContext";
import type { Chapter } from "@/types";

interface UseChapterNavigationProps {
  currentChapterIndex: number;
  setCurrentChapterIndex: (index: number) => void;
  totalChapters: number;
  currentChapter: Chapter | null;
}

/**
 * Hook for handling chapter navigation (previous, next, TTS)
 */
export function useChapterNavigation({
  currentChapterIndex,
  setCurrentChapterIndex,
  totalChapters,
  currentChapter,
}: UseChapterNavigationProps) {
  const tts = useTTS();

  const handlePrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < totalChapters - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleTTS = () => {
    if (currentChapter) {
      // Parse chapter content into paragraphs
      const paragraphs = currentChapter.content
        .split("\n\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      // Start TTS from the beginning
      tts.speak(paragraphs, 0, currentChapterIndex);
    }
  };

  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < totalChapters - 1;

  return {
    handlePrevious,
    handleNext,
    handleTTS,
    hasPrevious,
    hasNext,
  };
}
