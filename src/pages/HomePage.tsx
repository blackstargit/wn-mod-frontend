import React, { useEffect, useState, useMemo } from "react";
import { libraryApi, novelApi, categoriesApi } from "../api/client";
import type { Novel, Category } from "../types";
import LibraryImport from "../components/LibraryImport";
import NovelList from "../components/NovelList";

const HomePage: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [scraping, setScraping] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      // Refresh the novel list after a delay to show updated status
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

  // Filter novels by selected category
  const filteredNovels = useMemo(() => {
    if (selectedCategory === null) {
      return novels; // Show all novels (Library view)
    }
    return novels.filter((n) => n.category_id === selectedCategory);
  }, [novels, selectedCategory]);

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
          {/* All/Library button */}
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

          {/* Category buttons */}
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

      {/* Novel List */}
      <NovelList
        novels={filteredNovels}
        scraping={scraping}
        onScrape={handleScrape}
        loading={loading}
      />
    </div>
  );
};

export default HomePage;
