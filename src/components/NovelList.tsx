import React, { useEffect, useState } from "react";
import { libraryApi, novelApi } from "../api/client";
import type { Novel } from "../types";
import { Link } from "react-router-dom";

const NovelList: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [scraping, setScraping] = useState<number | null>(null);

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      const response = await libraryApi.getNovels();
      setNovels(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleScrape = async (id: number) => {
    setScraping(id);
    try {
      await novelApi.scrapeNovel(id);
      alert("Scraping started (check backend console)");
    } catch (error) {
      console.error(error);
      alert("Failed to start scrape");
    } finally {
      setScraping(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {novels.map((novel) => (
        <div
          key={novel.id}
          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex h-48">
            <img
              src={novel.cover_url}
              alt={novel.title}
              className="w-32 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/150?text=No+Cover";
              }}
            />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-bold text-lg line-clamp-2">
                  {novel.title}
                </h3>
                <p className="text-sm text-gray-500">{novel.author}</p>
                <a
                  href={novel.webnovel_id}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-1 block"
                >
                  Original Source
                </a>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleScrape(novel.id)}
                  disabled={scraping === novel.id}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                  {scraping === novel.id ? "Starting..." : "Scrape"}
                </button>
                <Link
                  to={`/read/${novel.id}`}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center"
                >
                  Read
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NovelList;
