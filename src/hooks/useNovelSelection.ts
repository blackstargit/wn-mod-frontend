import { useState, useCallback } from "react";

/**
 * Hook for managing novel selection state
 */
export function useNovelSelection() {
  const [selectedNovels, setSelectedNovels] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = useCallback((book_id: string) => {
    setSelectedNovels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(book_id)) {
        newSet.delete(book_id);
      } else {
        newSet.add(book_id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((book_ids: string[]) => {
    setSelectedNovels(new Set(book_ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedNovels(new Set());
  }, []);

  const toggleSelectAll = useCallback(
    (book_ids: string[]) => {
      if (selectedNovels.size === book_ids.length) {
        deselectAll();
      } else {
        selectAll(book_ids);
      }
    },
    [selectedNovels.size, selectAll, deselectAll],
  );

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    deselectAll();
  }, [deselectAll]);

  return {
    selectedNovels,
    isSelectionMode,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    enterSelectionMode,
    exitSelectionMode,
  };
}
