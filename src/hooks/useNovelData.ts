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

        const totalChapters = chaptersResponse.data.length;
        let initialIndex = 0;

        // Prefer URL param (e.g. /read/:book_id/5)
        const chapterParam = window.location.pathname.split("/").pop();
        if (chapterParam && !isNaN(parseInt(chapterParam))) {
          initialIndex = parseInt(chapterParam) - 1;
        } else if (novelResponse.data.last_read_chapter > 0) {
          initialIndex = novelResponse.data.last_read_chapter - 1;
        }

        // Clamp to valid range
        initialIndex = Math.max(0, Math.min(initialIndex, totalChapters - 1));
        setCurrentChapterIndex(initialIndex);
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
