import React, { useState, useEffect } from "react";
import { categoriesApi } from "../api/client";
import type { Category } from "../types";

const CategoriesPage: React.FC = () => {
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        loadCategories(); // Reload to get updated list/counts
      } catch (err) {
        console.error("Failed to create category", err);
        setError("Failed to create category");
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          🏷️ Manage Categories
        </h2>
        <p className="text-slate-400 text-sm">
          Organize your library with custom categories
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add New Category */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name..."
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!newCategory.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-500/20"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group bg-slate-800/80 p-5 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                {category.name}
              </h3>
              {category.is_system && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-900 px-2 py-1 rounded">
                  System
                </span>
              )}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">{category.count} novels</span>
              {!category.is_system && (
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-400 hover:text-red-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 hover:bg-slate-700 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
