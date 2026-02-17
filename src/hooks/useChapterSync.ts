import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { novelApi } from "@/api/client";

interface UseChapterSyncProps {
  currentChapterIndex: number;
  setCurrentChapterIndex: (index: number) => void;
  chapters: any[];
  bookId: string;
}

/**
 * Hook for synchronizing chapter state with URL parameters and tracking read progress
 */
export function useChapterSync({
  currentChapterIndex,
  setCurrentChapterIndex,
  chapters,
  bookId,
}: UseChapterSyncProps) {
  const { chapter } = useParams<{ chapter?: string }>();
  const navigate = useNavigate();

  // Ref to skip sync-back when the chapter change initiated from the URL
  const isUpdatingFromUrl = useRef(false);
  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state with URL chapter parameter (handles TOC clicks and back/forward navigation)
  useEffect(() => {
    if (chapter && chapters.length > 0) {
      const chapterNumber = parseInt(chapter);
      const newIndex = chapterNumber - 1;
      if (
        newIndex >= 0 &&
        newIndex < chapters.length &&
        newIndex !== currentChapterIndex
      ) {
        isUpdatingFromUrl.current = true;
        setCurrentChapterIndex(newIndex);
        window.scrollTo(0, 0);
      }
    }
  }, [chapter, chapters.length, currentChapterIndex, setCurrentChapterIndex]);

  // Sync URL with state and update progress
  useEffect(() => {
    if (bookId && chapters.length > 0) {
      const chapterNumber = currentChapterIndex + 1;
      const chapterStr = chapterNumber.toString();

      // If we just synced from a URL change, don't trigger a navigation update
      // But we still want to finish the sync cycle
      if (isUpdatingFromUrl.current) {
        if (chapter === chapterStr) {
          isUpdatingFromUrl.current = false;
        }
        updateReadProgress();
        return;
      }

      // If URL doesn't match current state (e.g. manual button click), update URL
      if (chapter !== chapterStr) {
        navigate(`/read/${bookId}/${chapterStr}`, { replace: true });
      }
      updateReadProgress();
    }
  }, [currentChapterIndex, bookId, chapters.length, navigate, chapter]);

  const updateReadProgress = () => {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }

    progressTimeoutRef.current = setTimeout(async () => {
      try {
        await novelApi.updateMetadata(bookId, {
          last_read_chapter: currentChapterIndex + 1,
          last_accessed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to update read progress:", error);
      }
    }, 1000); // 1 second debounce
  };

  return { updateReadProgress };
}
