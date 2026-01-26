export interface Novel {
  book_id: string; // Primary key (webnovel_id)
  title: string;
  author: string;
  cover_url: string;
  webnovel_url?: string;
  category_id?: number;
  total_chapters: number; // Scraped chapters count
  total_chapters_webnovel: number; // Total chapters on webnovel
  progress: number; // Chapters read on webnovel
  scraped: boolean;
  last_read_chapter: number;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

interface Tag {
  id: number;
  name: string;
  count: number;
}

export interface LibraryStats {
  total: number;
  scraped: number;
  reading: number;
  unread: number;
}
