/**
 * Types for Book Description Page
 */

export interface ParsedChapterTitle {
  index: string;
  title: string;
  date: string;
}

export interface ChapterVolume {
  volume: string;
  chapters: Array<{
    title: string;
    url: string;
    is_locked: boolean;
  }>;
}

export interface BookMetadata {
  rating?: string;
  rating_count?: string;
  views?: string;
  chapters?: string;
  tag?: string;
  status?: string;
}

export interface BookReview {
  user: string;
  rating?: number;
  content: string;
  figure?: string | null;
}
