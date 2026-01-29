import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MarkdownEditor } from "~/components/ui/markdown-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/lib/api/client";
import { getReviewGradient, getTagColor } from "~/lib/theme";
import { ImageUpload } from "./image-upload";
import { MediaPreview } from "./media-preview";

type MediaType = "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT" | "EXTERNAL_LINK";

// Helper functions to parse URLs for preview
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractSpotifyEmbed(url: string): { embedType: string; embedId: string } | null {
  const match = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (match) {
    return { embedType: match[1], embedId: match[2] };
  }
  return null;
}

function buildPreviewConfig(mediaType: MediaType, mediaUrl: string): Record<string, unknown> | null {
  if (!mediaUrl) return null;

  switch (mediaType) {
    case "VIDEO": {
      const videoId = extractYouTubeId(mediaUrl);
      return videoId ? { videoId } : null;
    }
    case "SPOTIFY": {
      const embed = extractSpotifyEmbed(mediaUrl);
      return embed ? { embedType: embed.embedType, embedId: embed.embedId } : null;
    }
    case "EXTERNAL_LINK": {
      try {
        const parsedUrl = new URL(mediaUrl);
        return { domain: parsedUrl.hostname };
      } catch {
        return null;
      }
    }
    default:
      return null;
  }
}

export interface ReviewFormData {
  title: string;
  tabId: string;
  description: string;
  author: string;
  mediaType: MediaType;
  mediaUrl: string;
  textContent: string; // For TEXT media type - stored in mediaConfig.content
  categoryIds: string[];
  metaFields: { label: string; value: string }[];
  publish: boolean;
}

const mediaTypeOptions: { value: MediaType; label: string }[] = [
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "YouTube" },
  { value: "SPOTIFY", label: "Spotify" },
  { value: "EXTERNAL_LINK", label: "Link" },
  { value: "TEXT", label: "Text Only" },
];

interface ReviewFormProps {
  user: {
    id: string;
    username: string;
    avatarUrl?: string | object | null;
    theme?: string | null;
  };
  initialValues?: Partial<ReviewFormData>;
  initialTabId?: string;
  onSubmit: (data: ReviewFormData) => void;
  isSubmitting: boolean;
  error?: string | null;
  submitLabel: string;
  onCancel?: () => void;
}

