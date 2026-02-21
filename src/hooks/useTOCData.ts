import { useState, useEffect } from "react";
import { novelApi } from "@/api/client";
import type { NovelDescription } from "@/types";

/**
 * Hook for fetching Table of Contents data
 */
export function useTOCData(bookId: string) {
  const [tocData, setTocData] = useState<NovelDescription | null>(null);
  const [tocLoading, setTocLoading] = useState(false);
  const [expandedVolumes, setExpandedVolumes] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const fetchTOC = async () => {
      if (!bookId) return;

      setTocLoading(true);
      try {
        const response = await novelApi.getNovelDescription(bookId);

        if (
          response.data &&
          response.data.status === "ready" &&
          response.data.data
        ) {
          setTocData(response.data.data);

          // Initialize expanded volumes (first one open by default)
          const initialExpanded: Record<number, boolean> = {};
          if (response.data.data.toc) {
            response.data.data.toc.forEach((_: any, idx: number) => {
              initialExpanded[idx] = idx === 0;
            });
          }
          setExpandedVolumes(initialExpanded);
        } else {
          console.log("TOC data not ready or invalid format:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch TOC:", error);
      } finally {
        setTocLoading(false);
      }
    };

    fetchTOC();
  }, [bookId]);

  return { tocData, tocLoading, expandedVolumes, setExpandedVolumes };
}
