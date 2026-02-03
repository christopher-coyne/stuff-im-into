import { ImagePlus, Music, Type, Video } from "lucide-react";
import { MarkdownRenderer } from "~/components/ui/markdown-renderer";
import type { ResolvedTheme } from "~/lib/theme/themes";

type MediaType = "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT";

interface MediaConfig {
  videoId?: string;
  startTime?: number;
  embedType?: "track" | "album" | "playlist";
  embedId?: string;
  title?: string;
  content?: string; // For TEXT type
}

interface MediaPreviewProps {
  mediaType: MediaType;
  mediaUrl?: string | null;
  mediaConfig?: MediaConfig | null;
  title?: string;
  className?: string;
  /** Render TEXT content as markdown (use on detail pages) */
  renderMarkdown?: boolean;
  /** Optional theme for styled rendering */
  theme?: ResolvedTheme;
  /** Display image at natural aspect ratio instead of cropping */
  imageContain?: boolean;
}

export function MediaPreview({
  mediaType,
  mediaUrl,
  mediaConfig,
  title,
  className = "",
  renderMarkdown = false,
  theme,
  imageContain = false,
}: MediaPreviewProps) {
  const containerClass = `w-full h-full ${className}`;

  switch (mediaType) {
    case "IMAGE":
      return mediaUrl ? (
        <img
          src={mediaUrl}
          alt={title || "Review image"}
          className={imageContain ? `w-full ${className}` : `${containerClass} object-cover`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <MediaPlaceholder icon={ImagePlus} text="No image" theme={theme} />
      );

    case "VIDEO": {
      const videoId = mediaConfig?.videoId;
      const startTime = mediaConfig?.startTime;
      return videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}${startTime ? `?start=${startTime}` : ""}`}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={containerClass}
        />
      ) : (
        <MediaPlaceholder icon={Video} text="Enter YouTube URL" theme={theme} />
      );
    }

    case "SPOTIFY": {
      const embedType = mediaConfig?.embedType || "track";
      const embedId = mediaConfig?.embedId;
      return embedId ? (
        <div className={`${containerClass} flex items-center justify-center bg-black/90 p-4`}>
          <iframe
            src={`https://open.spotify.com/embed/${embedType}/${embedId}?utm_source=generator&theme=0`}
            title={title || "Spotify embed"}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full h-[352px] max-h-full rounded-xl"
          />
        </div>
      ) : (
        <MediaPlaceholder icon={Music} text="Enter Spotify URL" theme={theme} />
      );
    }

    case "TEXT": {
      const content = mediaConfig?.content;
      return content ? (
        <div
          className={`${containerClass} p-6 overflow-auto`}
          style={theme ? { backgroundColor: theme.colors.muted } : undefined}
        >
          {renderMarkdown ? (
            <MarkdownRenderer
              content={content}
              style={theme ? {
                "--tw-prose-body": theme.colors.foreground,
                "--tw-prose-headings": theme.colors.foreground,
                "--tw-prose-bold": theme.colors.foreground,
                "--tw-prose-links": theme.colors.primary,
              } as React.CSSProperties : undefined}
            />
          ) : (
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={theme ? { color: theme.colors.foreground } : undefined}
            >
              {content}
            </p>
          )}
        </div>
      ) : (
        <MediaPlaceholder icon={Type} text="Text only" theme={theme} />
      );
    }

    default:
      return <MediaPlaceholder icon={Type} text="No media" theme={theme} />;
  }
}

function MediaPlaceholder({
  icon: Icon,
  text,
  theme,
}: {
  icon: typeof ImagePlus;
  text: string;
  theme?: ResolvedTheme;
}) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={theme?.styles.mutedText}
    >
      <Icon className="h-12 w-12" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
