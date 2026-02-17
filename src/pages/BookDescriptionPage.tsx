import React from "react";
import { useParams, Link } from "react-router-dom";
import { useBookDescription } from "@/hooks";
import {
  BookHeader,
  BookSynopsis,
  TableOfContents,
  ReviewsList,
  ActionButtons,
  ScrapingLoader,
} from "@/components/BookDescription";

const BookDescriptionPage: React.FC = () => {
  const { book_id } = useParams<{ book_id: string }>();

  const {
    bookData,
    loading,
    scraping,
    scrapingChapters,
    chaptersScraped,
    error,
    handleScrapeChapters,
    expandedVolumes,
    setExpandedVolumes,
  } = useBookDescription(book_id);

  // Show scraping loader
  if (scraping) {
    return <ScrapingLoader message="Fetching book details from Webnovel..." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">
            {error || "Book not found"}
          </p>
          <Link
            to="/"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BookHeader title={bookData.title} metadata={bookData.metadata} />

        {/* Content Section: Synopsis & TOC */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl mb-6">
          <div className="p-8">
            <BookSynopsis synopsis={bookData.synopsis} />

            <TableOfContents
              toc={bookData.toc}
              expandedVolumes={expandedVolumes}
              setExpandedVolumes={setExpandedVolumes}
            />
          </div>
        </div>

        <ReviewsList reviews={bookData.reviews} />

        <ActionButtons
          bookId={book_id || ""}
          chaptersScraped={chaptersScraped}
          scrapingChapters={scrapingChapters}
          onScrapeChapters={handleScrapeChapters}
        />
      </div>
    </div>
  );
};

export default BookDescriptionPage;
