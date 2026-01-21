import React from "react";
import type { Novel } from "../types";
import { Link } from "react-router-dom";
import { markNovelAsAccessed } from "../utils/novelMetadata";

interface NovelCardProps {
  novel: Novel;
  onScrape: (id: number) => void;
  isScraping: boolean;
}

const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  onScrape,
  isScraping,
}) => {
  const getStatusBadge = () => {
    if (novel.scraped) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          ✓ Scraped
        </span>
      );
    }
    if (novel.read) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Reading
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
        Unread
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently added";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleReadClick = () => {
    markNovelAsAccessed(novel.id);
  };

  return (
    <div title={novel.title}  className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-slate-700/50 hover:border-purple-500/50 h-full">
      {/* Status Badge - Top Right */}
      <div className="absolute top-4 right-4 z-10">{getStatusBadge()}</div>

      {/* Content */}
      <div className="p-6 flex flex-col h-full">
        {/* Info Section */}
        <div className="flex-1 space-y-3 mb-5">
          <h3 className="font-bold text-xl leading-tight line-clamp-2 text-white group-hover:text-purple-300 transition-colors pr-20">
            {novel.title}
          </h3>

          <div className="space-y-1.5 pt-2">
            {novel.total_chapters > 0 && (
              <p className="text-sm text-slate-500 font-medium">
                📚 {novel.total_chapters} chapters
              </p>
            )}
            <p className="text-sm text-slate-600">
              ➕ Added {formatDate(novel.addedAt)}
            </p>
            {novel.lastAccessedAt && novel.read && (
              <p className="text-sm text-blue-400 font-medium">
                📖 Last read {formatDate(novel.lastAccessedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Actions - Equal Width Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onScrape(novel.id)}
            disabled={isScraping || novel.scraped}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
          >
            {isScraping
              ? "Scraping..."
              : novel.scraped
                ? "Scraped ✓"
                : "Scrape"}
          </button>
          <Link
            to={`/read/${novel.id}`}
            onClick={handleReadClick}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            Read
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NovelCard;
