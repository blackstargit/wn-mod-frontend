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
  getNovel: (id: number) => apiClient.get(`/novels/${id}`),
  getChapters: (id: number) => apiClient.get(`/novels/${id}/chapters`),
  scrapeNovel: (id: number) => apiClient.post(`/scraper/${id}/scrape`),
  updateMetadata: (
    id: number,
    metadata: { last_read_chapter?: number; last_accessed_at?: string },
  ) => apiClient.patch(`/novels/${id}/metadata`, metadata),
};
