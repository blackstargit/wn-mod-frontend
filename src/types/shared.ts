export interface Novel {
  book_id: string; // Primary key (webnovel_id)
  title: string;
  author: string;
  cover_url: string;
  webnovel_url?: string;
  category_id?: number;
  total_chapters: number;
  scraped: boolean;
  last_read_chapter: number;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LibraryStats {
  total: number;
  scraped: number;
  reading: number;
  unread: number;
}
