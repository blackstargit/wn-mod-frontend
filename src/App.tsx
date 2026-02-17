import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/LibraryPage";
import ReaderPage from "@/pages/ReaderPage";
import CategoriesPage from "@/pages/CategoriesPage";
import TagsPage from "@/pages/TagsPage";
import BookDescriptionPage from "@/pages/BookDescriptionPage";
import Navigation from "@/components/Navigation";
import {
  ReaderSettingsProvider,
  useReaderSettings,
} from "@/contexts/ReaderSettingsContext";
import { TTSProvider } from "@/contexts/TTSContext";

function AppContent() {
  const { screenBgColor, brightness } = useReaderSettings();

  return (
    <div
      className="min-h-screen text-white transition-all duration-300"
      style={{
        background: screenBgColor,
        filter: `brightness(${brightness}%)`,
      }}
    >
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/book/:book_id" element={<BookDescriptionPage />} />
          <Route path="/read/:book_id" element={<ReaderPage />} />
          <Route path="/read/:book_id/:chapter" element={<ReaderPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ReaderSettingsProvider>
      <TTSProvider>
        <Router>
          <AppContent />
        </Router>
      </TTSProvider>
    </ReaderSettingsProvider>
  );
}

export default App;
