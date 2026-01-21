import { v4 as uuidv4 } from "uuid";
import type { Novel } from "../types";

const METADATA_KEY = "novel-metadata";

interface NovelMetadata {
  uuid: string;
  scraped: boolean;
  read: boolean;
  lastReadChapter: number;
  lastAccessedAt: string;
  addedAt: string;
}

export const getNovelMetadata = (novelId: number): NovelMetadata | null => {
  const data = localStorage.getItem(`${METADATA_KEY}-${novelId}`);
  return data ? JSON.parse(data) : null;
};

export const setNovelMetadata = (
  novelId: number,
  metadata: Partial<NovelMetadata>,
) => {
  const existing = getNovelMetadata(novelId) || {
    uuid: uuidv4(),
    scraped: false,
    read: false,
    lastReadChapter: 0,
    lastAccessedAt: new Date().toISOString(),
    addedAt: new Date().toISOString(),
  };

  const updated = { ...existing, ...metadata };
  localStorage.setItem(`${METADATA_KEY}-${novelId}`, JSON.stringify(updated));
  return updated;
};

export const enrichNovelWithMetadata = (novel: Novel): Novel => {
  const metadata = getNovelMetadata(novel.id);
  if (!metadata) {
    const newMetadata = setNovelMetadata(novel.id, {});
    return { ...novel, ...newMetadata };
  }
  return { ...novel, ...metadata };
};

export const markNovelAsAccessed = (novelId: number) => {
  setNovelMetadata(novelId, {
    read: true,
    lastAccessedAt: new Date().toISOString(),
  });
};

export const markNovelAsScraped = (novelId: number) => {
  setNovelMetadata(novelId, {
    scraped: true,
  });
};

export const getAllNovelsMetadata = (): Map<number, NovelMetadata> => {
  const metadata = new Map<number, NovelMetadata>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(METADATA_KEY)) {
      const id = parseInt(key.replace(`${METADATA_KEY}-`, ""));
      const data = localStorage.getItem(key);
      if (data) {
        metadata.set(id, JSON.parse(data));
      }
    }
  }
  return metadata;
};
