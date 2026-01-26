export interface Tag {
  id: number;
  name: string;
  count: number;
}

export interface TagCreate {
  name: string;
}

export interface NovelTagsUpdate {
  tag_ids: number[];
}
