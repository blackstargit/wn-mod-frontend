export interface Novel {
  id: number;
  title: string;
  author: string;
  cover_url: string;
  webnovel_id: string;
  webnovel_url?: string;
  total_chapters: number;
  // Frontend-only fields (stored in localStorage)
  uuid?: string;
  scraped?: boolean;
  read?: boolean;
  lastReadChapter?: number;
  lastAccessedAt?: string;
  addedAt?: string;
}

export interface Chapter {
  id: number;
  novel_id: number;
  chapter_index: number;
  title: string;
  content: string;
}

export type NovelStatus = "unread" | "reading" | "scraped";
