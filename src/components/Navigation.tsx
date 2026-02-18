import { Link, useLocation } from "react-router-dom";
import { Pin, PinOff, BookOpen, Book } from "lucide-react";
import { useLocalStorage } from "@/hooks";

// Navigation component to handle active states
const Navigation = () => {
  const location = useLocation();
  const [isFixed, setIsFixed] = useLocalStorage<boolean>("nav-fixed", true);

  const isActive = (path: string) => location.pathname === path;

  // Extract book_id from URL if present
  const bookIdMatch = location.pathname.match(/\/(read|book)\/([^/]+)/);
  const bookId = bookIdMatch ? bookIdMatch[2] : null;

  const toggleFixed = () => setIsFixed(!isFixed);

  // Don't show nav on reader page
  if (location.pathname.startsWith("/read/")) return null;

  return (
    <nav
      className={`mb-8 flex gap-4 items-center justify-between ${
        isFixed
          ? "sticky top-0 z-40 rounded-lg px-12 bg-slate-900/95 backdrop-blur-md py-4 -mx-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-slate-700/50"
          : ""
      } transition-all duration-300`}
    >
      <div className="flex gap-4">
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
        <Link
          to="/tags"
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive("/tags")
              ? "bg-green-600/20 text-green-400 border border-green-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          🔖 Tags
        </Link>

        {/* Context-aware link */}
        {bookId && (
          <>
            {location.pathname.startsWith("/book/") ? (
              <Link
                to={`/read/${bookId}`}
                className="px-4 py-2 rounded-lg font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2"
              >
                <Book className="w-4 h-4" />
                Read Novel
              </Link>
            ) : (
              <Link
                to={`/book/${bookId}`}
                className="px-4 py-2 rounded-lg font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Book Details
              </Link>
            )}
          </>
        )}
      </div>

      {/* Pin/Unpin Button */}
      <button
        onClick={toggleFixed}
        className={`p-2 rounded-lg transition-all ${
          isFixed
            ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
            : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
        title={isFixed ? "Unpin navigation" : "Pin navigation"}
      >
        {isFixed ? <Pin className="w-5 h-5" /> : <PinOff className="w-5 h-5" />}
      </button>
    </nav>
  );
};

export default Navigation;
