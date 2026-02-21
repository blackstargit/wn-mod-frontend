import { useEffect } from "react";
import { useTTS } from "@/contexts/TTSContext";

/**
 * Hook that auto-scrolls to the currently spoken paragraph during TTS playback.
 * Uses [data-paragraph-index="N"] attributes set by ChapterContent.
 */
export function useTTSAutoScroll() {
  const tts = useTTS();

  useEffect(() => {
    if (tts.isPlaying && tts.currentParagraphIndex >= 0) {
      let el: Element | null = null;

      // 1. Try specific ID (preferred for multi-chapter views)
      if (tts.currentChapterIndex !== -1) {
        el = document.getElementById(
          `chapter-${tts.currentChapterIndex}-para-${tts.currentParagraphIndex}`,
        );
      }

      // 2. Fallback to generic attribute (legacy/single view)
      if (!el) {
        el = document.querySelector(
          `[data-paragraph-index="${tts.currentParagraphIndex}"]`,
        );
      }

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [tts.currentParagraphIndex, tts.currentChapterIndex, tts.isPlaying]);
}
