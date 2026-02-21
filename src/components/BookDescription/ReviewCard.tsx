import React from "react";
import { Star, StarHalf } from "lucide-react";
import type { BookReview } from "@/types/bookDescription";
import { useChapterParsing } from "@/hooks/useChapterParsing";

interface ReviewCardProps {
  review: BookReview;
}

/**
 * Individual review card component
 */
const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const { parseWebnovelEmojis } = useChapterParsing();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />,
      );
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-slate-600" />,
      );
    }
    return stars;
  };

  return (
    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-white mb-2">{review.user}</h4>
          {review.rating && (
            <div className="flex items-center gap-1">
              {renderStars(review.rating)}
              <span className="ml-2 text-sm text-slate-400">
                {review.rating}/5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <p className="text-slate-300 leading-relaxed mb-4">
        {parseWebnovelEmojis(review.content)}
      </p>

      {/* Review Figure */}
      {review.figure && (
        <img
          src={`http://127.0.0.1:8000/api/proxy-image?url=${encodeURIComponent(review.figure)}`}
          alt="Review attachment"
          className="rounded-lg max-w-md border border-slate-700/50"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
};

export default ReviewCard;
