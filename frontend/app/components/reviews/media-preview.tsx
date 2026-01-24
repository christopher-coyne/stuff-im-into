import { ExternalLink, ImagePlus, Music, Type, Video } from "lucide-react";

type MediaType = "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT" | "EXTERNAL_LINK";

interface MediaConfig {
  videoId?: string;
  startTime?: number;
  embedType?: "track" | "album" | "playlist";
  embedId?: string;
  domain?: string;
  title?: string;
  content?: string; // For TEXT type
}

interface MediaPreviewProps {
  mediaType: MediaType;
  mediaUrl?: string | null;
  mediaConfig?: MediaConfig | null;
  title?: string;
  className?: string;
}

export function MediaPreview({
  mediaType,
  mediaUrl,
  mediaConfig,
  title,
  className = "",
}: MediaPreviewProps) {
  const containerClass = `w-full h-full ${className}`;

  switch (mediaType) {
    case "IMAGE":
      return mediaUrl ? (
        <img
          src={mediaUrl}
          alt={title || "Review image"}
          className={`${containerClass} object-cover`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <MediaPlaceholder icon={ImagePlus} text="No image" />
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
        <MediaPlaceholder icon={Video} text="Enter YouTube URL" />
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
        <MediaPlaceholder icon={Music} text="Enter Spotify URL" />
      );
    }

    case "EXTERNAL_LINK": {
      const domain = mediaConfig?.domain;
      return mediaUrl ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${containerClass} flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors gap-2 p-6`}
        >
          <ExternalLink className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium text-center px-4 line-clamp-2">
            {mediaConfig?.title || domain || mediaUrl}
          </span>
          {domain && (
            <span className="text-xs text-muted-foreground">{domain}</span>
          )}
        </a>
      ) : (
        <MediaPlaceholder icon={ExternalLink} text="Enter URL" />
      );
    }

    case "TEXT": {
      const content = mediaConfig?.content;
      return content ? (
        <div className={`${containerClass} p-6 overflow-auto bg-muted/30`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      ) : (
        <MediaPlaceholder icon={Type} text="Text only" />
      );
    }

    default:
      return <MediaPlaceholder icon={Type} text="No media" />;
  }
}

function MediaPlaceholder({
  icon: Icon,
  text,
}: {
  icon: typeof ImagePlus;
  text: string;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
      <Icon className="h-12 w-12" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
