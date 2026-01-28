// Description page types
export interface NovelMetadata {
  rating?: string;
  rating_count?: string;
  views?: string;
  chapters?: string;
  status?: string;
  tag?: string;
}

export interface TocChapter {
  title: string;
  url: string;
  is_locked: boolean;
}

export interface TocVolume {
  volume: string;
  chapters: TocChapter[];
}

export interface Review {
  user: string;
  content: string;
  rating?: number;
  figure?: string | null;
}

export interface NovelDescription {
  book_id: string;
  title: string;
  metadata: NovelMetadata;
  synopsis: string;
  toc: TocVolume[];
  reviews: Review[];
}
