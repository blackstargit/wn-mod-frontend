import type { Novel, LibraryStats } from "./shared";
import type { Tag } from "./tags";

interface Category {
  id: number;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  novels: Novel[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

interface LibraryStatsProps {
  stats: LibraryStats;
}

interface NovelCardProps {
  novel: Novel;
  categories: Category[];
  tags: Tag[];
  onScrape: (book_id: string) => void;
  onRescrapeDescription: (book_id: string) => void;
  onRescrapeChapters: (book_id: string) => void;
  onDelete: (book_id: string) => void;
  isScraping: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (book_id: string) => void;
  onUpdate?: () => void;
}

interface NovelListProps {
  novels: Novel[];
  categories: Category[];
  tags: Tag[];
  scraping: string | null;
  onScrape: (book_id: string) => void;
  onRescrapeDescription: (book_id: string) => void;
  onRescrapeChapters: (book_id: string) => void;
  onDelete: (book_id: string) => void;
  loading: boolean;
  isSelectionMode?: boolean;
  selectedNovels?: Set<string>;
  onToggleSelection?: (book_id: string) => void;
  onUpdate?: () => void;
}

interface SelectionControlsProps {
  isSelectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  onEnterSelectionMode: () => void;
  onExitSelectionMode: () => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  categories?: Category[];
  onBulkAssignCategory?: (categoryId: number) => void;
}

interface SortControlsProps {
  sortBy: SortOption;
  sortOrder: SortOrder;
  onSortByChange: (sortBy: SortOption) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

// Sort options for library
export type SortOption =
  | "recently-read"
  | "date-added"
  | "by-category"
  | "by-tag";
export type SortOrder = "asc" | "desc";

export type {
  Category,
  CategoryFilterProps,
  LibraryStatsProps,
  NovelCardProps,
  NovelListProps,
  SelectionControlsProps,
  SortControlsProps,
};
