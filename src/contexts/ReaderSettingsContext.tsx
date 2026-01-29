import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

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
  const [selectedFont, setSelectedFontState] = useState(FONT_LIBRARY[0]);
  const [favoriteFonts, setFavoriteFontsState] = useState<string[]>([]);
  const [fontSize, setFontSizeState] = useState(18);
  const [textColor, setTextColorState] = useState("#e2e8f0");
  const [contentBgColor, setContentBgColorState] = useState("#1e293b");
  const [screenBgColor, setScreenBgColorState] = useState("#0f172a");
  const [favoriteColors, setFavoriteColorsState] = useState<{
    text: string[];
    bg: string[];
    screen: string[];
  }>({
    text: [],
    bg: [],
    screen: [],
  });
  const [isFullscreen, setIsFullscreenState] = useState(false);
  const [brightness, setBrightnessState] = useState(100);
  const [sidebarOpen, setSidebarOpenState] = useState(false);
  const [isDetached, setIsDetachedState] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedFont = localStorage.getItem("reader-font");
    const savedFavorites = localStorage.getItem("reader-favorite-fonts");
    const savedFontSize = localStorage.getItem("reader-font-size");
    const savedTextColor = localStorage.getItem("reader-text-color");
    const savedContentBg = localStorage.getItem("reader-content-bg");
    const savedScreenBg = localStorage.getItem("reader-screen-bg");
    const savedFullscreen = localStorage.getItem("reader-fullscreen");
    const savedBrightness = localStorage.getItem("reader-brightness");
    const savedDetached = localStorage.getItem("reader-sidebar-detached");
    const savedFavoriteColors = localStorage.getItem("reader-favorite-colors");

    if (savedFont) {
      const font = FONT_LIBRARY.find((f) => f.name === savedFont);
      if (font) setSelectedFontState(font);
    }
    if (savedFavorites) setFavoriteFontsState(JSON.parse(savedFavorites));
    if (savedFontSize) setFontSizeState(parseInt(savedFontSize));
    if (savedTextColor) setTextColorState(savedTextColor);
    if (savedContentBg) setContentBgColorState(savedContentBg);
    if (savedScreenBg) setScreenBgColorState(savedScreenBg);
    if (savedFullscreen) setIsFullscreenState(savedFullscreen === "true");
    if (savedBrightness) setBrightnessState(parseInt(savedBrightness));
    if (savedDetached) setIsDetachedState(savedDetached === "true");
    if (savedFavoriteColors)
      setFavoriteColorsState(JSON.parse(savedFavoriteColors));
  }, []);

  const setSelectedFont = (font: (typeof FONT_LIBRARY)[0]) => {
    setSelectedFontState(font);
    localStorage.setItem("reader-font", font.name);
  };

  const setFavoriteFonts = (fonts: string[]) => {
    setFavoriteFontsState(fonts);
    localStorage.setItem("reader-favorite-fonts", JSON.stringify(fonts));
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem("reader-font-size", size.toString());
  };

  const setTextColor = (color: string) => {
    setTextColorState(color);
    localStorage.setItem("reader-text-color", color);
  };

  const setContentBgColor = (color: string) => {
    setContentBgColorState(color);
    localStorage.setItem("reader-content-bg", color);
  };

  const setScreenBgColor = (color: string) => {
    setScreenBgColorState(color);
    localStorage.setItem("reader-screen-bg", color);
  };

  const setFavoriteColors = (colors: {
    text: string[];
    bg: string[];
    screen: string[];
  }) => {
    setFavoriteColorsState(colors);
    localStorage.setItem("reader-favorite-colors", JSON.stringify(colors));
  };

  const setIsFullscreen = (value: boolean) => {
    setIsFullscreenState(value);
    localStorage.setItem("reader-fullscreen", value.toString());
  };

  const setBrightness = (value: number) => {
    setBrightnessState(value);
    localStorage.setItem("reader-brightness", value.toString());
  };

  const setSidebarOpen = (value: boolean) => {
    setSidebarOpenState(value);
  };

  const setIsDetached = (value: boolean) => {
    setIsDetachedState(value);
    localStorage.setItem("reader-sidebar-detached", value.toString());
  };

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
  };

  return (
    <ReaderSettingsContext.Provider value={value}>
      {children}
    </ReaderSettingsContext.Provider>
  );
};
