import React from "react";
import { Loader2, BookOpen } from "lucide-react";

interface ScrapingLoaderProps {
  message?: string;
}

const ScrapingLoader: React.FC<ScrapingLoaderProps> = ({
  message = "Scraping novel description...",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 max-w-md w-full shadow-2xl">
        {/* Animated Book Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <BookOpen className="w-16 h-16 text-purple-400 animate-pulse" />
            <Loader2 className="w-8 h-8 text-pink-400 absolute -top-2 -right-2 animate-spin" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Fetching Book Details
        </h2>

        {/* Message */}
        <p className="text-slate-300 text-center mb-6">{message}</p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse rounded-full w-2/3"></div>
        </div>

        {/* Status Text */}
        <p className="text-slate-400 text-sm text-center mt-4">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
};

export default ScrapingLoader;
