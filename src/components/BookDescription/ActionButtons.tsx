import React from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface ActionButtonsProps {
  bookId: string;
  chaptersScraped: boolean;
  scrapingChapters: boolean;
  onScrapeChapters: () => void;
}

/**
 * Action buttons for reading or scraping chapters
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  bookId,
  chaptersScraped,
  scrapingChapters,
  onScrapeChapters,
}) => {
  return (
    <div className="mt-6 flex justify-center gap-4">
      {chaptersScraped ? (
        <Link
          to={`/read/${bookId}`}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105"
        >
          <BookOpen className="w-5 h-5 inline mr-2" />
          Start Reading
        </Link>
      ) : (
        <button
          onClick={onScrapeChapters}
          disabled={scrapingChapters}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
        >
          {scrapingChapters ? (
            <>
              <div className="w-5 h-5 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scraping Chapters...
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5 inline mr-2" />
              Scrape Chapters
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
