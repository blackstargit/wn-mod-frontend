import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { novelApi, tagsApi } from "@/api/client";
import type { NovelCardProps } from "@/types";
import {
  MoreVertical,
  RefreshCw,
  Trash2,
  BookOpen,
  Download,
} from "lucide-react";
import NovelCardOverlays from "./NovelCardOverlays";
import NovelCardHeader from "./NovelCardHeader";
import NovelCardInfo from "./NovelCardInfo";

const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  categories,
  tags,
  onScrape,
  onRescrapeDescription,
  onRescrapeChapters,
  onDelete,
  isScraping,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onUpdate,
}) => {
  // State
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentCategoryId = novel.category_id || 1;
  const currentCategoryName =
    categories.find((c) => c.id === currentCategoryId)?.name || "Unknown";

  // Handlers
  const handleCategorySelect = async (categoryId: number) => {
    try {
      await novelApi.updateMetadata(novel.book_id, { category_id: categoryId });
      setIsEditingCategory(false);
      onUpdate?.();
    } catch (err) {
      console.error("Failed to update category", err);
    }
  };

  const handleToggleTag = async (tagId: number) => {
    const isTagged = novel.tags?.some((t) => t.id === tagId);
    try {
      if (isTagged) {
        await tagsApi.removeTagFromNovel(novel.book_id, tagId);
      } else {
        await tagsApi.addTagToNovel(novel.book_id, tagId);
      }
      onUpdate?.();
    } catch (err) {
      console.error("Failed to toggle tag", err);
    }
  };

  const handleReadClick = async () => {
    try {
      await novelApi.updateMetadata(novel.book_id, {
        last_accessed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update metadata:", error);
    }
  };

  const handleRescrape = () => {
    if (onRescrapeDescription) {
      console.log("ON RESCRAPE")
      onRescrapeDescription(novel.book_id);
    } else {
      console.log("ON SCRAPE")

      onScrape(novel.book_id);
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(novel.book_id);
    setShowMenu(false);
  };

  const handleEditCategory = () => {
    setIsEditingCategory(true);
    setShowMenu(false);
  };

  const handleEditTags = () => {
    setIsEditingTags(true);
    setShowMenu(false);
  };

  return (
    <div
      className={`group relative bg-slate-800 rounded-xl overflow-hidden border transition-all duration-200 flex flex-col h-full ${
        isSelected
          ? "border-purple-500 ring-1 ring-purple-500 bg-slate-800/80"
          : "border-slate-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
      }`}
    >
      {/* Selection Overlay */}
      {isSelectionMode && (
        <div
          className="absolute inset-0 z-20 cursor-pointer bg-slate-900/10"
          onClick={() => onToggleSelection?.(novel.book_id)}
        >
          <div className="absolute top-3 left-3">
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-800 checked:bg-purple-600 checked:border-purple-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Overlays (Category/Tags) */}
      <NovelCardOverlays
        isEditingCategory={isEditingCategory}
        isEditingTags={isEditingTags}
        setIsEditingCategory={setIsEditingCategory}
        setIsEditingTags={setIsEditingTags}
        categories={categories}
        tags={tags}
        novel={novel}
        currentCategoryId={currentCategoryId}
        onCategorySelect={handleCategorySelect}
        onToggleTag={handleToggleTag}
      />

      {/* Card Content */}
      <div className="p-4 flex flex-col h-full">
        <NovelCardHeader
          novel={novel}
          categoryName={currentCategoryName}
          onEditCategory={handleEditCategory}
          onEditTags={handleEditTags}
        />

        {/* Title */}
        <Link to={`/book/${novel.book_id}`}>
          <h3
            className="font-bold text-lg text-white leading-tight mb-3 line-clamp-2 pt-3 min-h-[57px] hover:text-purple-400 transition-colors cursor-pointer"
            title={novel.title}
          >
            {novel.title}
          </h3>
        </Link>

        <NovelCardInfo novel={novel} />

        {/* Footer Actions */}
        {!isSelectionMode && (
          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-700/50">
            {/* Primary Action Button */}
            {novel.scraped ? (
              <Link
                to={`/read/${novel.book_id}${novel.last_read_chapter > 0 ? `/${novel.last_read_chapter}` : ""}`}
                onClick={handleReadClick}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded-lg font-medium transition-colors shadow-lg shadow-purple-900/20"
              >
                <BookOpen className="w-4 h-4" />
                {novel.last_read_chapter > 0 ? "Continue" : "Read"}
              </Link>
            ) : (
              <button
                onClick={() => onScrape(novel.book_id)}
                disabled={isScraping}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScraping ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isScraping ? "Fetching..." : "Fetch Details"}
              </button>
            )}

            {/* Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-lg transition-colors ${showMenu ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-20 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={handleRescrape}
                    disabled={isScraping}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-slate-200 text-sm border-b border-slate-700/50 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Rescrape Description
                  </button>

                  {/* New Rescrape Chapters Button - Only if novel is already scraped/has content */}
                  {novel.scraped && (
                    <button
                      onClick={() => {
                        onRescrapeChapters?.(novel.book_id);
                        setShowMenu(false);
                      }}
                      disabled={isScraping}
                      className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-slate-200 text-sm border-b border-slate-700/50 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Rescrape Chapters
                    </button>
                  )}

                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-red-900/20 text-red-400 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Novel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NovelCard;
