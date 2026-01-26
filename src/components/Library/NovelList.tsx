import React from "react";
import type { NovelListProps } from "../../types";
import NovelCard from "./NovelCard";

const NovelList: React.FC<NovelListProps> = ({
  novels,
  categories,
  tags,
  scraping,
  onScrape,
  onDelete,
  loading,
  isSelectionMode = false,
  selectedNovels = new Set(),
  onToggleSelection,
  onUpdate,
}) => {
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
          <p className="mb-2">📚 No novels found</p>
          <p className="text-sm">
            Try selecting a different category or import your library
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid - Larger cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {novels.map((novel) => (
          <NovelCard
            key={novel.book_id}
            novel={novel}
            categories={categories}
            tags={tags}
            onScrape={onScrape}
            onDelete={onDelete}
            isScraping={scraping === novel.book_id}
            isSelectionMode={isSelectionMode}
            isSelected={selectedNovels.has(novel.book_id)}
            onToggleSelection={onToggleSelection}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default NovelList;
