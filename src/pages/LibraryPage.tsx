import React, { useEffect, useMemo } from "react";
import {
  useLibraryData,
  useLocalStorage,
  useNovelSelection,
  useNovelSort,
} from "@/hooks";
import type {
  SortOption,
  SortOrder,
  LibraryStats as StatsType,
} from "@/types";
import LibraryImport from "@/components/Library/LibraryImport";
import NovelList from "@/components/Library/NovelList";
import LibraryStatsComponent from "@/components/Library/LibraryStats";
import CategoryFilter from "@/components/Library/CategoryFilter";
import SortControls from "@/components/Library/SortControls";
import SelectionControls from "@/components/Library/SelectionControls";
import TagFilter from "@/components/Library/TagFilter";
import { novelApi } from "@/api/client";

const HomePage: React.FC = () => {
  const {
    novels,
    categories,
    tags,
    loading,
    loadData,
    deleteNovel,
    bulkDeleteNovels,
  } = useLibraryData();

  const [selectedCategory, setSelectedCategory] = useLocalStorage<
    number | null
  >("selectedCategory", null);
  const [sortBy, setSortBy] = useLocalStorage<SortOption>(
    "novelSortBy",
    "recently-read",
  );
  const [sortOrder, setSortOrder] = useLocalStorage<SortOrder>(
    "novelSortOrder",
    "desc",
  );
  const [selectedTags, setSelectedTags] = useLocalStorage<number[]>(
    "selectedLibraryTags",
    [],
  );

  const {
    selectedNovels,
    isSelectionMode,
    toggleSelection,
    toggleSelectAll,
    enterSelectionMode,
    exitSelectionMode,
  } = useNovelSelection();

  const [scraping, setScraping] = React.useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter novels by category and tags
  const filteredNovels = useMemo(() => {
    let result = novels;

    if (selectedCategory !== null) {
      result = result.filter((n) => n.category_id === selectedCategory);
    }

    if (selectedTags.length > 0) {
      result = result.filter((n) =>
        n.tags?.some((t) => selectedTags.includes(t.id)),
      );
    }

    return result;
  }, [novels, selectedCategory, selectedTags]);

  const handleToggleFilterTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  // Sort novels
  const sortedNovels = useNovelSort(filteredNovels, sortBy, sortOrder);

  // Calculate stats
  const stats: StatsType = useMemo(
    () => ({
      total: filteredNovels.length,
      scraped: filteredNovels.filter((n) => n.scraped).length,
      reading: filteredNovels.filter((n) => n.last_accessed_at).length,
      unread:
        filteredNovels.length - filteredNovels.filter((n) => n.scraped).length,
    }),
    [filteredNovels],
  );

  const handleScrape = async (book_id: string) => {
    setScraping(book_id);
    try {
      await novelApi.scrapeNovel(book_id);
      setTimeout(() => loadData(), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setScraping(null);
    }
  };

  const handleDeleteNovel = async (book_id: string) => {
    if (window.confirm("Delete this novel? This cannot be undone.")) {
      try {
        await deleteNovel(book_id);
      } catch (error) {
        console.error("Failed to delete novel:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNovels.size === 0) return;
    if (
      window.confirm(
        `Delete ${selectedNovels.size} novel(s)? This cannot be undone.`,
      )
    ) {
      try {
        await bulkDeleteNovels(Array.from(selectedNovels));
        exitSelectionMode();
      } catch (error) {
        console.error("Failed to delete novels:", error);
      }
    }
  };

  const handleBulkAssignCategory = async (categoryId: number) => {
    if (selectedNovels.size === 0) return;

    try {
      // Update category for all selected novels
      const updatePromises = Array.from(selectedNovels).map((book_id) =>
        novelApi.updateMetadata(book_id, { category_id: categoryId }),
      );

      await Promise.all(updatePromises);

      // Reload data to reflect changes
      await loadData();

      // Exit selection mode after successful update
      exitSelectionMode();
    } catch (error) {
      console.error("Failed to assign category:", error);
      alert("Failed to assign category to some novels. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <LibraryImport />

      <LibraryStatsComponent stats={stats} />

      <CategoryFilter
        categories={categories}
        novels={novels}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="card flex flex-wrap gap-4 items-center justify-between">
        <SortControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
        />

        <div className="flex flex-wrap gap-4 items-center">
          <TagFilter
            tags={tags}
            selectedTags={selectedTags}
            onToggleTag={handleToggleFilterTag}
          />

          <SelectionControls
            isSelectionMode={isSelectionMode}
            selectedCount={selectedNovels.size}
            totalCount={filteredNovels.length}
            onEnterSelectionMode={enterSelectionMode}
            onExitSelectionMode={exitSelectionMode}
            onSelectAll={() =>
              toggleSelectAll(filteredNovels.map((n) => n.book_id))
            }
            onBulkDelete={handleBulkDelete}
            categories={categories}
            onBulkAssignCategory={handleBulkAssignCategory}
          />
        </div>
      </div>

      <NovelList
        novels={sortedNovels}
        categories={categories}
        tags={tags}
        scraping={scraping}
        onScrape={handleScrape}
        onDelete={handleDeleteNovel}
        loading={loading}
        isSelectionMode={isSelectionMode}
        selectedNovels={selectedNovels}
        onToggleSelection={toggleSelection}
        onUpdate={loadData}
      />
    </div>
  );
};

export default HomePage;
