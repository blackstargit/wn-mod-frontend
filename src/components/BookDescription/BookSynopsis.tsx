import React from "react";

interface BookSynopsisProps {
  synopsis: string;
}

/**
 * Book synopsis section
 */
const BookSynopsis: React.FC<BookSynopsisProps> = ({ synopsis }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
      <div className="prose prose-invert max-w-none">
        <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
          {synopsis}
        </p>
      </div>
    </div>
  );
};

export default BookSynopsis;
