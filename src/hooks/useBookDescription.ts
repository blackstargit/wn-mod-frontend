import { useState, useEffect, useRef, useCallback } from "react";
import { novelApi } from "@/api/client";
import type { NovelDescription } from "@/types";

interface UseBookDescriptionResult {
  bookData: NovelDescription | null;
  loading: boolean;
  scraping: boolean;
  scrapingChapters: boolean;
  chaptersScraped: boolean;
  error: string | null;
  handleScrapeChapters: () => Promise<void>;
  expandedVolumes: Record<number, boolean>;
  setExpandedVolumes: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
}

/**
 * Hook for managing book description data, scraping, and chapter status
 */
export function useBookDescription(
  bookId: string | undefined,
): UseBookDescriptionResult {
  const [bookData, setBookData] = useState<NovelDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapingChapters, setScrapingChapters] = useState(false);
  const [chaptersScraped, setChaptersScraped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedVolumes, setExpandedVolumes] = useState<
    Record<number, boolean>
  >({});
  const pollingIntervalRef = useRef<number | null>(null);

  // Poll for scraping status
  const pollScrapingStatus = useCallback(async () => {
    if (!bookId) return;

    try {
      const statusResponse = await novelApi.getDescriptionStatus(bookId);
      const status = statusResponse.data.status;

      if (status === "ready") {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setScraping(false);
        fetchDescription();
      } else if (status === "failed") {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setScraping(false);
        setError("Failed to scrape description");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error polling status:", err);
    }
  }, [bookId]);

  const fetchDescription = useCallback(async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await novelApi.getNovelDescription(bookId);

      if (
        response.data.status === "scraping_started" ||
        response.data.status === "scraping"
      ) {
        setScraping(true);
        setLoading(false);

        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(pollScrapingStatus, 3000);
        }
      } else if (response.data.status === "ready") {
        setBookData(response.data.data);

        // Initialize expanded volumes (open first one by default)
        const initialExpanded: Record<number, boolean> = {};
        if (response.data.data.toc) {
          response.data.data.toc.forEach((_: any, idx: number) => {
            initialExpanded[idx] = idx === 0;
          });
        }
        setExpandedVolumes(initialExpanded);

        setScraping(false);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error fetching description:", err);
      setError(err.response?.data?.detail || "Failed to load book description");
      setLoading(false);
      setScraping(false);
    }
  }, [bookId, pollScrapingStatus]);

  // Check if chapters have been scraped
  const checkChaptersScraped = useCallback(async () => {
    if (!bookId) return;
    try {
      const response = await novelApi.getChapters(bookId);
      setChaptersScraped(response.data && response.data.length > 0);
    } catch (err) {
      setChaptersScraped(false);
    }
  }, [bookId]);

  // Handle chapter scraping
  const handleScrapeChapters = useCallback(async () => {
    if (!bookId) return;
    setScrapingChapters(true);
    try {
      await novelApi.scrapeNovel(bookId);
      setTimeout(() => {
        checkChaptersScraped();
        setScrapingChapters(false);
      }, 3000);
    } catch (err) {
      console.error("Error scraping chapters:", err);
      setScrapingChapters(false);
    }
  }, [bookId, checkChaptersScraped]);

  useEffect(() => {
    fetchDescription();
    checkChaptersScraped();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [bookId, fetchDescription, checkChaptersScraped]);

  return {
    bookData,
    loading,
    scraping,
    scrapingChapters,
    chaptersScraped,
    error,
    handleScrapeChapters,
    expandedVolumes,
    setExpandedVolumes,
  };
}
