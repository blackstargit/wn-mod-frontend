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
      const el = document.querySelector(
        `[data-paragraph-index="${tts.currentParagraphIndex}"]`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [tts.currentParagraphIndex, tts.isPlaying]);
}
