import React, { useState } from "react";
import { libraryApi } from "../api/client";

const LibraryImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      const text = await file.text();
      const response = await libraryApi.importLibrary(text);
      setMessage(response.data.message);
      // Refresh library list if needed (passed via props or context in future)
      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Error importing library");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Import Webnovel Library</h2>
      <div className="flex gap-4 items-center">
        <input
          type="file"
          accept=".html"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default LibraryImport;
