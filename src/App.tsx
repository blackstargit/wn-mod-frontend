import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Reader from "./components/Reader";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/read/:book_id" element={<Reader />} />
            <Route path="/read/:book_id/:chapter" element={<Reader />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
