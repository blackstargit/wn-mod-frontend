import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface TTSContextType {
  // State
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  selectedVoice: SpeechSynthesisVoice | null;
  playbackRate: number;
  availableVoices: SpeechSynthesisVoice[];
  totalParagraphs: number;

  // Methods
  loadVoices: () => Promise<void>;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setPlaybackRate: (rate: number) => void;
  speak: (paragraphs: string[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextParagraph: () => void;
  previousParagraph: () => void;
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
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(() => {
    const saved = localStorage.getItem("ttsPlaybackRate");
    return saved ? parseFloat(saved) : 1.0;
  });
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [totalParagraphs, setTotalParagraphs] = useState(0);

  const paragraphsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  const loadVoices = useCallback(async () => {
    return new Promise<void>((resolve) => {
      const getVoices = () => {
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
              // Fallback to first English voice or first voice
              const englishVoice = voices.find((v) => v.lang.startsWith("en"));
              setSelectedVoice(englishVoice || voices[0]);
            }
          } else {
            // Default to first English voice or first voice
            const englishVoice = voices.find((v) => v.lang.startsWith("en"));
            setSelectedVoice(englishVoice || voices[0]);
          }

          resolve();
        }
      };

      getVoices();

      // Voices might load asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
      }
    });
  }, []);

  // Load voices on mount
  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

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

  // Speak a specific paragraph
  const speakParagraph = useCallback(
    (index: number) => {
      if (
        !selectedVoice ||
        index < 0 ||
        index >= paragraphsRef.current.length
      ) {
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const text = paragraphsRef.current[index];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = playbackRate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentParagraphIndex(index);
      };

      utterance.onend = () => {
        // Auto-advance to next paragraph
        if (index < paragraphsRef.current.length - 1) {
          speakParagraph(index + 1);
        } else {
          // Finished all paragraphs
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentParagraphIndex(0);
        }
      };

      utterance.onerror = (event) => {
        console.error("TTS Error:", event);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, playbackRate],
  );

  // Start speaking from a specific index
  const speak = useCallback(
    (paragraphs: string[], startIndex: number = 0) => {
      paragraphsRef.current = paragraphs;
      setTotalParagraphs(paragraphs.length);
      speakParagraph(startIndex);
    },
    [speakParagraph],
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

  // Next paragraph
  const nextParagraph = useCallback(() => {
    if (currentParagraphIndex < paragraphsRef.current.length - 1) {
      speakParagraph(currentParagraphIndex + 1);
    }
  }, [currentParagraphIndex, speakParagraph]);

  // Previous paragraph
  const previousParagraph = useCallback(() => {
    if (currentParagraphIndex > 0) {
      speakParagraph(currentParagraphIndex - 1);
    }
  }, [currentParagraphIndex, speakParagraph]);

  const value: TTSContextType = {
    isPlaying,
    isPaused,
    currentParagraphIndex,
    selectedVoice,
    playbackRate,
    availableVoices,
    totalParagraphs,
    loadVoices,
    setVoice,
    setPlaybackRate,
    speak,
    pause,
    resume,
    stop,
    nextParagraph,
    previousParagraph,
  };

  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>;
};
