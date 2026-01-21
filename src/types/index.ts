export interface Novel {
  book_id: string; // Primary key (webnovel_id)
  title: string;
  author: string;
  cover_url: string;
  webnovel_url?: string;
  total_chapters: number;
  scraped: boolean;
  last_read_chapter: number;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  book_id: string; // Foreign key to Novel
  chapter_index: number;
  title: string;
  content: string;
}

export type NovelStatus = "unread" | "reading" | "scraped";
