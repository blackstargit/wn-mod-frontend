import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Reader from "./components/Reader";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
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

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/read/:book_id" element={<Reader />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
