import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLocalStorage } from "@/hooks";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { Capacitor } from "@capacitor/core";
import { MediaSession } from "@capgo/capacitor-media-session";

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
    novelTitle?: string,
    chapterTitle?: string,
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
  const [novelTitle, setNovelTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
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
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  const isCapacitor = Capacitor.isNativePlatform();

  // Helper to trigger media session on Android/Web
  const playSilentAudio = useCallback(() => {
    // Request notification permission for Android 13+ (required for media controls)
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (!silentAudioRef.current) {
      // 1 second silent MP3 (more robust than short WAV)
      const audio = new Audio(
        "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZTU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA//////////8AAAAAY29uZW50AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MUZAAAAAG8AAAANIAAAA0gAAANIAAAAbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8xRkSAAAA0gAAANIAAAAbwAAAG8AAANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
      );
      audio.loop = true;
      audio.volume = 0.1; // Slightly more volume (still silent MP3 but OS might notice it more)
      silentAudioRef.current = audio;
    }
    silentAudioRef.current
      .play()
      .catch((e) => console.error("Silent audio play failed:", e));
  }, []);

  const stopSilentAudio = useCallback(() => {
    if (silentAudioRef.current) {
      silentAudioRef.current.pause();
      silentAudioRef.current.currentTime = 0;
    }
  }, []);

  // Update Media State & Metadata
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    // Update Playback State
    navigator.mediaSession.playbackState = isPlaying
      ? isPaused
        ? "paused"
        : "playing"
      : "none";

    // Update Metadata if playing
    if (isPlaying) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title:
          currentChapterIndex >= 0
            ? `Chapter ${currentChapterIndex + 1}`
            : "Novel Reader",
        artist: "AI Narrator",
        album: "Novel App",
        artwork: [
          {
            src: "https://cdn-icons-png.flaticon.com/512/3502/3502601.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    }
  }, [isPlaying, isPaused, currentChapterIndex]);

  // Mapping Web voices to UnifiedVoice
  const mapWebVoice = useCallback(
    (v: SpeechSynthesisVoice): UnifiedVoice => ({
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      voiceURI: v.voiceURI,
    }),
    [],
  );

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
            index: index, // Crucial for Capacitor v8
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
            const fallback =
              voices.find(
                (v) =>
                  v.lang.startsWith("en") &&
                  !v.name.toLowerCase().includes("google"),
              ) ||
              voices.find((v) => !v.name.toLowerCase().includes("google")) ||
              voices[0];
            setSelectedVoice(fallback);
          }
        } else {
          const fallback =
            voices.find(
              (v) =>
                v.lang.startsWith("en") &&
                !v.name.toLowerCase().includes("google"),
            ) ||
            voices.find((v) => !v.name.toLowerCase().includes("google")) ||
            voices[0];
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

      // Trigger media session notification on Android
      playSilentAudio();

      if (isCapacitor) {
        await TextToSpeech.stop();
      } else {
        window.speechSynthesis.cancel();
      }

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      const waitTime = isMobile ? 300 : 100;

      setTimeout(async () => {
        // Reduced chunk size and added character limit to avoid Android "Failed to read text" errors
        const maxParagraphs = 5;
        const maxCharacters = 3000; // Android's actual limit is around 4000, we stay safe

        let endIndex = startIndex;
        let currentChars = 0;

        for (
          let i = startIndex;
          i <
          Math.min(startIndex + maxParagraphs, paragraphsRef.current.length);
          i++
        ) {
          const p = paragraphsRef.current[i];
          if (currentChars + p.length + 2 > maxCharacters && i > startIndex) {
            break;
          }
          currentChars += p.length + 2;
          endIndex = i + 1;
        }

        const textToSpeak = paragraphsRef.current
          .slice(startIndex, endIndex)
          .join("\n\n");

        if (isCapacitor) {
          try {
            console.log(
              `Speaking paragraphs ${startIndex} to ${endIndex - 1} (${textToSpeak.length} chars)`,
            );
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
            // On failure, try to skip this chunk and continue to next one instead of just stopping
            if (endIndex < paragraphsRef.current.length) {
              console.warn("Retrying with next paragraph due to error...");
              speakFromIndex(startIndex + 1); // better than endIndex
            } else {
              setIsPlaying(false);
            }
          }
        } else {
          // Web Fallback
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          const webVoices = window.speechSynthesis.getVoices();
          const webVoice = webVoices.find((v) => v.name === selectedVoice.name);
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
            if (e.error === "interrupted" || e.error === "canceled") {
              return;
            }
            console.error("Web TTS Error:", e);
            setIsPlaying(false);
          };
          window.speechSynthesis.speak(utterance);
        }
      }, waitTime);
    },
    [selectedVoice, playbackRate, isCapacitor, playSilentAudio],
  );

  const speak = useCallback(
    (
      paragraphs: string[],
      startIndex: number = 0,
      chapterIndex: number = -1,
      onComplete?: () => void,
      nTitle?: string,
      cTitle?: string,
    ) => {
      paragraphsRef.current = paragraphs;
      setTotalParagraphs(paragraphs.length);
      setCurrentChapterIndex(chapterIndex);
      if (nTitle) setNovelTitle(nTitle);
      if (cTitle) setChapterTitle(cTitle);
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
      stopSilentAudio();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused, isCapacitor, stopSilentAudio]);

  const resume = useCallback(() => {
    if (isPlaying && isPaused) {
      if (isCapacitor) {
        speakFromIndex(currentParagraphIndex);
      } else {
        window.speechSynthesis.resume();
      }
      playSilentAudio();
      setIsPaused(false);
    }
  }, [
    isPlaying,
    isPaused,
    isCapacitor,
    speakFromIndex,
    currentParagraphIndex,
    playSilentAudio,
  ]);

  const stop = useCallback(async () => {
    if (isCapacitor) {
      await TextToSpeech.stop();
    } else {
      window.speechSynthesis.cancel();
    }
    stopSilentAudio();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraphIndex(0);
    setCurrentChapterIndex(-1);
  }, [isCapacitor, stopSilentAudio]);

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

  // Handlers refs to avoid stale closures in MediaSession handlers
  const handlersRef = useRef({
    resume,
    pause,
    stop,
    nextParagraph,
    previousParagraph,
  });

  useEffect(() => {
    handlersRef.current = {
      resume,
      pause,
      stop,
      nextParagraph,
      previousParagraph,
    };
  }, [resume, pause, stop, nextParagraph, previousParagraph]);

  // Combined Media Session Control Setup & Metadata Update
  useEffect(() => {
    // 1. Web Standard (Works for browsers and polyfilled by plugin)
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying
        ? isPaused
          ? "paused"
          : "playing"
        : "none";

      navigator.mediaSession.setActionHandler("play", () =>
        handlersRef.current.resume(),
      );
      navigator.mediaSession.setActionHandler("pause", () =>
        handlersRef.current.pause(),
      );
      navigator.mediaSession.setActionHandler("stop", () =>
        handlersRef.current.stop(),
      );
      navigator.mediaSession.setActionHandler("nexttrack", () =>
        handlersRef.current.nextParagraph(),
      );
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        handlersRef.current.previousParagraph(),
      );

      if (isPlaying) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title:
            chapterTitle ||
            (currentChapterIndex >= 0
              ? `Chapter ${currentChapterIndex + 1}`
              : "Novel Reader"),
          artist: novelTitle || "AI Narrator",
          album: "Novel App",
          artwork: [
            {
              src: "https://cdn-icons-png.flaticon.com/512/3502/3502601.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        });
      }
    }

    // 2. Native Plugin Force (Crucial for Android 14/15/16 background reliability)
    if (isCapacitor) {
      const syncNativeMedia = async () => {
        try {
          // Set Metadata
          await MediaSession.setMetadata({
            title:
              chapterTitle ||
              (currentChapterIndex >= 0
                ? `Chapter ${currentChapterIndex + 1}`
                : "Novel Reader"),
            artist: novelTitle || "AI Narrator",
            album: "Novel App",
            artwork: [
              {
                src: "https://cdn-icons-png.flaticon.com/512/3502/3502601.png",
                sizes: "512x512",
                type: "image/png",
              },
            ],
          });

          // Set Playback State
          await MediaSession.setPlaybackState({
            playbackState: isPlaying
              ? isPaused
                ? "paused"
                : "playing"
              : "none",
          });

          // Set Handlers
          await MediaSession.setActionHandler({ action: "play" }, () =>
            handlersRef.current.resume(),
          );
          await MediaSession.setActionHandler({ action: "pause" }, () =>
            handlersRef.current.pause(),
          );
          await MediaSession.setActionHandler({ action: "stop" }, () =>
            handlersRef.current.stop(),
          );
          await MediaSession.setActionHandler({ action: "nexttrack" }, () =>
            handlersRef.current.nextParagraph(),
          );
          await MediaSession.setActionHandler({ action: "previoustrack" }, () =>
            handlersRef.current.previousParagraph(),
          );
        } catch (e) {
          console.error("Native MediaSession Sync Error:", e);
        }
      };
      syncNativeMedia();
    }
  }, [
    isPlaying,
    isPaused,
    currentChapterIndex,
    isCapacitor,
    novelTitle,
    chapterTitle,
  ]);

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
