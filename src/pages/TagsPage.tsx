import React, { useEffect, useState } from "react";
import { tagsApi } from "@/api/client";
import type { Tag } from "@/types";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await tagsApi.getTags();
      setTags(response.data);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      await tagsApi.createTag(newTagName.trim());
      setNewTagName("");
      await loadTags();
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert("Tag with this name already exists");
      } else {
        console.error("Failed to create tag:", error);
      }
    }
  };

  const handleUpdateTag = async (tagId: number) => {
    if (!editingName.trim()) return;

    try {
      await tagsApi.updateTag(tagId, editingName.trim());
      setEditingTag(null);
      setEditingName("");
      await loadTags();
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert("Tag with this name already exists");
      } else {
        console.error("Failed to update tag:", error);
      }
    }
  };

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    if (
      !window.confirm(
        `Delete tag "${tagName}"? This will remove it from all novels.`,
      )
    ) {
      return;
    }

    try {
      await tagsApi.deleteTag(tagId);
      await loadTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditingName(tag.name);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditingName("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Tags Management
        </h1>
        <p className="text-slate-400">
          Create and manage tags to organize your novels
        </p>
      </div>

      {/* Create New Tag */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Create New Tag
        </h2>
        <form onSubmit={handleCreateTag} className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name..."
            className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            className="btn-primary flex items-center gap-2 px-6"
            disabled={!newTagName.trim()}
          >
            <Plus className="w-5 h-5" />
            Create Tag
          </button>
        </form>
      </div>

      {/* Tags List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-white">
          All Tags ({tags.length})
        </h2>

        {tags.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg mb-2">No tags yet</p>
            <p className="text-sm">Create your first tag to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all"
              >
                {editingTag === tag.id ? (
                  // Edit Mode
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:outline-none focus:border-purple-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateTag(tag.id);
                        if (e.key === "Escape") cancelEditing();
                      }}
                    />
                    <button
                      onClick={() => handleUpdateTag(tag.id)}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{tag.name}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {tag.count} {tag.count === 1 ? "novel" : "novels"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(tag)}
                        className="p-2 hover:bg-slate-600 rounded transition-colors text-slate-400 hover:text-white"
                        title="Edit tag"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors text-slate-400 hover:text-red-400"
                        title="Delete tag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;
