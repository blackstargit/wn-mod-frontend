import React from "react";
import { Library, Tag } from "lucide-react";
import type { CategoryFilterProps } from "../../types";

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  novels,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Filter by Category</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            selectedCategory === null
              ? "gradient-bg-primary text-white shadow-lg"
              : "btn-secondary"
          }`}
        >
          <Library className="w-4 h-4" />
          Library ({novels.length})
        </button>

        {categories.map((category) => {
          const count = novels.filter(
            (n) => n.category_id === category.id,
          ).length;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? "gradient-bg-secondary text-white shadow-lg"
                  : "btn-secondary"
              }`}
            >
              {category.name} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
