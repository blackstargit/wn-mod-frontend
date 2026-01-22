import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReaderPage from "./pages/ReaderPage";
import CategoriesPage from "./pages/CategoriesPage";

// Navigation component to handle active states
const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Don't show nav on reader page
  if (location.pathname.startsWith("/read/")) return null;

  return (
    <nav className="mb-8 flex gap-4">
      <Link
        to="/"
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          isActive("/")
            ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
            : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
      >
        📚 Library
      </Link>
      <Link
        to="/categories"
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          isActive("/categories")
            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
            : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
      >
        🏷️ Categories
      </Link>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/read/:book_id" element={<ReaderPage />} />
            <Route path="/read/:book_id/:chapter" element={<ReaderPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
