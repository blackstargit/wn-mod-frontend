import { useCallback } from "react";
import type { ParsedChapterTitle } from "@/types/bookDescription";

/**
 * Hook for parsing chapter titles from Webnovel format
 */
export function useChapterParsing() {
  const parseChapterTitle = useCallback(
    (rawTitle: string): ParsedChapterTitle => {
      // Expected format matches: "1 Character sheet 1 years ago"
      // Regex: Start with number (index), End with date (time ago)
      const indexMatch = rawTitle.match(/^(\d+)\s+/);
      if (!indexMatch) return { index: "", title: rawTitle, date: "" };

      const index = indexMatch[1];
      let rest = rawTitle.substring(indexMatch[0].length);

      // Match date at the end (e.g., "1 years ago", "2 months ago", "just now")
      const dateMatch = rest.match(
        /\s+(\d+\s+[a-zA-Z]+\s+ago|just now|yesterday|today)$/i,
      );

      let date = "";
      let title = rest;

      if (dateMatch) {
        date = dateMatch[1];
        title = rest.substring(0, rest.length - dateMatch[0].length).trim();
      }

      return { index, title, date };
    },
    [],
  );

  const parseWebnovelEmojis = useCallback((text: string): string => {
    if (!text) return "";

    const emojiMap: Record<string, string> = {
      smile: "🙂",
      joy: "😂",
      laugh: "😆",
      funny: "🤣",
      neutral: "😐",
      exp: "😑",
      disgusted: "🤮",
      angry: "😡",
      sad: "😢",
      cry: "😭",
      shocked: "😱",
      surprised: "😲",
      cool: "😎",
      proud: "😤",
      thinking: "🤔",
      love: "😍",
      kiss: "😘",
      sleepy: "😪",
      roll: "🙄",
      speechless: "😶",
      drool: "🤤",
      terrified: "😨",
      doubt: "🤨",
    };

    return text.replace(/\[img=([a-zA-Z0-9]+)\]/g, (match, code) => {
      return emojiMap[code.toLowerCase()] || match;
    });
  }, []);

  return { parseChapterTitle, parseWebnovelEmojis };
}
