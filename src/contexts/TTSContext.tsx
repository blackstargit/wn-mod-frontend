import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLocalStorage } from "@/hooks";
import {
  TextToSpeech,
} from "@capacitor-community/text-to-speech";
import { Capacitor } from "@capacitor/core";

// Define a unified voice type to bridge Web and Capacitor
export interface UnifiedVoice {
  name: string;
  lang: string;
  localService: boolean;
  voiceURI: string;
  index?: number; // Added for Capacitor
}

interface TTSContextType {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  currentChapterIndex: number;
  totalParagraphs: number;
  availableVoices: UnifiedVoice[];
  selectedVoice: UnifiedVoice | null;
  playbackRate: number;
  speak: (
    paragraphs: string[],
    startIndex?: number,
    chapterIndex?: number,
    onComplete?: () => void,
  ) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextParagraph: () => void;
  previousParagraph: () => void;
  setVoice: (voice: UnifiedVoice) => void;
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
  const [availableVoices, setAvailableVoices] = useState<UnifiedVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<UnifiedVoice | null>(null);
  const [savedVoiceName, setSavedVoiceName] = useLocalStorage<string>(
    "ttsVoiceName",
    "",
  );
  const [playbackRate, setPlaybackRateState] = useLocalStorage<number>(
    "ttsPlaybackRate",
    1.0,
  );

  const paragraphsRef = useRef<string[]>([]);
  const isCapacitor = Capacitor.isNativePlatform();

