import { useState, useEffect, useRef, useCallback } from "react";
import type { Chapter } from "@/types";

interface UseScrollReadingProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  setCurrentChapterIndex: (index: number) => void;
}

export function useScrollReading({
  chapters,
  currentChapterIndex,
  setCurrentChapterIndex,
  initialParagraphIndex,
}: UseScrollReadingProps & { initialParagraphIndex?: number }) {
  // We keep a window of chapters rendered around the current one
  // Initial state logic matches the current chapter
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize visible chapters on mount or when switching to scroll mode
  useEffect(() => {
    if (visibleIndices.length === 0 && chapters.length > 0) {
      const start = Math.max(0, currentChapterIndex - 1);
      const end = Math.min(chapters.length - 1, currentChapterIndex + 1);
      const indices = [];
      for (let i = start; i <= end; i++) {
        indices.push(i);
      }
      setVisibleIndices(indices);
    }
  }, [currentChapterIndex, chapters.length, visibleIndices.length]);

  // Scroll to initial chapter on mount
  useEffect(() => {
    if (!hasInitialized && visibleIndices.length > 0 && containerRef.current) {
      // 1. Try to scroll to specific paragraph if provided (restoration)
      if (initialParagraphIndex !== undefined) {
        const paraEl = containerRef.current.querySelector(
          `#chapter-${currentChapterIndex}-para-${initialParagraphIndex}`,
        );
        if (paraEl) {
          paraEl.scrollIntoView({ behavior: "auto", block: "center" });
          setHasInitialized(true);
          return;
        }
      }

      // 2. Fallback to top of chapter
      const element = containerRef.current.querySelector(
        `[data-chapter-index="${currentChapterIndex}"]`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "auto" });
        setHasInitialized(true);
      }
    }
  }, [
    visibleIndices,
    currentChapterIndex,
    hasInitialized,
    initialParagraphIndex,
  ]);

  // Load more chapters when reaching boundaries
  // This helps maintain the "infinite" feel
  const loadMoreIndices = useCallback(
    (direction: "up" | "down") => {
      setVisibleIndices((prev) => {
        if (prev.length === 0) return prev;
        const first = prev[0];
        const last = prev[prev.length - 1];

        if (direction === "down") {
          if (last < chapters.length - 1) {
            // Append next chapter
            return [...prev, last + 1];
          }
        } else if (direction === "up") {
          if (first > 0) {
            // Prepend previous chapter
            return [first - 1, ...prev];
          }
        }
        return prev;
      });
    },
    [chapters.length],
  );

  // Set up intersection observer to track active chapter
  useEffect(() => {
    if (!containerRef.current) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(
            entry.target.getAttribute("data-chapter-index") || "-1",
          );

          if (index !== -1) {
            // Logic to determine "dominant" chapter
            // For now, if a chapter crosses a significant threshold (e.g. 50% visible), we set it active.
            // Or simply, if it triggers intersection with a high threshold.
            // We'll use a threshold of 0.2 to detect entering, but we want to stick to the one taking up screen.
            // We can check intersectionRatio.
            if (entry.intersectionRatio > 0.3) {
              // Debounce or just set?
              // If we scroll fast, this might trigger many updates.
              // But React state updates are batched/fast enough.
              // We check against current to avoid redundant updates
              if (index !== currentChapterIndex) {
                // setCurrentChapterIndex is stable?
                // We use a ref to track current preventing stale closures if needed
                setCurrentChapterIndex(index);
              }
            }
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, {
      root: null, // viewport
      rootMargin: "-20% 0px -20% 0px", // Active area in middle 60% of screen
      threshold: [0.3, 0.5, 0.7],
    });

    // Observe all chapter elements
    const chapterElements = containerRef.current.querySelectorAll(
      "[data-chapter-index]",
    );
    chapterElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleIndices, currentChapterIndex, setCurrentChapterIndex]);

  return {
    visibleIndices,
    containerRef,
    loadMoreIndices,
  };
}
