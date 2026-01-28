import React from "react";
import type { Novel } from "@/types";
import { Folder, Tag as TagIcon } from "lucide-react";

interface NovelCardHeaderProps {
  novel: Novel;
  categoryName: string;
  onEditCategory: () => void;
  onEditTags: () => void;
}

const NovelCardHeader: React.FC<NovelCardHeaderProps> = ({
  novel,
  categoryName,
  onEditCategory,
  onEditTags,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {/* Category */}
      <button
        onClick={onEditCategory}
        className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-colors"
        title="Change Category"
      >
        <Folder className="w-3 h-3" />
        <span className="truncate max-w-[100px]">{categoryName}</span>
      </button>

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
        onClick={onEditTags}
        className="p-1 text-slate-500 hover:text-purple-400 rounded-full hover:bg-slate-700 transition-colors"
        title="Manage Tags"
      >
        <TagIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

export default NovelCardHeader;
