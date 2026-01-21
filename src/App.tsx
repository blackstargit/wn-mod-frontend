import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LibraryImport from "./components/LibraryImport";
import NovelList from "./components/NovelList";
import Reader from "./components/Reader";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <Link to="/" className="text-3xl font-bold text-gray-900">
              Novel Reader Manager
            </Link>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="px-4 py-6 sm:px-0">
                    <LibraryImport />
                    <NovelList />
                  </div>
                }
              />
              <Route path="/read/:id" element={<Reader />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
