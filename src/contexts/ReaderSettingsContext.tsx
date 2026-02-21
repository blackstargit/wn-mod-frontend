import { useLocalStorage } from "@/hooks";
import React, { createContext, useContext, type ReactNode } from "react";

// Google Fonts library
export const FONT_LIBRARY = [
  { name: "Inter", family: "Inter, sans-serif" },
  { name: "Roboto", family: "Roboto, sans-serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif" },
  { name: "Lato", family: "Lato, sans-serif" },
  { name: "Montserrat", family: "Montserrat, sans-serif" },
  { name: "Poppins", family: "Poppins, sans-serif" },
  { name: "Merriweather", family: "Merriweather, serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Lora", family: "Lora, serif" },
  { name: "PT Serif", family: "'PT Serif', serif" },
  { name: "Crimson Text", family: "'Crimson Text', serif" },
  { name: "Source Sans Pro", family: "'Source Sans Pro', sans-serif" },
  { name: "Raleway", family: "Raleway, sans-serif" },
  { name: "Ubuntu", family: "Ubuntu, sans-serif" },
  { name: "Nunito", family: "Nunito, sans-serif" },
  { name: "Quicksand", family: "Quicksand, sans-serif" },
  { name: "Josefin Sans", family: "'Josefin Sans', sans-serif" },
  { name: "Bitter", family: "Bitter, serif" },
  { name: "Libre Baskerville", family: "'Libre Baskerville', serif" },
  { name: "EB Garamond", family: "'EB Garamond', serif" },
  { name: "Noto Serif", family: "'Noto Serif', serif" },
  { name: "Georgia", family: "Georgia, serif" },
  { name: "Times New Roman", family: "'Times New Roman', serif" },
  { name: "Arial", family: "Arial, sans-serif" },
];

interface ReaderSettings {
  // Font settings
  selectedFont: (typeof FONT_LIBRARY)[0];
  favoriteFonts: string[];
  fontSize: number;

  // Color settings
  textColor: string;
  contentBgColor: string;
  screenBgColor: string;
  favoriteColors: { text: string[]; bg: string[]; screen: string[] };

  // Display settings
  isFullscreen: boolean;
  brightness: number;

  // Sidebar settings
  sidebarOpen: boolean;
  isDetached: boolean;

  // View settings
  viewMode: "paged" | "scroll";
}

interface ReaderSettingsContextType extends ReaderSettings {
  setSelectedFont: (font: (typeof FONT_LIBRARY)[0]) => void;
  setFavoriteFonts: (fonts: string[]) => void;
  setFontSize: (size: number) => void;
  setTextColor: (color: string) => void;
  setContentBgColor: (color: string) => void;
  setScreenBgColor: (color: string) => void;
  setFavoriteColors: (colors: {
    text: string[];
    bg: string[];
    screen: string[];
  }) => void;
  setIsFullscreen: (value: boolean) => void;
  setBrightness: (value: number) => void;
  setSidebarOpen: (value: boolean) => void;
  setIsDetached: (value: boolean) => void;
  toggleFavorite: (fontName: string) => void;
  toggleFavoriteColor: (color: string, type: "text" | "bg" | "screen") => void;
  toggleFullscreen: () => void;
  toggleDetached: () => void;
  setViewMode: (mode: "paged" | "scroll") => void;
}

const ReaderSettingsContext = createContext<
  ReaderSettingsContextType | undefined
>(undefined);

export const useReaderSettings = () => {
  const context = useContext(ReaderSettingsContext);
  if (!context) {
    throw new Error(
      "useReaderSettings must be used within ReaderSettingsProvider",
    );
  }
  return context;
};

interface ReaderSettingsProviderProps {
  children: ReactNode;
}

export const ReaderSettingsProvider: React.FC<ReaderSettingsProviderProps> = ({
  children,
}) => {
  const [selectedFont, setSelectedFont] = useLocalStorage<
    (typeof FONT_LIBRARY)[0]
  >("reader-font-v2", FONT_LIBRARY[0]);
  const [favoriteFonts, setFavoriteFonts] = useLocalStorage<string[]>(
    "reader-favorite-fonts",
    [],
  );
  const [fontSize, setFontSize] = useLocalStorage<number>(
    "reader-font-size",
    18,
  );
  const [textColor, setTextColor] = useLocalStorage<string>(
    "reader-text-color",
    "#e2e8f0",
  );
  const [contentBgColor, setContentBgColor] = useLocalStorage<string>(
    "reader-content-bg",
    "#1e293b",
  );
  const [screenBgColor, setScreenBgColor] = useLocalStorage<string>(
    "reader-screen-bg",
    "#0f172a",
  );
  const [favoriteColors, setFavoriteColors] = useLocalStorage<{
    text: string[];
    bg: string[];
    screen: string[];
  }>("reader-favorite-colors", {
    text: [],
    bg: [],
    screen: [],
  });
  const [isFullscreen, setIsFullscreen] = useLocalStorage<boolean>(
    "reader-fullscreen",
    false,
  );
  const [brightness, setBrightness] = useLocalStorage<number>(
    "reader-brightness",
    100,
  );
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(
    "reader-sidebar-open",
    false,
  );
  const [isDetached, setIsDetached] = useLocalStorage<boolean>(
    "reader-sidebar-detached",
    false,
  );
  const [viewMode, setViewMode] = useLocalStorage<"paged" | "scroll">(
    "reader-view-mode",
    "paged",
  );

  const toggleFavorite = (fontName: string) => {
    const newFavorites = favoriteFonts.includes(fontName)
      ? favoriteFonts.filter((f) => f !== fontName)
      : [...favoriteFonts, fontName];
    setFavoriteFonts(newFavorites);
  };

  const toggleFavoriteColor = (
    color: string,
    type: "text" | "bg" | "screen",
  ) => {
    const newFavorites = { ...favoriteColors };
    if (newFavorites[type].includes(color)) {
      newFavorites[type] = newFavorites[type].filter((c) => c !== color);
    } else {
      newFavorites[type] = [...newFavorites[type], color];
    }
    setFavoriteColors(newFavorites);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleDetached = () => {
    setIsDetached(!isDetached);
  };

  const value: ReaderSettingsContextType = {
    selectedFont,
    favoriteFonts,
    fontSize,
    textColor,
    contentBgColor,
    screenBgColor,
    favoriteColors,
    isFullscreen,
    brightness,
    sidebarOpen,
    isDetached,
    setSelectedFont,
    setFavoriteFonts,
    setFontSize,
    setTextColor,
    setContentBgColor,
    setScreenBgColor,
    setFavoriteColors,
    setIsFullscreen,
    setBrightness,
    setSidebarOpen,
    setIsDetached,
    toggleFavorite,
    toggleFavoriteColor,
    toggleFullscreen,
    toggleDetached,
    viewMode,
    setViewMode,
  };

  return (
    <ReaderSettingsContext.Provider value={value}>
      {children}
    </ReaderSettingsContext.Provider>
  );
};
