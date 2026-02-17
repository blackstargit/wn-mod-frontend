import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

interface TTSContextType {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  totalParagraphs: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  playbackRate: number;
  speak: (paragraphs: string[], startIndex?: number) => void;
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
  const [totalParagraphs, setTotalParagraphs] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(() => {
    const saved = localStorage.getItem("ttsPlaybackRate");
    return saved ? parseFloat(saved) : 1.0;
  });

  const paragraphsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);

        // Try to restore saved voice or use default
        const savedVoiceName = localStorage.getItem("ttsVoiceName");
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
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    localStorage.setItem("ttsVoiceName", voice.name);
  }, []);

  // Set playback rate and persist
  const setPlaybackRate = useCallback(
    (rate: number) => {
      setPlaybackRateState(rate);
      localStorage.setItem("ttsPlaybackRate", rate.toString());

      // Update current utterance if playing
      if (utteranceRef.current && isPlaying) {
        utteranceRef.current.rate = rate;
      }
    },
    [isPlaying],
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
      console.log("[TTS] Canceling previous speech...");
      window.speechSynthesis.cancel();

      // Wait for cancel to complete
      setTimeout(() => {
        // Detect if this is an online voice (Google voices have stricter limits)
        const isOnlineVoice = selectedVoice.name
          .toLowerCase()
          .includes("google");

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

        console.log(
          `[TTS] Speaking ${isOnlineVoice ? "chunk" : "entire chapter"} from paragraph ${startIndex + 1} to ${endIndex}, length: ${textToSpeak.length} chars`,
        );
        console.log(
          "[TTS] Selected voice:",
          selectedVoice.name,
          selectedVoice.lang,
          isOnlineVoice ? "(online)" : "(offline)",
        );
        console.log("[TTS] Playback rate:", playbackRate);

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.voice = selectedVoice;
        utterance.rate = playbackRate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        let hasStarted = false;

        utterance.onstart = () => {
          hasStarted = true;
          console.log(`[TTS] ✅ Started continuous speech`);
        };

        utterance.onend = () => {
          console.log(`[TTS] Finished speech chunk`);

          // If there are more paragraphs, continue automatically
          if (endIndex < paragraphsRef.current.length) {
            console.log(`[TTS] Auto-continuing to paragraph ${endIndex + 1}`);
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
            console.log("[TTS] Interrupted (expected when navigating)");
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

        console.log("[TTS] Calling speechSynthesis.speak()...");
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
    (paragraphs: string[], startIndex: number = 0) => {
      paragraphsRef.current = paragraphs;
      setTotalParagraphs(paragraphs.length);
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
  };

  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>;
};
