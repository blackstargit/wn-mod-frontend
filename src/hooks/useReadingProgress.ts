import { useState, useCallback, useEffect, useRef } from "react";

export interface ReadingProgress {
  chapterIndex: number;
  paragraphIndex: number;
}

export interface UseReadingProgressResult {
  currentChapterIndex: number;
  initialParagraphIndex: number | undefined;
  setCurrentChapterIndex: (index: number) => void;
  saveProgress: (progress: ReadingProgress) => void;
  resetParagraphIndex: () => void;
  progressLoading: boolean;
}

export function useReadingProgress(
  _bookId: string,
  sessionId: string | null,
): UseReadingProgressResult {
  // State
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [initialParagraphIndex, setInitialParagraphIndex] = useState<
    number | undefined
  >(undefined);
  const [progressLoading, setProgressLoading] = useState<boolean>(true);

  // Constants
  const progressKey = `novel_progress_${sessionId}`;
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Load Progress on Session Change
  useEffect(() => {
    if (!sessionId) {
      setProgressLoading(true);
      return;
    }

    try {
      const savedRaw = localStorage.getItem(progressKey);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        setCurrentChapterIndex(saved.chapterIndex || 0);
        setInitialParagraphIndex(saved.paragraphIndex || 0);
      } else {
        // No saved progress, default to 0
        setCurrentChapterIndex(0);
        setInitialParagraphIndex(0);
      }
    } catch (e) {
      console.error("Failed to load progress", e);
      setCurrentChapterIndex(0);
    } finally {
      setProgressLoading(false);
    }
  }, [sessionId, progressKey]);

  // 2. Save Progress (Debounced)
  const saveProgress = useCallback(
    (progress: ReadingProgress) => {
      if (!sessionId) return;

      // Update local state if chapter changed via scroll (optional, usually driven by parent)
      // But we mostly use this to persist.

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem(progressKey, JSON.stringify(progress));
      }, 500);
    },
    [sessionId, progressKey],
  );

  // 3. Reset Paragraph Index (for manual navigation)
  const resetParagraphIndex = useCallback(() => {
    setInitialParagraphIndex(undefined);
  }, []);

  return {
    currentChapterIndex,
    initialParagraphIndex,
    setCurrentChapterIndex,
    saveProgress,
    resetParagraphIndex,
    progressLoading,
  };
}
