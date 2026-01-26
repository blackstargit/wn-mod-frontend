import { useState, useCallback } from "react";
import { libraryApi, novelApi, categoriesApi, tagsApi } from "../api/client";
import type { Novel, Category, Tag } from "../types";

/**
 * Hook for managing library data (novels, categories, and tags)
 */
export function useLibraryData() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [novelsRes, categoriesRes, tagsRes] = await Promise.all([
        libraryApi.getNovels(),
        categoriesApi.getCategories(),
        tagsApi.getTags(),
      ]);
      setNovels(novelsRes.data);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
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
    tags,
    loading,
    error,
    loadData,
    deleteNovel,
    bulkDeleteNovels,
  };
}
