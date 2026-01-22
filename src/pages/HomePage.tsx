import React, { useEffect, useState, useMemo } from "react";
import { libraryApi, novelApi, categoriesApi } from "../api/client";
import type { Novel, Category } from "../types";
import LibraryImport from "../components/LibraryImport";
import NovelList from "../components/NovelList";

type SortOption = "recently-read" | "date-added" | "by-category";

const HomePage: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recently-read");
  const [scraping, setScraping] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNovels, setSelectedNovels] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [novelsRes, categoriesRes] = await Promise.all([
        libraryApi.getNovels(),
        categoriesApi.getCategories(),
      ]);
      setNovels(novelsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async (book_id: string) => {
    setScraping(book_id);
    try {
      await novelApi.scrapeNovel(book_id);
      setTimeout(() => {
        loadData();
      }, 2000);
      console.log("Scraping started (check backend console)");
    } catch (error) {
      console.error(error);
    } finally {
      setScraping(null);
    }
  };

  const handleDeleteNovel = async (book_id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this novel? This action cannot be undone.",
      )
    ) {
      try {
        await novelApi.deleteNovel(book_id);
        loadData();
      } catch (error) {
        console.error("Failed to delete novel:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNovels.size === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedNovels.size} novel(s)? This action cannot be undone.`,
      )
    ) {
      try {
        await novelApi.bulkDeleteNovels(Array.from(selectedNovels));
        setSelectedNovels(new Set());
        setIsSelectionMode(false);
        loadData();
      } catch (error) {
        console.error("Failed to delete novels:", error);
      }
    }
  };

  const toggleNovelSelection = (book_id: string) => {
    const newSelection = new Set(selectedNovels);
    if (newSelection.has(book_id)) {
      newSelection.delete(book_id);
    } else {
      newSelection.add(book_id);
    }
    setSelectedNovels(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedNovels.size === filteredNovels.length) {
      setSelectedNovels(new Set());
    } else {
      setSelectedNovels(new Set(filteredNovels.map((n) => n.book_id)));
    }
  };

  // Filter novels by selected category
  const filteredNovels = useMemo(() => {
    if (selectedCategory === null) {
      return novels;
    }
    return novels.filter((n) => n.category_id === selectedCategory);
  }, [novels, selectedCategory]);

  // Sort novels based on selected option
  const sortedNovels = useMemo(() => {
    const novelsCopy = [...filteredNovels];

    switch (sortBy) {
      case "recently-read":
        return novelsCopy.sort((a, b) => {
          const aTime = a.last_accessed_at
            ? new Date(a.last_accessed_at).getTime()
            : 0;
          const bTime = b.last_accessed_at
            ? new Date(b.last_accessed_at).getTime()
            : 0;
          if (bTime !== aTime) return bTime - aTime;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

      case "date-added":
        return novelsCopy.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

      case "by-category":
        return novelsCopy.sort((a, b) => {
          // First sort by category_id
          if (a.category_id !== b.category_id) {
            return (a.category_id || 0) - (b.category_id || 0);
          }
          // Within same category, sort by recently read
          const aTime = a.last_accessed_at
            ? new Date(a.last_accessed_at).getTime()
            : 0;
          const bTime = b.last_accessed_at
            ? new Date(b.last_accessed_at).getTime()
            : 0;
          return bTime - aTime;
        });

      default:
        return novelsCopy;
    }
  }, [filteredNovels, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredNovels.length;
    const scraped = filteredNovels.filter((n) => n.scraped).length;
    const reading = filteredNovels.filter((n) => n.last_accessed_at).length;
    const unread = total - scraped;

    return { total, scraped, reading, unread };
  }, [filteredNovels]);

  return (
    <div className="space-y-8">
      {/* Import Section */}
      <LibraryImport />

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          📊 Library Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Total Novels</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
            <div className="text-green-500 text-sm mb-1">Scraped</div>
            <div className="text-2xl font-bold text-green-400">
              {stats.scraped}
            </div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
            <div className="text-blue-500 text-sm mb-1">Reading</div>
            <div className="text-2xl font-bold text-blue-400">
              {stats.reading}
            </div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
            <div className="text-orange-500 text-sm mb-1">Unread</div>
            <div className="text-2xl font-bold text-orange-400">
              {stats.unread}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Section */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold mb-4 text-white">
          Filter by Category
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === null
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            📚 Library ({novels.length})
          </button>

          {categories.map((category) => {
            const count = novels.filter(
              (n) => n.category_id === category.id,
            ).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort and Actions Bar */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-slate-300 text-sm font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="recently-read">Recently Read</option>
            <option value="date-added">Date Added</option>
            <option value="by-category">By Category</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {isSelectionMode ? (
            <>
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {selectedNovels.size === filteredNovels.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedNovels.size === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Delete Selected ({selectedNovels.size})
              </button>
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedNovels(new Set());
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSelectionMode(true)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
              Select Multiple
            </button>
          )}
        </div>
      </div>

      {/* Novel List */}
      <NovelList
        novels={sortedNovels}
        scraping={scraping}
        onScrape={handleScrape}
        onDelete={handleDeleteNovel}
        loading={loading}
        isSelectionMode={isSelectionMode}
        selectedNovels={selectedNovels}
        onToggleSelection={toggleNovelSelection}
      />
    </div>
  );
};

export default HomePage;
