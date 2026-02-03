import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Clock, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate, useRevalidator } from "react-router";
import { toast } from "sonner";
import { DeleteReviewDialog } from "~/components/media-review";
import { ReviewForm, type ReviewFormData } from "~/components/reviews";
import { MediaPreview } from "~/components/reviews/media-preview";
import { Button } from "~/components/ui/button";
import { MarkdownRenderer } from "~/components/ui/markdown-renderer";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";
import { loaderFetch } from "~/lib/api/loader-fetch";
import type { UpdateReviewDto } from "~/lib/api/api";
import { formatDate } from "~/lib/format-date";
import { getAuthHeaders } from "~/lib/supabase/server";
import { calculateReadTime } from "~/lib/text-utils";
import { getTheme } from "~/lib/theme/themes";
import type { Route } from "./+types/review.$id";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { id } = params;

  if (!id) {
    throw new Response("Review ID is required", { status: 400 });
  }

  // Get auth headers from cookies (for SSR)
  const authHeaders = await getAuthHeaders(request);

  const response = await loaderFetch(() =>
    api.reviews.reviewsControllerFindById(id, {
      headers: authHeaders,
    })
  );
  const review = response.data.data;

  if (!review) {
    throw new Response("Review not found", { status: 404 });
  }

  // Fetch the review owner's full profile to get their theme
  const userResponse = await loaderFetch(() =>
    api.users.usersControllerFindByUsername(review.user.username, {
      headers: authHeaders,
    })
  );
  const reviewOwner = userResponse.data.data;

  return { review, reviewOwner };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.review) {
    return [{ title: "Review not found" }];
  }
  return [
    { title: `${data.review.title} | Stuffiminto` },
    {
      name: "description",
      content: data.review.description
        ? String(data.review.description).slice(0, 160)
        : `Review by ${data.review.user.username}`,
    },
  ];
}

