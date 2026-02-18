import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Library API
export const libraryApi = {
  getNovels: () => apiClient.get("/novels"),
  importLibrary: (htmlContent: string) =>
    apiClient.post("/library/import", { html_content: htmlContent }),
};

// Novel API
export const novelApi = {
  getNovel: (book_id: string) => apiClient.get(`/novels/${book_id}`),
  getChapters: (book_id: string) =>
    apiClient.get(`/novels/${book_id}/chapters`),
  scrapeNovel: (book_id: string) =>
    apiClient.post(`/scraper/${book_id}/scrape`),
  getNovelDescription: (book_id: string) =>
    apiClient.get(`/scraper/${book_id}/description`),
  getDescriptionStatus: (book_id: string) =>
    apiClient.get(`/scraper/${book_id}/description/status`),
  updateMetadata: (
    book_id: string,
    metadata: {
      progress?: number;
      last_read_chapter?: number | string;
      last_accessed_at?: string;
      category_id?: number | null;
    },
  ) => apiClient.patch(`/novels/${book_id}/metadata`, metadata),
  deleteNovel: (book_id: string) => apiClient.delete(`/novels/${book_id}`),
  bulkDeleteNovels: (book_ids: string[]) =>
    apiClient.post("/novels/bulk-delete", { book_ids }),
};

// Categories API
export const categoriesApi = {
  getCategories: () => apiClient.get("/categories"),
  createCategory: (name: string) => apiClient.post("/categories", { name }),
  updateCategory: (category_id: number, name: string) =>
    apiClient.patch(`/categories/${category_id}`, { name }),
  deleteCategory: (category_id: number) =>
    apiClient.delete(`/categories/${category_id}`),
};

// Tags API
export const tagsApi = {
  getTags: () => apiClient.get("/tags"),
  createTag: (name: string) => apiClient.post("/tags", { name }),
  updateTag: (tag_id: number, name: string) =>
    apiClient.patch(`/tags/${tag_id}`, { name }),
  deleteTag: (tag_id: number) => apiClient.delete(`/tags/${tag_id}`),

  // Novel-tag associations
  getNovelTags: (book_id: string) => apiClient.get(`/tags/novel/${book_id}`),
  updateNovelTags: (book_id: string, tag_ids: number[]) =>
    apiClient.put(`/tags/novel/${book_id}`, { tag_ids }),
  addTagToNovel: (book_id: string, tag_id: number) =>
    apiClient.post(`/tags/novel/${book_id}/add/${tag_id}`),
  removeTagFromNovel: (book_id: string, tag_id: number) =>
    apiClient.delete(`/tags/novel/${book_id}/remove/${tag_id}`),
};
