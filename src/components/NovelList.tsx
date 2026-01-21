import React, { useEffect, useState, useMemo } from "react";
import { libraryApi, novelApi } from "../api/client";
import type { Novel } from "../types";
import NovelCard from "./NovelCard";

const NovelList: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [scraping, setScraping] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      setLoading(true);
      const response = await libraryApi.getNovels();
      setNovels(response.data);
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
        loadNovels();
      }, 2000);
      console.log("Scraping started (check backend console)");
    } catch (error) {
      console.error(error);
    } finally {
      setScraping(null);
    }
  };

  // Backend now returns novels sorted by last_accessed_at, so no need to sort here
  const sortedNovels = useMemo(() => novels, [novels]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (novels.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-400 text-lg">
          <p className="mb-2">📚 No novels in your library yet</p>
          <p className="text-sm">Import your library above to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300">
          <span className="text-slate-400">Total:</span>{" "}
          <span className="font-semibold text-white">{novels.length}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
          <span className="text-green-500">Scraped:</span>{" "}
          <span className="font-semibold">
            {novels.filter((n) => n.scraped).length}
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
          <span className="text-blue-500">Reading:</span>{" "}
          <span className="font-semibold">
            {novels.filter((n) => n.last_accessed_at).length}
          </span>
        </div>
      </div>

      {/* Grid - Larger cards with images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNovels.map((novel) => (
          <NovelCard
            key={novel.book_id}
            novel={novel}
            onScrape={handleScrape}
            isScraping={scraping === novel.book_id}
          />
        ))}
      </div>
    </div>
  );
};

export default NovelList;
