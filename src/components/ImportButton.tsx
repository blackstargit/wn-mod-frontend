import { Link } from "react-router-dom";

export default function ImportButton() {
  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          📚 Novel Reader
        </Link>
        <div className="flex gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-purple-500/50 transition-all text-sm font-medium"
          >
            Library
          </Link>
        </div>
      </div>
    </header>
  );
}
