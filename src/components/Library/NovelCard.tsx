import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { novelApi, categoriesApi, tagsApi } from "../../api/client";
import type { Category, NovelCardProps, Tag } from "../../types";

const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  onScrape,
  onDelete,
  isScraping,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onUpdate,
}) => {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState(
    novel.category_id || 1,
  );
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  // Fetch categories on mount to display category name
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Helper to fetch categories if not loaded
  const handleEditCategory = async () => {
    if (!isEditingCategory) {
      setIsEditingCategory(true);
      if (categories.length === 0) {
        setLoadingCategories(true);
        try {
          const res = await categoriesApi.getCategories();
          setCategories(res.data);
        } catch (err) {
          console.error("Failed to load categories", err);
        } finally {
          setLoadingCategories(false);
        }
      }
    } else {
      setIsEditingCategory(false);
    }
  };

  const handleEditTags = async () => {
    if (!isEditingTags) {
      setIsEditingTags(true);
      // Close category editor if open
      setIsEditingCategory(false);

      if (allTags.length === 0) {
        setLoadingTags(true);
        try {
          const res = await tagsApi.getTags();
          setAllTags(res.data);
        } catch (err) {
          console.error("Failed to load tags", err);
        } finally {
          setLoadingTags(false);
        }
      }
    } else {
      setIsEditingTags(false);
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
      onUpdate?.(); // Refresh library data
    } catch (err) {
      console.error("Failed to toggle tag", err);
    }
  };

  const handleCategorySelect = async (categoryId: number) => {
    try {
      await novelApi.updateMetadata(novel.book_id, {
        category_id: categoryId,
      });
      setCurrentCategoryId(categoryId);
      setIsEditingCategory(false);
      onUpdate?.();
    } catch (err) {
      console.error("Failed to update category", err);
    }
  };

  const currentCategoryName = categories.find(
    (c) => c.id === currentCategoryId,
  )?.name;

  const getStatusBadges = () => {
    const badges = [];

    // Category Badge
    badges.push(
      <button
        key="category"
        onClick={handleEditCategory}
        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1"
      >
        📂 {currentCategoryName}
      </button>,
    );

    // Tags Badges
    novel.tags?.forEach((tag) => {
      badges.push(
        <span
          key={`tag-${tag.id}`}
          className="px-2 py-1 text-xs rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/50"
        >
          #{tag.name}
        </span>,
      );
    });

    // Add Tag Button
    badges.push(
      <button
        key="add-tag"
        onClick={handleEditTags}
        className="px-2 py-1 text-xs rounded-full bg-slate-700/30 text-slate-500 hover:text-purple-400 hover:bg-slate-700/50 border border-transparent hover:border-purple-500/30 transition-all"
        title="Manage tags"
      >
        + Tag
      </button>,
    );

    // Add scraped badge if scraped
    if (novel.scraped) {
      badges.push(
        <span
          key="scraped"
          className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30"
        >
          ✓ Scraped
        </span>,
      );
    }

    // Add reading badge if accessed and scraped
    if (novel.last_accessed_at && novel.scraped) {
      badges.push(
        <span
          key="reading"
          className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30"
        >
          {novel.last_read_chapter > 0
            ? `Ch ${novel.last_read_chapter}`
            : "Reading"}
        </span>,
      );
    }

    return badges;
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

  const handleReadClick = async () => {
    try {
      await novelApi.updateMetadata(novel.book_id, {
        last_accessed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update metadata:", error);
    }
  };

  return (
    <div
      title={novel.title}
      className={`group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/50"
          : "border-slate-700/50 hover:border-purple-500/50"
      } h-full`}
    >
      {/* Selection Checkbox - Top Left */}
      {isSelectionMode && (
        <div className="absolute top-4 left-4 z-20">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection?.(novel.book_id)}
            className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-800 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
          />
        </div>
      )}

      {/* Category Selection Overlay */}
      {isEditingCategory && (
        <div className="absolute inset-0 bg-slate-900/95 z-30 flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Select Category</h3>
            <button
              onClick={() => setIsEditingCategory(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loadingCategories ? (
              <div className="text-center text-slate-500 py-4">Loading...</div>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    currentCategoryId === cat.id
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tags Selection Overlay */}
      {isEditingTags && (
        <div className="absolute inset-0 bg-slate-900/95 z-30 flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Manage Tags</h3>
            <button
              onClick={() => setIsEditingTags(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loadingTags ? (
              <div className="text-center text-slate-500 py-4">Loading...</div>
            ) : allTags.length === 0 ? (
              <div className="text-center text-slate-500 py-4">
                <p>No tags created yet.</p>
                <Link
                  to="/tags"
                  className="text-purple-400 hover:underline mt-2 inline-block"
                >
                  Create tags here
                </Link>
              </div>
            ) : (
              allTags.map((tag) => {
                const isSelected = novel.tags?.some((t) => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex justify-between items-center ${
                      isSelected
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{tag.name}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 text-center">
            <Link
              to="/tags"
              className="text-xs text-slate-500 hover:text-purple-400"
            >
              Manage all tags
            </Link>
          </div>
        </div>
      )}

      {/* Status Badges - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 justify-end pl-4">
        {getStatusBadges()}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col h-full">
        {/* Info Section */}
        <div className="flex-1 space-y-3 mb-5">
          <h3 className="font-bold text-md leading-tight line-clamp-2 text-white group-hover:text-purple-300 transition-colors pr-0 mt-8">
            {novel.title}
          </h3>

          <div className="space-y-1.5 pt-2">
            {novel.total_chapters > 0 && (
              <p className="text-sm text-slate-500 font-medium">
                📚 {novel.total_chapters} chapters
                {novel.last_read_chapter > 0 && (
                  <span className="text-blue-400 ml-2">
                    (Read: {novel.last_read_chapter}/{novel.total_chapters})
                  </span>
                )}
              </p>
            )}

            {/* Webnovel Progress */}
            {novel.progress > 0 && novel.total_chapters_webnovel > 0 && (
              <p className="text-sm text-purple-400 font-medium">
                🌐 Progress on Webnovel: {novel.progress}/
                {novel.total_chapters_webnovel}
              </p>
            )}

            <p className="text-sm text-slate-600">
              ➕ Added {formatDate(novel.created_at)}
            </p>
            {novel.last_accessed_at && (
              <p className="text-sm text-blue-400 font-medium">
                📖 Last read {formatDate(novel.last_accessed_at)}
              </p>
            )}
          </div>
        </div>

        {/* Actions - Equal Width Buttons */}
        {!isSelectionMode && (
          <div className="flex gap-3">
            <button
              onClick={() => onScrape(novel.book_id)}
              disabled={isScraping || novel.scraped}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
            >
              {isScraping
                ? "Scraping..."
                : novel.scraped
                  ? "Scraped ✓"
                  : "Scrape"}
            </button>
            {novel.scraped ? (
              <Link
                to={`/read/${novel.book_id}${novel.last_read_chapter > 0 ? `/${novel.last_read_chapter}` : ""}`}
                onClick={handleReadClick}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              >
                {novel.last_read_chapter > 0 ? "Continue" : "Read"}
              </Link>
            ) : (
              <button
                disabled
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-700 text-slate-500 cursor-not-allowed transition-all duration-200 text-center"
                title="Scrape the novel first to enable reading"
              >
                Read
              </button>
            )}
            <button
              onClick={() => onDelete(novel.book_id)}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/30 hover:border-red-600 transition-all duration-200"
              title="Delete this novel"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NovelCard;
