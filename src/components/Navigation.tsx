import {
  Link,
  useLocation,
} from "react-router-dom";

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

export default Navigation