import { useState, useCallback } from "react";
import { libraryApi, novelApi, categoriesApi } from "../api/client";
import type { Novel, Category } from "../types";

/**
 * Hook for managing library data (novels and categories)
 */
export function useLibraryData() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [novelsRes, categoriesRes] = await Promise.all([
        libraryApi.getNovels(),
        categoriesApi.getCategories(),
      ]);
      setNovels(novelsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Failed to load library data:", err);
      setError("Failed to load library data");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNovel = useCallback(
    async (book_id: string) => {
      try {
        await novelApi.deleteNovel(book_id);
        await loadData();
      } catch (err) {
        console.error("Failed to delete novel:", err);
        throw err;
      }
    },
    [loadData],
  );

  const bulkDeleteNovels = useCallback(
    async (book_ids: string[]) => {
      try {
        await novelApi.bulkDeleteNovels(book_ids);
        await loadData();
      } catch (err) {
        console.error("Failed to delete novels:", err);
        throw err;
      }
    },
    [loadData],
  );

  return {
    novels,
    categories,
    loading,
    error,
    loadData,
    deleteNovel,
    bulkDeleteNovels,
  };
}
