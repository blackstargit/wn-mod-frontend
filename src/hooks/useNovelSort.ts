import { useMemo } from "react";
import type { Novel, SortOption, SortOrder } from "../types";

/**
 * Hook for sorting novels based on various criteria
 */
export function useNovelSort(
  novels: Novel[],
  sortBy: SortOption,
  sortOrder: SortOrder,
) {
  return useMemo(() => {
    const novelsCopy = [...novels];
    const multiplier = sortOrder === "asc" ? 1 : -1;

    switch (sortBy) {
      case "recently-read":
        return novelsCopy.sort((a, b) => {
          const aTime = a.last_accessed_at
            ? new Date(a.last_accessed_at).getTime()
            : 0;
          const bTime = b.last_accessed_at
            ? new Date(b.last_accessed_at).getTime()
            : 0;
          // DESC (default): newest first (bTime - aTime)
          // ASC: oldest first (aTime - bTime)
          if (bTime !== aTime) return (aTime - bTime) * multiplier;
          // Fallback to created_at for ties
          return (
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()) *
            multiplier
          );
        });

      case "date-added":
        return novelsCopy.sort(
          (a, b) =>
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()) *
            multiplier,
        );

      case "by-category":
        return novelsCopy.sort((a, b) => {
          const categoryDiff =
            ((a.category_id || 0) - (b.category_id || 0)) * multiplier;
          if (categoryDiff !== 0) return categoryDiff;

          const aTime = a.last_accessed_at
            ? new Date(a.last_accessed_at).getTime()
            : 0;
          const bTime = b.last_accessed_at
            ? new Date(b.last_accessed_at).getTime()
            : 0;
          // Within same category, sort by recently accessed (newest first for DESC)
          return (aTime - bTime) * multiplier;
        });

      case "by-tag":
        return novelsCopy.sort((a, b) => {
          // Get first tag name or empty string if no tags
          const tagA = a.tags && a.tags.length > 0 ? a.tags[0].name : "";
          const tagB = b.tags && b.tags.length > 0 ? b.tags[0].name : "";

          // If one has tag and other doesn't, put tagged first (or last)
          if (!tagA && tagB) return 1; // No tag goes to bottom
          if (tagA && !tagB) return -1;

          const tagDiff = tagA.localeCompare(tagB) * multiplier;
          if (tagDiff !== 0) return tagDiff;

          // Secondary sort: Recently read
          const aTime = a.last_accessed_at
            ? new Date(a.last_accessed_at).getTime()
            : 0;
          const bTime = b.last_accessed_at
            ? new Date(b.last_accessed_at).getTime()
            : 0;
          return (aTime - bTime) * multiplier;
        });

      default:
        return novelsCopy;
    }
  }, [novels, sortBy, sortOrder]);
}
