import React, { useState } from "react";
import { libraryApi } from "../api/client";

const LibraryImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setMessage(""); // Clear previous message
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      const text = await file.text();
      const response = await libraryApi.importLibrary(text);
      setMessage(`✓ ${response.data.message}`);

      // Reload page after 2 seconds to show new novels
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage("✗ Error importing library");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        📥 Import Library
      </h2>
      <p className="text-slate-400 text-sm mb-4">
        Upload your Webnovel library HTML file to add novels to your collection
      </p>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="file"
            accept=".html"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-gradient-to-r file:from-purple-500 file:to-purple-600
              file:text-white
              hover:file:from-purple-600 hover:file:to-purple-700
              file:cursor-pointer file:transition-all file:shadow-lg file:shadow-purple-500/20
              cursor-pointer"
          />
        </div>
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Importing...
            </span>
          ) : (
            "Import"
          )}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            message.startsWith("✓")
              ? "bg-green-500/10 text-green-400 border border-green-500/30"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default LibraryImport;
