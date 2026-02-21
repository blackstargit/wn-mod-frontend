import React from "react";
import { Star, Eye, BookOpen, Tag, Calendar } from "lucide-react";
import type { BookMetadata } from "@/types/bookDescription";

interface BookHeaderProps {
  title: string;
  metadata: BookMetadata;
}

/**
 * Book header with title and metadata grid
 */
const BookHeader: React.FC<BookHeaderProps> = ({ title, metadata }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6 shadow-xl">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h1>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Rating */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-2xl font-bold text-white">
              {metadata.rating || "N/A"}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {metadata.rating_count || "0"} ratings
          </p>
        </div>

        {/* Views */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {metadata.views || "0"}
            </span>
          </div>
          <p className="text-sm text-slate-400">Views</p>
        </div>

        {/* Chapters */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {metadata.chapters || "0"}
            </span>
          </div>
          <p className="text-sm text-slate-400">Chapters</p>
        </div>

        {/* Tag */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-semibold text-white">
              {metadata.tag || "Unknown"}
            </span>
          </div>
          <p className="text-sm text-slate-400">Genre</p>
        </div>
      </div>

      {/* Status */}
      {metadata.status && metadata.status !== "0" && (
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4" />
          <span>{metadata.status} chs/week</span>
        </div>
      )}
    </div>
  );
};

export default BookHeader;
