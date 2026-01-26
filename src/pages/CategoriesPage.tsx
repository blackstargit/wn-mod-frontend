import React, { useState, useEffect } from "react";
import { categoriesApi } from "../api/client";
import type { Category } from "../types";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

const CategoriesPage: React.FC = () => {
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to load categories", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      try {
        await categoriesApi.createCategory(newCategory);
        setNewCategory("");
        loadCategories();
      } catch (err) {
        console.error("Failed to create category", err);
        setError("Failed to create category");
      }
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdateCategory = async (categoryId: number) => {
    if (
      editName.trim() &&
      editName !== categories.find((c) => c.id === categoryId)?.name
    ) {
      try {
        await categoriesApi.updateCategory(categoryId, editName);
        setEditingId(null);
        loadCategories();
      } catch (err) {
        console.error("Failed to update category", err);
        setError("Failed to update category");
      }
    } else {
      cancelEditing();
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (categoryId === 1) {
      alert("Cannot delete the default 'Imported' category.");
      return;
    }

    if (
      window.confirm(
        "Are you sure? Novels in this category will be moved to 'Imported'.",
      )
    ) {
      try {
        await categoriesApi.deleteCategory(categoryId);
        loadCategories();
      } catch (err) {
        console.error("Failed to delete category", err);
        setError("Failed to delete category");
      }
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Categories Management
        </h1>
        <p className="text-slate-400">
          Organize your library with custom categories
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create New Category */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Create New Category
        </h2>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name..."
            className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="btn-primary flex items-center gap-2 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            disabled={!newCategory.trim()}
          >
            <Plus className="w-5 h-5" />
            Create Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-white">
          All Categories ({categories.length})
        </h2>

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-all"
            >
              {editingId === category.id ? (
                // Edit Mode
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:outline-none focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateCategory(category.id);
                      if (e.key === "Escape") cancelEditing();
                    }}
                  />
                  <button
                    onClick={() => handleUpdateCategory(category.id)}
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
                    <span className="text-white font-medium">
                      {category.name}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {category.count}{" "}
                      {category.count === 1 ? "novel" : "novels"}
                    </span>
                    {category.id === 1 && (
                      <span className="text-xs text-slate-500 italic">
                        (Default)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {category.id !== 1 && (
                      <>
                        <button
                          onClick={() => startEditing(category)}
                          className="p-2 hover:bg-slate-600 rounded transition-colors text-slate-400 hover:text-white"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 hover:bg-red-500/20 rounded transition-colors text-slate-400 hover:text-red-400"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
