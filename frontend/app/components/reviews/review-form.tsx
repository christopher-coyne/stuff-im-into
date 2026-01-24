import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/lib/api/client";
import { getReviewGradient, getTagColor } from "~/lib/theme";

type MediaType = "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT";

export interface ReviewFormData {
  title: string;
  tabId: string;
  description: string;
  mediaType: MediaType;
  mediaUrl: string;
  categoryIds: string[];
  metaFields: { label: string; value: string }[];
  publish: boolean;
}

const mediaTypeOptions: { value: MediaType; label: string }[] = [
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "SPOTIFY", label: "Spotify" },
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
      mediaType: initialValues?.mediaType ?? "IMAGE",
      mediaUrl: initialValues?.mediaUrl ?? "",
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
            to={selectedTab ? `/${user.username}/${selectedTab.slug}` : `/${user.username}`}
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
              className="w-full text-3xl font-bold text-white bg-transparent border-none outline-none placeholder:text-white/50 mb-3"
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
              <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-3 relative">
                {watchedMediaUrl && watchedMediaType === "IMAGE" ? (
                  <img
                    src={watchedMediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImagePlus className="h-12 w-12" />
                    <span className="text-sm">Media preview</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Select
                  value={watchedMediaType}
                  onValueChange={(value) => setValue("mediaType", value as MediaType)}
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
                {watchedMediaType !== "TEXT" && (
                  <Input
                    placeholder={
                      watchedMediaType === "IMAGE"
                        ? "Image URL..."
                        : watchedMediaType === "VIDEO"
                          ? "YouTube URL..."
                          : "Spotify URL..."
                    }
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
              <textarea
                placeholder="Write your review... (Markdown supported)"
                {...register("description")}
                rows={10}
                className="w-full bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground outline-none resize-none"
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
