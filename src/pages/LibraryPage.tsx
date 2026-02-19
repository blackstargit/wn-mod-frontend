import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLibraryData,
  useLocalStorage,
  useNovelSelection,
  useNovelSort,
} from "@/hooks";
import type { SortOption, SortOrder, LibraryStats as StatsType } from "@/types";
import LibraryImport from "@/components/Library/LibraryImport";
import NovelList from "@/components/Library/NovelList";
import LibraryStatsComponent from "@/components/Library/LibraryStats";
import CategoryFilter from "@/components/Library/CategoryFilter";
import SortControls from "@/components/Library/SortControls";
import SelectionControls from "@/components/Library/SelectionControls";
import TagFilter from "@/components/Library/TagFilter";
import { novelApi } from "@/api/client";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
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
  const [searchQuery, setSearchQuery] = useLocalStorage<string>(
    "librarySearchQuery",
    "",
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

  // Filter novels by category, tags, and search query
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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((n) => n.title.toLowerCase().includes(query));
    }

    return result;
  }, [novels, selectedCategory, selectedTags, searchQuery]);

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
      await novelApi.getNovelDescription(book_id);
      // Navigate to book description page after fetching
      navigate(`/book/${book_id}`);
    } catch (error) {
      console.error(error);
      setScraping(null);
    }
  };

  const handleRescrapeDescription = async (book_id: string) => {
    setScraping(book_id);
    try {
      // Force refresh description
      await novelApi.getNovelDescription(book_id, true);
      // Reload library data to reflect changes (e.g. updated stats)
      await loadData();
      setScraping(null);
    } catch (error) {
      console.error(error);
      setScraping(null);
    }
  };

  const handleRescrapeChapters = async (book_id: string) => {
    setScraping(book_id);
    try {
      // Trigger chapter scraping
      await novelApi.scrapeNovel(book_id);
      setScraping(null);
    } catch (error) {
      console.error(error);
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
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <SortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
          />

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search novels by title..."
              className="w-full px-4 py-2 pl-10 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

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
        onRescrapeDescription={handleRescrapeDescription}
        onRescrapeChapters={handleRescrapeChapters}
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
