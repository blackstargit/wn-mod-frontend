export interface Novel {
  id: number;
  title: string;
  author: string;
  cover_url: string;
  webnovel_id: string;
  total_chapters: number;
}

export interface Chapter {
  id: number;
  novel_id: number;
  chapter_index: number;
  title: string;
  content: string;
}
