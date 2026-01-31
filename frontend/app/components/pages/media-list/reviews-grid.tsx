import { BookmarkCheck, ExternalLink, Music, Plus, Type, Video } from "lucide-react";
import { Link } from "react-router";
import type { ReviewListItemDto } from "~/lib/api/api";
import { MarkdownRenderer } from "~/components/ui/markdown-renderer";
import type { ResolvedTheme } from "~/lib/theme/themes";

interface ReviewsGridProps {
  reviews: ReviewListItemDto[];
  theme: ResolvedTheme;
  isOwner?: boolean;
  currentTabId?: string;
}

function MediaThumbnail({ review, theme }: { review: ReviewListItemDto; theme: ResolvedTheme }) {
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
          className="text-sm leading-relaxed **:text-lg [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm"
          style={{
            "--tw-prose-body": theme.colors.foreground,
            "--tw-prose-headings": theme.colors.foreground,
            "--tw-prose-bold": theme.colors.foreground,
          } as React.CSSProperties}
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
    <div className="w-full h-full flex items-center justify-center" style={theme.styles.mutedText}>
      <Icon className="h-12 w-12" />
    </div>
  );
}

export function ReviewsGrid({ reviews, theme, isOwner, currentTabId }: ReviewsGridProps) {
  const { styles } = theme;

  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center" style={styles.card}>
        <p style={styles.mutedText}>No reviews yet</p>
        {isOwner && currentTabId && (
          <Link
            to={`/reviews/add?tab=${currentTabId}`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm"
            style={styles.button}
          >
            <Plus className="h-4 w-4" />
            Add Review
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <Link key={review.id} to={`/review/${review.id}`} className="group">
          {/* Image */}
          <div
            className="relative aspect-square overflow-hidden mb-2"
            style={styles.cardMuted}
          >
            <MediaThumbnail review={review} theme={theme} />
            {/* Bookmark indicator */}
            {review.isBookmarked && (
              <div
                className="absolute top-2 right-2 p-1.5"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius,
                  color: theme.colors.primaryForeground,
                }}
              >
                <BookmarkCheck className="h-4 w-4" />
              </div>
            )}
          </div>
          {/* Title */}
          <h3
            className="text-sm line-clamp-2"
            style={{ fontWeight: theme.fontWeights.body }}
          >
            {review.title}
          </h3>
          {/* Author */}
          {review.author && (
            <p className="text-xs line-clamp-1" style={styles.mutedText}>
              {String(review.author)}
            </p>
          )}
          {/* Tags */}
          {review.categories.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {review.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="text-xs px-2 py-0.5"
                  style={styles.tag}
                >
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
