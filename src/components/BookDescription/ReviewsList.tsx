import React from "react";
import type { BookReview } from "@/types/bookDescription";
import ReviewCard from "./ReviewCard";

interface ReviewsListProps {
  reviews: BookReview[];
}

/**
 * Reviews section with list of review cards
 */
const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">
        Reviews ({reviews.length})
      </h2>
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No reviews yet</p>
        ) : (
          reviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
