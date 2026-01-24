import { BookmarkCheck, ExternalLink, Music, Type, Video } from "lucide-react";
import { Link } from "react-router";
import type { ReviewListItemDto } from "~/lib/api/api";
import { MarkdownRenderer } from "~/components/ui/markdown-renderer";

interface ReviewsGridProps {
  reviews: ReviewListItemDto[];
  theme?: string | null;
}

function MediaThumbnail({ review, theme }: { review: ReviewListItemDto; theme?: string | null }) {
  const mediaUrl = review.mediaUrl as string | undefined;
  const mediaConfig = review.mediaConfig as Record<string, unknown> | undefined;

  // Show actual image for IMAGE type
  if (review.mediaType === "IMAGE" && mediaUrl) {
    return (
      <img
        src={mediaUrl}
        alt={review.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
    );
  }

  // Show YouTube thumbnail for VIDEO type
  if (review.mediaType === "VIDEO" && mediaConfig?.videoId) {
    return (
      <img
        src={`https://img.youtube.com/vi/${mediaConfig.videoId}/hqdefault.jpg`}
        alt={review.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
    );
  }

  // Show Spotify album art for SPOTIFY type
  if (review.mediaType === "SPOTIFY" && mediaConfig?.thumbnailUrl) {
    return (
      <img
        src={String(mediaConfig.thumbnailUrl)}
        alt={review.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
    );
  }

  // Show truncated text for TEXT type
  if (review.mediaType === "TEXT" && mediaConfig?.content) {
    return (
      <div className="w-full h-full p-3 overflow-hidden line-clamp-6">
        <MarkdownRenderer
          content={String(mediaConfig.content)}
          theme={theme}
          className="text-xs leading-relaxed [&_*]:text-xs [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs"
        />
      </div>
    );
  }

  // Show placeholder icons for other types
  const iconMap = {
    VIDEO: Video,
    SPOTIFY: Music,
    EXTERNAL_LINK: ExternalLink,
    TEXT: Type,
    IMAGE: Type, // fallback if no URL
  };

  const Icon = iconMap[review.mediaType as keyof typeof iconMap] || Type;

  return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
      <Icon className="h-12 w-12" />
    </div>
  );
}

export function ReviewsGrid({ reviews, theme }: ReviewsGridProps) {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No reviews found</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <Link key={review.id} to={`/review/${review.id}`} className="group">
          {/* Image */}
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
            <MediaThumbnail review={review} theme={theme} />
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