export function ReviewForm({
  user,
  initialValues,
  initialTabId,
  onSubmit,
  isSubmitting,
  error,
  submitLabel,
  onCancel,
}: ReviewFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
  } = useForm<ReviewFormData>({
    defaultValues: {
      title: initialValues?.title ?? "",
      tabId: initialValues?.tabId ?? initialTabId ?? "",
      description: initialValues?.description ?? "",
      author: initialValues?.author ?? "",
      mediaType: initialValues?.mediaType ?? "IMAGE",
      mediaUrl: initialValues?.mediaUrl ?? "",
      textContent: initialValues?.textContent ?? "",
      categoryIds: initialValues?.categoryIds ?? [],
      metaFields: initialValues?.metaFields ?? [],
      publish: initialValues?.publish ?? true,
    },
  });

  const { fields: metaFields, append: appendMetaField, remove: removeMetaField } = useFieldArray({
    control,
    name: "metaFields",
  });

  const watchedTabId = watch("tabId");
  const watchedMediaType = watch("mediaType");
  const watchedMediaUrl = watch("mediaUrl");
  const watchedCategoryIds = watch("categoryIds");
  const watchedPublish = watch("publish");

  // Compute mediaConfig for preview from URL
  const previewMediaConfig = useMemo(
    () => buildPreviewConfig(watchedMediaType, watchedMediaUrl),
    [watchedMediaType, watchedMediaUrl]
  );

  // Fetch user's tabs
  const { data: tabs = [] } = useQuery({
    queryKey: ["userTabs", user.id],
    queryFn: async () => {
      const response = await api.users.usersControllerFindByUsername(user.username);
      return response.data.data?.tabs || [];
    },
  });

  // Set initial tab when tabs load (only if no tab is set)
  useEffect(() => {
    if (tabs.length > 0 && !watchedTabId) {
      setValue("tabId", tabs[0].id);
    }
  }, [tabs, watchedTabId, setValue]);

  // Fetch categories for selected tab
  const { data: categories = [] } = useQuery({
    queryKey: ["tabCategories", watchedTabId],
    queryFn: async () => {
      if (!watchedTabId) return [];
      const response = await api.tabs.tabsControllerFindCategoriesForTab(watchedTabId);
      return response.data.data || [];
    },
    enabled: !!watchedTabId,
  });

  const handleCategoryToggle = (categoryId: string) => {
    const current = watchedCategoryIds || [];
    const updated = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    setValue("categoryIds", updated);
  };

  const handleTabChange = (tabId: string) => {
    setValue("tabId", tabId);
    setValue("categoryIds", []); // Reset categories when tab changes
  };

  const selectedTab = tabs.find((t) => t.id === watchedTabId);
  const gradient = getReviewGradient(user.theme);
  const tagColor = getTagColor(user.theme);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <div className="pt-6 pb-4 flex items-center justify-between">
          <Link
            to={selectedTab ? `/users/${user.username}/${selectedTab.slug}` : `/users/${user.username}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to @{user.username}&apos;s list</span>
          </Link>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header with gradient */}
          <header className={`bg-linear-to-b ${gradient} rounded-t-xl px-6 py-6`}>
            {/* Title Input */}
            <input
              type="text"
              placeholder="Enter title..."
              {...register("title", { required: true })}
              className="w-full text-3xl font-bold text-white bg-transparent border-none outline-none placeholder:text-white/50 mb-1"
            />

            {/* Author Input */}
            <input
              type="text"
              placeholder="Author (optional)"
              {...register("author")}
              className="w-full text-lg text-white/80 bg-transparent border-none outline-none placeholder:text-white/40 mb-3"
            />

            {/* User info & Tab selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/80">
                <div className="h-7 w-7 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img
                      src={String(user.avatarUrl)}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm">@{user.username}</span>
              </div>
              <div className="text-white/40">|</div>
              <Select value={watchedTabId} onValueChange={handleTabChange}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white text-sm h-8">
                  <SelectValue placeholder="Select tab" />
                </SelectTrigger>
                <SelectContent>
                  {tabs.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id}>
                      {tab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          {/* Main content */}
          <main className="py-6">
            {/* Media section */}
            <div className="mb-6">
              {/* Text editor for TEXT mode */}
              {watchedMediaType === "TEXT" ? (
                <div className="mb-3">
                  <MarkdownEditor
                    name="textContent"
                    control={control}
                    placeholder="Write your text content here..."
                    minHeight={250}
                    className="bg-muted/30"
                  />
                </div>
              ) : watchedMediaType === "IMAGE" && !watchedMediaUrl ? (
                <ImageUpload
                  userId={user.id}
                  currentUrl={watchedMediaUrl}
                  onUpload={(url) => setValue("mediaUrl", url)}
                  onRemove={() => setValue("mediaUrl", "")}
                  disabled={isSubmitting}
                />
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-3 relative">
                  <MediaPreview
                    mediaType={watchedMediaType}
                    mediaUrl={watchedMediaUrl}
                    mediaConfig={previewMediaConfig}
                    title={watch("title")}
                  />
                  {/* Remove button for uploaded images */}
                  {watchedMediaType === "IMAGE" && watchedMediaUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setValue("mediaUrl", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-3">
                <Select
                  value={watchedMediaType}
                  onValueChange={(value) => {
                    setValue("mediaType", value as MediaType);
                    setValue("mediaUrl", ""); // Clear URL when type changes
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Conditional input based on media type */}
                {watchedMediaType === "IMAGE" && (
                  <Input
                    placeholder="Or paste image URL..."
                    {...register("mediaUrl")}
                    className="flex-1"
                  />
                )}
                {watchedMediaType === "VIDEO" && (
                  <Input
                    placeholder="YouTube URL (e.g., youtube.com/watch?v=...)"
                    {...register("mediaUrl")}
                    className="flex-1"
                  />
                )}
                {watchedMediaType === "SPOTIFY" && (
                  <Input
                    placeholder="Spotify URL (e.g., open.spotify.com/track/...)"
                    {...register("mediaUrl")}
                    className="flex-1"
                  />
                )}
                {watchedMediaType === "EXTERNAL_LINK" && (
                  <Input
                    placeholder="URL (e.g., https://example.com/article)"
                    {...register("mediaUrl")}
                    className="flex-1"
                  />
                )}
              </div>
            </div>

            {/* Meta fields section */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {metaFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 group">
                    <input
                      placeholder="Label"
                      {...register(`metaFields.${index}.label`)}
                      className="w-20 bg-transparent border-b border-dashed border-muted-foreground/50 text-muted-foreground outline-none focus:border-foreground"
                    />
                    <span className="text-muted-foreground">:</span>
                    <input
                      placeholder="Value"
                      {...register(`metaFields.${index}.value`)}
                      className="w-32 bg-transparent border-b border-dashed border-muted-foreground/50 text-foreground outline-none focus:border-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => removeMetaField(index)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendMetaField({ label: "", value: "" })}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add field</span>
                </button>
              </div>
            </div>

            {/* Categories section */}
            <div className="flex gap-2 flex-wrap mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`text-sm px-3 py-1 rounded-full transition-all ${
                    watchedCategoryIds?.includes(category.id)
                      ? tagColor
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category.name}
                  {watchedCategoryIds?.includes(category.id) && (
                    <X className="inline-block ml-1 h-3 w-3" />
                  )}
                </button>
              ))}
              {categories.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No categories in this tab yet
                </span>
              )}
            </div>

            {/* Description section */}
            <div className="mb-8">
              <MarkdownEditor
                name="description"
                control={control}
                placeholder="Write your review..."
                minHeight={300}
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}

            {/* Action bar */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="publish"
                  {...register("publish")}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="publish" className="text-sm text-muted-foreground">
                  Publish immediately
                </label>
              </div>
              <Button
                type="submit"
                disabled={!watchedTabId || isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : watchedPublish
                    ? submitLabel
                    : "Save as Draft"}
              </Button>
            </div>
          </main>
        </form>
      </div>
    </div>
  );
}
