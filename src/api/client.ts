import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const libraryApi = {
  importLibrary: (htmlContent: string) =>
    api.post("/library/import", { html_content: htmlContent }),
  getNovels: () => api.get("/novels"),
};

export const novelApi = {
  getNovel: (id: number) => api.get(`/novels/${id}`),
  getChapters: (id: number) => api.get(`/novels/${id}/chapters`),
  scrapeNovel: (id: number) => api.post(`/scraper/${id}/scrape`),
};

export default api;
