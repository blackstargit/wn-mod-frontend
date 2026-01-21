import React, { useEffect, useState, useMemo } from "react";
import { libraryApi, novelApi } from "../api/client";
import type { Novel } from "../types";
import NovelCard from "./NovelCard";
import {
  enrichNovelWithMetadata,
  markNovelAsScraped,
} from "../utils/novelMetadata";

const NovelList: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [scraping, setScraping] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      setLoading(true);
      const response = await libraryApi.getNovels();
      const enrichedNovels = response.data.map(enrichNovelWithMetadata);
      setNovels(enrichedNovels);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async (id: number) => {
    setScraping(id);
    try {
      await novelApi.scrapeNovel(id);
      markNovelAsScraped(id);
      // Refresh the novel list to update metadata
      await loadNovels();
      console.log("Scraping started (check backend console)");
    } catch (error) {
      console.error(error);
    } finally {
      setScraping(null);
    }
  };

  // Sort novels: last accessed first, then by added date
  const sortedNovels = useMemo(() => {
    return [...novels].sort((a, b) => {
      // If both have lastAccessedAt, sort by that (most recent first)
      if (a.lastAccessedAt && b.lastAccessedAt) {
        return (
          new Date(b.lastAccessedAt).getTime() -
          new Date(a.lastAccessedAt).getTime()
        );
      }
      // If only one has been accessed, it goes first
      if (a.lastAccessedAt) return -1;
      if (b.lastAccessedAt) return 1;

      // Otherwise sort by added date (most recent first)
      const aDate = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const bDate = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [novels]);

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
            {novels.filter((n) => n.read).length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedNovels.map((novel) => (
          <NovelCard
            key={novel.uuid || novel.id}
            novel={novel}
            onScrape={handleScrape}
            isScraping={scraping === novel.id}
          />
        ))}
      </div>
    </div>
  );
};

export default NovelList;
