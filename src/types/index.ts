export interface Novel {
  id: number;
  uuid: string;
  title: string;
  author: string;
  cover_url: string;
  webnovel_id: string;
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
  novel_id: number;
  chapter_index: number;
  title: string;
  content: string;
}

export type NovelStatus = "unread" | "reading" | "scraped";
