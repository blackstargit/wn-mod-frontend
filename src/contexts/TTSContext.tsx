import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLocalStorage } from "@/hooks";

interface TTSContextType {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  currentChapterIndex: number;
  totalParagraphs: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  playbackRate: number;
  speak: (
    paragraphs: string[],
    startIndex?: number,
    chapterIndex?: number,
  ) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextParagraph: () => void;
  previousParagraph: () => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setPlaybackRate: (rate: number) => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const useTTS = () => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error("useTTS must be used within a TTSProvider");
  }
  return context;
};

export const TTSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [totalParagraphs, setTotalParagraphs] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [savedVoiceName, setSavedVoiceName] = useLocalStorage<string>(
    "ttsVoiceName",
    "",
  );
  const [playbackRate, setPlaybackRateState] = useLocalStorage<number>(
    "ttsPlaybackRate",
    1.0,
  );

  const paragraphsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Filter for English voices only
        const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
        setAvailableVoices(englishVoices);

        // Try to restore saved voice or use default
        if (savedVoiceName) {
          const voice = voices.find((v) => v.name === savedVoiceName);
          if (voice) {
            setSelectedVoice(voice);
          } else {
            // Fallback to offline voice
            const offlineVoice = voices.find(
              (v) => !v.name.toLowerCase().includes("google"),
            );
            const englishOfflineVoice = voices.find(
              (v) =>
                v.lang.startsWith("en") &&
                !v.name.toLowerCase().includes("google"),
            );
            setSelectedVoice(englishOfflineVoice || offlineVoice || voices[0]);
          }
        } else {
          // Default to offline English voice
          const offlineVoice = voices.find(
            (v) => !v.name.toLowerCase().includes("google"),
          );
          const englishOfflineVoice = voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              !v.name.toLowerCase().includes("google"),
          );
          setSelectedVoice(englishOfflineVoice || offlineVoice || voices[0]);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Set voice and persist
  // Set voice and persist
  const setVoice = useCallback(
    (voice: SpeechSynthesisVoice) => {
      setSelectedVoice(voice);
      setSavedVoiceName(voice.name);
    },
    [setSavedVoiceName],
  );

  // Set playback rate and persist
  const setPlaybackRate = useCallback(
    (rate: number) => {
      setPlaybackRateState(rate);

      // Update current utterance if playing
      if (utteranceRef.current && isPlaying) {
        utteranceRef.current.rate = rate;
      }
    },
    [isPlaying, setPlaybackRateState],
  );

  // Speak entire chapter from index (ZERO audio lag)
  const speakFromIndex = useCallback(
    (startIndex: number) => {
      if (
        !selectedVoice ||
        startIndex < 0 ||
        startIndex >= paragraphsRef.current.length
      ) {
        console.error("[TTS] Cannot speak:", {
          selectedVoice,
          startIndex,
          length: paragraphsRef.current.length,
        });
        return;
      }

      // Set state immediately for instant UI feedback
      setCurrentParagraphIndex(startIndex);
      setIsPlaying(true);
      setIsPaused(false);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Wait for cancel to complete
      setTimeout(() => {
        // Detect if this is an online voice
        // Online voices have localService = false (they require internet)
        // Offline voices have localService = true (built into OS)
        const isOnlineVoice = selectedVoice.localService === false;

        // Online voices: use smaller chunks (5 paragraphs max)
        // Offline voices: use entire chapter for zero lag
        const maxParagraphs = isOnlineVoice ? 5 : paragraphsRef.current.length;
        const endIndex = Math.min(
          startIndex + maxParagraphs,
          paragraphsRef.current.length,
        );

        // Speak from startIndex to endIndex
        const textToSpeak = paragraphsRef.current
          .slice(startIndex, endIndex)
          .join("\n\n");

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.voice = selectedVoice;
        utterance.rate = playbackRate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        let hasStarted = false;

        utterance.onstart = () => {
          hasStarted = true;
        };

        utterance.onend = () => {
          // If there are more paragraphs, continue automatically
          if (endIndex < paragraphsRef.current.length) {
            speakFromIndex(endIndex);
          } else {
            // Finished all paragraphs
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentParagraphIndex(0);
          }
        };

        utterance.onerror = (event) => {
          console.error("TTS Error:", event.error, event);

          // Ignore "interrupted" errors - these happen when clicking Next/Prev
          if (event.error === "interrupted") {
            return;
          }

          // Only stop on real errors
          if (
            event.error === "network" ||
            event.error === "synthesis-failed" ||
            event.error === "audio-busy"
          ) {
            alert(
              `TTS Error: ${event.error}. ${event.error === "network" ? "Online voices require internet connection. Please select an offline voice." : "Please try again or select a different voice."}`,
            );
          }

          setIsPlaying(false);
          setIsPaused(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);

        // Detect if voice fails to start (common with online voices)
        setTimeout(() => {
          if (!hasStarted && window.speechSynthesis.speaking === false) {
            console.error("[TTS] Voice failed to start after 3 seconds");
            alert(
              "TTS failed to start. This voice may require internet connection or may not be available. Please try an offline voice.",
            );
            setIsPlaying(false);
            setIsPaused(false);
          }
        }, 3000);
      }, 100);
    },
    [selectedVoice, playbackRate],
  );

  // Start speaking from a specific index
  const speak = useCallback(
    (
      paragraphs: string[],
      startIndex: number = 0,
      chapterIndex: number = -1,
    ) => {
      paragraphsRef.current = paragraphs;
      setTotalParagraphs(paragraphs.length);
      setCurrentChapterIndex(chapterIndex);
      speakFromIndex(startIndex);
    },
    [speakFromIndex],
  );

  // Pause
  const pause = useCallback(() => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  // Resume
  const resume = useCallback(() => {
    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);

  // Stop
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraphIndex(0);
    setCurrentChapterIndex(-1);
    utteranceRef.current = null;
  }, []);

  // Next paragraph - restart from next paragraph
  const nextParagraph = useCallback(() => {
    if (currentParagraphIndex < paragraphsRef.current.length - 1) {
      speakFromIndex(currentParagraphIndex + 1);
    }
  }, [currentParagraphIndex, speakFromIndex]);

  // Previous paragraph - restart from previous paragraph
  const previousParagraph = useCallback(() => {
    if (currentParagraphIndex > 0) {
      speakFromIndex(currentParagraphIndex - 1);
    }
  }, [currentParagraphIndex, speakFromIndex]);

  const value: TTSContextType = {
    isPlaying,
    isPaused,
    currentParagraphIndex,
    totalParagraphs,
    availableVoices,
    selectedVoice,
    playbackRate,
    speak,
    pause,
    resume,
    stop,
    nextParagraph,
    previousParagraph,
    setVoice,
    setPlaybackRate,
    currentChapterIndex,
  };

  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>;
};
