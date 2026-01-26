import React from "react";
import { Link } from "react-router-dom";
import type { Category, Novel, Tag } from "../../types";
import { X, Check } from "lucide-react";

interface NovelCardOverlaysProps {
  isEditingCategory: boolean;
  isEditingTags: boolean;
  setIsEditingCategory: (v: boolean) => void;
  setIsEditingTags: (v: boolean) => void;
  categories: Category[];
  tags: Tag[];
  novel: Novel;
  currentCategoryId: number;
  onCategorySelect: (id: number) => void;
  onToggleTag: (id: number) => void;
}

const NovelCardOverlays: React.FC<NovelCardOverlaysProps> = ({
  isEditingCategory,
  isEditingTags,
  setIsEditingCategory,
  setIsEditingTags,
  categories,
  tags,
  novel,
  currentCategoryId,
  onCategorySelect,
  onToggleTag,
}) => {
  if (!isEditingCategory && !isEditingTags) return null;

  return (
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
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isEditingCategory ? (
          // Category List
          categories.length === 0 ? (
            <div className="text-center text-slate-500 py-4">
              No categories found
            </div>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
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
        ) : tags.length === 0 ? (
          // Tag List
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
          tags.map((tag) => {
            const isTagged = novel.tags?.some((t) => t.id === tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => onToggleTag(tag.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex justify-between items-center ${
                  isTagged
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>{tag.name}</span>
                {isTagged && <Check className="w-4 h-4" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NovelCardOverlays;
