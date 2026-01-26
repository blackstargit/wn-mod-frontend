export interface Chapter {
  id: number;
  book_id: string; // Foreign key to Novel
  chapter_index: number;
  title: string;
  content: string;
}

export type NovelStatus = "unread" | "reading" | "scraped";

export type {
  Category,
  CategoryFilterProps,
  LibraryStatsProps,
  NovelCardProps,
  NovelListProps,
  SelectionControlsProps,
  SortControlsProps,
  SortOption,
  SortOrder,
} from "./library";

export type { Novel, LibraryStats } from "./shared";

export type { Tag, TagCreate, NovelTagsUpdate } from "./tags";
