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
  updateMetadata: (
    book_id: string,
    metadata: {
      last_read_chapter?: number;
      last_accessed_at?: string;
      category_id?: number;
    },
  ) => apiClient.patch(`/novels/${book_id}/metadata`, metadata),
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
