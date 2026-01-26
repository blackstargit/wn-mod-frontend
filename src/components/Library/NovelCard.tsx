import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { novelApi, categoriesApi, tagsApi } from "../../api/client";
import type { Category, NovelCardProps, Tag } from "../../types";
import {
  MoreVertical,
  RefreshCw,
  Trash2,
  BookOpen,
  Download,
  Tag as TagIcon,
  Folder,
} from "lucide-react";

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
  // State
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

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
    categories.find((c) => c.id === currentCategoryId)?.name || "Loading...";

  // Data Fetching Helpers
  const ensureCategoriesLoaded = async () => {
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
  };

  const ensureTagsLoaded = async () => {
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
  };

  // Handlers
  const handleEditCategory = () => {
    setIsEditingCategory(true);
    ensureCategoriesLoaded();
    setShowMenu(false);
  };

  const handleEditTags = () => {
    setIsEditingTags(true);
    ensureTagsLoaded();
    setShowMenu(false);
  };

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
    onScrape(novel.book_id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(novel.book_id);
    setShowMenu(false);
  };

  // Initial load for category name if needed
  useEffect(() => {
    ensureCategoriesLoaded();
  }, []);

  // Formatters
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently added";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
      {(isEditingCategory || isEditingTags) && (
        <div className="absolute inset-0 bg-slate-900/98 z-30 flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">
              {isEditingCategory ? "Select Category" : "Manage Tags"}
            </h3>
            <button
              onClick={() => {
                setIsEditingCategory(false);
                setIsEditingTags(false);
              }}
              className="text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isEditingCategory ? (
              // Category List
              loadingCategories ? (
                <div className="text-center text-slate-500 py-4">
                  Loading...
                </div>
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
              )
            ) : // Tag List
            loadingTags ? (
              <div className="text-center text-slate-500 py-4">Loading...</div>
            ) : allTags.length === 0 ? (
              <div className="text-center text-slate-500 py-4">
                <p>No tags created yet.</p>
                <Link
                  to="/tags"
                  className="text-purple-400 hover:underline mt-2 inline-block"
                >
                  Go to Tags Page
                </Link>
              </div>
            ) : (
              allTags.map((tag) => {
                const isTagged = novel.tags?.some((t) => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex justify-between items-center ${
                      isTagged
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{tag.name}</span>
                    {isTagged && <CheckIcon className="w-4 h-4" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 flex flex-col h-full">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Category */}
          <button
            onClick={handleEditCategory}
            className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-colors"
            title="Change Category"
          >
            <Folder className="w-3 h-3" />
            <span className="truncate max-w-[100px]">
              {currentCategoryName}
            </span>
          </button>

          {/* Scraped Status
          {novel.scraped && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              Scraped
            </span>
          )} */}
          {novel.last_read_chapter > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Ch {novel.last_read_chapter}
            </span>
          )}

          {/* Tags */}
          {novel.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
            >
              #{tag.name}
            </span>
          ))}
          {(novel.tags?.length || 0) > 3 && (
            <span className="text-xs text-slate-500">
              +{novel.tags!.length - 3}
            </span>
          )}

          <button
            onClick={handleEditTags}
            className="p-1 text-slate-500 hover:text-purple-400 rounded-full hover:bg-slate-700 transition-colors"
            title="Manage Tags"
          >
            <TagIcon className="w-3 h-3" />
          </button>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-lg text-white leading-tight mb-3 line-clamp-2 pt-3 min-h-[57px]"
          title={novel.title}
        >
          {novel.title}
        </h3>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-xs text-slate-400 mb-4 flex-1 content-start">
          <div className="flex flex-wrap justify-between pt-3 pe-3">
            <div>
              <span className="text-slate-500 block mb-0.5">Chapters</span>
              <span className="text-slate-200 font-medium">
                {novel.total_chapters}
              </span>
            </div>
            {/* Last Local Access */}
            {novel.last_accessed_at && (
              <div>
                <span className="text-slate-500 block mb-0.5">Last read</span>
                <span className="text-blue-300 ">
                  {formatDate(novel.last_accessed_at)}
                </span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block mb-0.5">Added</span>
              <span className="text-slate-200">
                {formatDate(novel.created_at)}
              </span>
            </div>
          </div>

          {/* Webnovel Progress */}
          {(novel.progress > 0 || novel.total_chapters_webnovel > 0) && (
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500">Webnovel Progress</span>
                <span className="text-purple-300 font-medium">
                  {novel.progress}
                  <span className="text-slate-600">
                    {" "}
                    / {novel.total_chapters_webnovel}
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (novel.progress / (novel.total_chapters_webnovel || 1)) *
                        100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

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
                {isScraping ? "Scraping..." : "Scrape"}
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
                    Rescrape Novel
                  </button>
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

// Helper Components for Icons used in overlays
const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 18 18" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default NovelCard;
