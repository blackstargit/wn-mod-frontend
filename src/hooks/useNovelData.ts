import { useState, useEffect } from "react";
import { novelApi } from "@/api/client";
import type { Chapter, Novel } from "@/types";

/**
 * Hook for loading novel and chapter data.
 * Handles initial chapter selection from URL param or last_read_chapter.
 */
export function useNovelData(bookId: string | undefined) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;

    const load = async () => {
      try {
        setLoading(true);

        const [novelResponse, chaptersResponse] = await Promise.all([
          novelApi.getNovel(bookId),
          novelApi.getChapters(bookId),
        ]);

        setNovel(novelResponse.data);
        setChapters(chaptersResponse.data);

        // Note: URL parsing for chapter index is removed.
        // Restoration is handled by ReaderPage via session_id.
        // We defaults to 0 (Chapter 1) here.
        if (novelResponse.data.last_read_chapter > 0) {
          // Ignored as we track via UUID/LocalStorage pointer now.
        }

        setCurrentChapterIndex(0);
      } catch (error) {
        console.error("Failed to load novel data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookId]);

  return {
    novel,
    chapters,
    currentChapterIndex,
    setCurrentChapterIndex,
    loading,
  };
}
