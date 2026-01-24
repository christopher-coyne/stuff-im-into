import { BookmarkCheck } from "lucide-react";
import { Link } from "react-router";
import type { ReviewListItemDto } from "~/lib/api/api";

interface ReviewsGridProps {
  reviews: ReviewListItemDto[];
}

export function ReviewsGrid({ reviews }: ReviewsGridProps) {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No reviews found</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {reviews.map((review) => (
        <Link key={review.id} to={`/review/${review.id}`} className="group">
          {/* Image */}
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
            <img
              src="https://placehold.co/200x300/1a1a1a/666?text=..."
              alt={review.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {/* Bookmark indicator */}
            {review.isBookmarked && (
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-amber-500">
                <BookmarkCheck className="h-4 w-4" />
              </div>
            )}
          </div>
          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2">{review.title}</h3>
          {/* Tags */}
          {review.categories.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {review.categories.map((cat) => (
                <span key={cat.id} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