export default function ReviewDetailPage() {
  const { review, reviewOwner } = useLoaderData<typeof loader>();
  const { user: loggedInUser, session } = useAuth();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isOwner = loggedInUser?.id === review.user.id;

  // Get theme from the review owner's settings
  const userTheme = reviewOwner?.userTheme
  const theme = getTheme(
    (userTheme?.aesthetic?.slug) || "minimalist",
    userTheme?.palette || "default"
  );
  const { styles } = theme;

  // Delete mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Not authenticated");
      await api.reviews.reviewsControllerDelete(review.id, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      // Navigate back to the user's tab page
      navigate(`/users/${review.user.username}/${review.tab.slug}`);
    },
  });

  const deleteReviewError = deleteReviewMutation.error
    ? (deleteReviewMutation.error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || "Failed to delete review"
    : null;

  const handleDeleteConfirm = () => {
    deleteReviewMutation.mutate();
  };

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (shouldBookmark: boolean) => {
      if (!session) throw new Error("Not authenticated");
      if (shouldBookmark) {
        await api.bookmarks.bookmarksControllerBookmarkReview(review.id, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } else {
        await api.bookmarks.bookmarksControllerUnbookmarkReview(review.id, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }
    },
    onSuccess: () => {
      revalidator.revalidate();
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update bookmark";
      toast.error(message);
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async (data: UpdateReviewDto) => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.reviews.reviewsControllerUpdate(review.id, data, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      return response.data.data;
    },
    onSuccess: () => {
      setIsEditMode(false);
      revalidator.revalidate();
    },
  });

  const handleEditSubmit = (data: ReviewFormData) => {
    const validMetaFields = data.metaFields.filter((f) => f.label.trim() && f.value.trim());

    // Build mediaConfig for TEXT type
    const mediaConfig = data.mediaType === "TEXT" && data.textContent.trim()
      ? { content: data.textContent.trim() }
      : undefined;

    updateReviewMutation.mutate({
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      author: data.author.trim() || undefined,
      mediaType: data.mediaType as UpdateReviewDto["mediaType"],
      mediaUrl: data.mediaUrl.trim() || undefined,
      mediaConfig,
      link: data.link.trim() || undefined,
      categoryIds: data.categoryIds.length > 0 ? data.categoryIds : [],
      metaFields: validMetaFields.length > 0 ? validMetaFields : [],
      publish: data.publish,
    });
  };

  // Edit mode - show the form
  if (isEditMode && isOwner) {
    const errorMessage = updateReviewMutation.error
      ? (updateReviewMutation.error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || "Failed to update review"
      : null;

    const mediaConfig = review.mediaConfig as Record<string, unknown> | null;

    return (
      <ReviewForm
        user={review.user}
        initialValues={{
          title: review.title,
          tabId: review.tab.id,
          description: review.description ? String(review.description) : "",
          author: review.author ? String(review.author) : "",
          mediaType: review.mediaType as "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT",
          mediaUrl: review.mediaUrl ? String(review.mediaUrl) : "",
          textContent: mediaConfig?.content ? String(mediaConfig.content) : "",
          link: review.link ? String(review.link) : "",
          categoryIds: review.categories.map((c) => c.id),
          metaFields: (review.metaFields || []).map((f) => ({
            label: f.label,
            value: f.value,
          })),
          publish: !!review.publishedAt,
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={updateReviewMutation.isPending}
        error={errorMessage}
        submitLabel="Save Changes"
        onCancel={() => setIsEditMode(false)}
      />
    );
  }

  // View mode - show the review
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <div className="pt-6 pb-4 flex items-center justify-between">
          <Link
            to={`/users/${review.user.username}/${review.tab.slug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to @{review.user.username}&apos;s list</span>
          </Link>
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Header - themed */}
        <header className="relative px-6 py-6" style={styles.header}>
          {/* Bookmark button */}
          <button
            onClick={() => {
              if (session) {
                bookmarkMutation.mutate(!review.isBookmarked);
              }
            }}
            disabled={!session || bookmarkMutation.isPending}
            className={`absolute top-4 right-4 h-9 w-9 rounded-full bg-white border-2 border-black flex items-center justify-center transition-colors ${
              !session ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
            title={session ? (review.isBookmarked ? "Remove bookmark" : "Bookmark") : "Log in to bookmark"}
          >
            {review.isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-emerald-500" />
            ) : (
              <Bookmark className="h-5 w-5 text-black" />
            )}
          </button>

          {/* Title */}
          <h1 className="text-3xl mb-1 pr-12" style={styles.headerText}>{review.title}</h1>

          {/* Author */}
          {review.author && (
            <p className="text-lg" style={styles.headerTextMuted}>{String(review.author)}</p>
          )}
        </header>

        {/* Main content */}
        <main className="py-6">
        {/* Media embed */}
        <div className={`rounded-xl overflow-hidden mb-4 ${
          review.mediaType === "TEXT" ? "min-h-[200px] bg-muted" :
          review.mediaType === "IMAGE" ? "inline-block" :
          "aspect-video bg-muted"
        }`}>
          <MediaPreview
            mediaType={review.mediaType as "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT"}
            mediaUrl={review.mediaUrl as string | null | undefined}
            mediaConfig={review.mediaConfig as Record<string, unknown> | null}
            title={review.title}
            renderMarkdown={review.mediaType === "TEXT"}
            imageContain={review.mediaType === "IMAGE"}
          />
        </div>

        {/* User info + Action bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/users/${review.user.username}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center bg-secondary">
              {review.user.avatarUrl ? (
                <img
                  src={String(review.user.avatarUrl)}
                  alt={review.user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-secondary-foreground">
                  {review.user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm">@{review.user.username}</span>
          </Link>

          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(review.publishedAt)}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {calculateReadTime(review.description as unknown as string)}
            </span>
            {review.link && (
              <>
                <span className="text-border">·</span>
                <a
                  href={String(review.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {(() => {
                    try {
                      return new URL(String(review.link)).hostname;
                    } catch {
                      return "Link";
                    }
                  })()}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Categories */}
        {review.categories.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {review.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-xs px-2.5 py-0.5"
                style={{
                  ...styles.tag,
                  borderRadius: theme.borderRadius,
                }}
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Meta fields */}
        {review.metaFields && review.metaFields.length > 0 && (
          <div className="border border-border rounded-lg px-4 py-3 mb-6 text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              {review.metaFields.map((field, index) => (
                <span key={index}>
                  {field.label}: <span className="text-foreground">{field.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {review.description && (
          <hr className="border-border mb-6" />
        )}

        {/* Description */}
        {review.description && (
          <MarkdownRenderer
            content={String(review.description)}
            className="mb-12"
          />
        )}

        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteReviewDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={review.title}
        onConfirm={handleDeleteConfirm}
        isPending={deleteReviewMutation.isPending}
        error={deleteReviewError}
      />
    </div>
  );
}