  // Media Session Control Setup (Standard Web API - works on Android Chrome/Capacitor)
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const setupMediaControls = () => {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Novel Reader",
        artist: "AI Narrator",
        album: "Novel App",
        artwork: [],
      });

      navigator.mediaSession.setActionHandler("play", () => resume());
      navigator.mediaSession.setActionHandler("pause", () => pause());
      navigator.mediaSession.setActionHandler("stop", () => stop());
      navigator.mediaSession.setActionHandler("nexttrack", () => nextParagraph());
      navigator.mediaSession.setActionHandler("previoustrack", () => previousParagraph());
    };

    setupMediaControls();
  }, []); // Run once

  // Update Media State
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? (isPaused ? "paused" : "playing") : "none";
  }, [isPlaying, isPaused]);

  // Mapping Web voices to UnifiedVoice
  const mapWebVoice = useCallback((v: SpeechSynthesisVoice): UnifiedVoice => ({
    name: v.name,
    lang: v.lang,
    localService: v.localService,
    voiceURI: v.voiceURI
  }), []);

  // Load available voices
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const loadVoices = async () => {
      let voices: UnifiedVoice[] = [];

      if (isCapacitor) {
        try {
          const capVoices = await TextToSpeech.getSupportedVoices();
          voices = capVoices.voices.map((v, index) => ({
            name: v.name,
            lang: v.lang,
            localService: true,
            voiceURI: v.name,
            index: index // Crucial for Capacitor v8
          }));
        } catch (e) {
          console.error("Capacitor voices load error:", e);
        }
      } else {
        const webVoices = window.speechSynthesis.getVoices();
        voices = webVoices.map(mapWebVoice);
      }

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
            const fallback = voices.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("google")) 
                            || voices.find(v => !v.name.toLowerCase().includes("google")) 
                            || voices[0];
            setSelectedVoice(fallback);
          }
        } else {
          const fallback = voices.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("google")) 
                          || voices.find(v => !v.name.toLowerCase().includes("google")) 
                          || voices[0];
          setSelectedVoice(fallback);
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(loadVoices, 500);
      }
    };

    loadVoices();
    if (!isCapacitor) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (!isCapacitor) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [savedVoiceName, isCapacitor, mapWebVoice]);

  const setVoice = useCallback(
    (voice: UnifiedVoice) => {
      setSelectedVoice(voice);
      setSavedVoiceName(voice.name);
    },
    [setSavedVoiceName],
  );

  const setPlaybackRate = useCallback(
    (rate: number) => {
      setPlaybackRateState(rate);
    },
    [setPlaybackRateState],
  );

  const onCompleteRef = useRef<(() => void) | undefined>(undefined);

  const speakFromIndex = useCallback(
    async (startIndex: number) => {
      if (
        !selectedVoice ||
        startIndex < 0 ||
        startIndex >= paragraphsRef.current.length
      ) {
        return;
      }

      setCurrentParagraphIndex(startIndex);
      setIsPlaying(true);
      setIsPaused(false);

      if (isCapacitor) {
        await TextToSpeech.stop();
      } else {
        window.speechSynthesis.cancel();
      }

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const waitTime = isMobile ? 300 : 100;

      setTimeout(async () => {
        // Restore 10-paragraph chunking as requested to eliminate gaps
        const maxParagraphs = 10;
        const endIndex = Math.min(
          startIndex + maxParagraphs,
          paragraphsRef.current.length,
        );

        const textToSpeak = paragraphsRef.current
          .slice(startIndex, endIndex)
          .join("\n\n");

        if (isCapacitor) {
          try {
            await TextToSpeech.speak({
              text: textToSpeak,
              lang: selectedVoice.lang,
              rate: playbackRate,
              pitch: 1.0,
              volume: 1.0,
              voice: selectedVoice.index ?? 0,
            });
            
            // Continuous play
            if (endIndex < paragraphsRef.current.length) {
              speakFromIndex(endIndex);
            } else {
              setIsPlaying(false);
              setIsPaused(false);
              setCurrentParagraphIndex(0);
              if (onCompleteRef.current) onCompleteRef.current();
            }
          } catch (e) {
            console.error("Capacitor TTS Speak Error:", e);
            setIsPlaying(false);
          }
        } else {
          // Web Fallback
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          const webVoices = window.speechSynthesis.getVoices();
          const webVoice = webVoices.find(v => v.name === selectedVoice.name);
          if (webVoice) utterance.voice = webVoice;
          
          utterance.rate = playbackRate;
          utterance.onend = () => {
            if (endIndex < paragraphsRef.current.length) {
              speakFromIndex(endIndex);
            } else {
              setIsPlaying(false);
              setIsPaused(false);
              setCurrentParagraphIndex(0);
              if (onCompleteRef.current) onCompleteRef.current();
            }
          };
          utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            // Ignore interrupted/canceled errors which happen when skipping paragraphs
            if (e.error === 'interrupted' || e.error === 'canceled') {
              return;
            }
            console.error("Web TTS Error:", e);
            setIsPlaying(false);
          };
          window.speechSynthesis.speak(utterance);
        }
      }, waitTime);
    },
    [selectedVoice, playbackRate, isCapacitor],
  );

  const speak = useCallback(
    (
      paragraphs: string[],
      startIndex: number = 0,
      chapterIndex: number = -1,
      onComplete?: () => void,
    ) => {
      paragraphsRef.current = paragraphs;
      setTotalParagraphs(paragraphs.length);
      setCurrentChapterIndex(chapterIndex);
      onCompleteRef.current = onComplete;
      speakFromIndex(startIndex);
    },
    [speakFromIndex],
  );

  const pause = useCallback(async () => {
    if (isPlaying && !isPaused) {
      if (isCapacitor) {
        await TextToSpeech.stop(); // Stop is effectively pause if we track index
      } else {
        window.speechSynthesis.pause();
      }
      setIsPaused(true);
    }
  }, [isPlaying, isPaused, isCapacitor]);

  const resume = useCallback(() => {
    if (isPlaying && isPaused) {
      if (isCapacitor) {
        speakFromIndex(currentParagraphIndex);
      } else {
        window.speechSynthesis.resume();
      }
      setIsPaused(false);
    }
  }, [isPlaying, isPaused, isCapacitor, speakFromIndex, currentParagraphIndex]);

  const stop = useCallback(async () => {
    if (isCapacitor) {
      await TextToSpeech.stop();
    } else {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraphIndex(0);
    setCurrentChapterIndex(-1);
  }, [isCapacitor]);

  const nextParagraph = useCallback(() => {
    if (currentParagraphIndex < paragraphsRef.current.length - 1) {
      speakFromIndex(currentParagraphIndex + 1);
    }
  }, [currentParagraphIndex, speakFromIndex]);

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
