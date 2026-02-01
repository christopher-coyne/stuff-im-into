import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate, useRevalidator } from "react-router";
import { toast } from "sonner";
import { CategoryReviewsSection, DeleteReviewDialog } from "~/components/media-review";
import { ReviewForm, type ReviewFormData } from "~/components/reviews";
import { MediaPreview } from "~/components/reviews/media-preview";
import { Button } from "~/components/ui/button";
import { MarkdownRenderer } from "~/components/ui/markdown-renderer";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";
import { loaderFetch } from "~/lib/api/loader-fetch";
import type { ReviewListItemDto, UpdateReviewDto } from "~/lib/api/api";
import { getAuthHeaders } from "~/lib/supabase/server";
import { getTheme, type AestheticSlug } from "~/lib/theme/themes";
import type { Route } from "./+types/review.$id";

function calculateReadTime(text: string | null | undefined): string {
  if (!text) return "1 min read";
  const words = String(text).trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

  // Fetch other reviews from the same categories
  const categoryReviews: Record<string, { name: string; reviews: ReviewListItemDto[] }> = {};

  if (review.categories.length > 0) {
    const categoryFetches = review.categories.map(async (category) => {
      const res = await loaderFetch(() =>
        api.tabs.tabsControllerFindReviewsForTab(review.tab.id, {
          categoryId: category.id,
          limit: 5,
        }, {
          headers: authHeaders,
        })
      );
      return { category, reviews: res.data.data?.items || [] };
    });

    const results = await Promise.all(categoryFetches);

    for (const { category, reviews: catReviews } of results) {
      // Filter out the current review and limit to 4
      const otherReviews = catReviews.filter((r) => r.id !== review.id).slice(0, 4);
      if (otherReviews.length > 0) {
        categoryReviews[category.id] = {
          name: category.name,
          reviews: otherReviews,
        };
      }
    }
  }

  return { review, categoryReviews, reviewOwner };
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
  const { review, categoryReviews, reviewOwner } = useLoaderData<typeof loader>();
  const { user: loggedInUser, session } = useAuth();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isOwner = loggedInUser?.id === review.user.id;

  // Get theme from the review owner's settings
  const userTheme = reviewOwner?.userTheme as { aesthetic?: { slug?: string }; palette?: string } | null;
  const theme = getTheme(
    (userTheme?.aesthetic?.slug as AestheticSlug) || "minimalist",
    userTheme?.palette || "default"
  );
  const { styles, colors } = theme;

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
          mediaType: review.mediaType as "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT" | "EXTERNAL_LINK",
          mediaUrl: review.mediaUrl ? String(review.mediaUrl) : "",
          textContent: mediaConfig?.content ? String(mediaConfig.content) : "",
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
        <header className="px-6 py-6" style={styles.header}>
          {/* Title */}
          <h1 className="text-3xl mb-1" style={styles.headerText}>{review.title}</h1>

          {/* Author */}
          {review.author && (
            <p className="text-lg mb-3" style={styles.headerTextMuted}>{String(review.author)}</p>
          )}

          {/* User info */}
          <Link
            to={`/users/${review.user.username}`}
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={styles.headerTextMuted}
          >
            <div
              className="h-7 w-7 overflow-hidden flex items-center justify-center"
              style={{
                borderRadius: theme.borderRadius,
                backgroundColor: colors.secondary,
              }}
            >
              {review.user.avatarUrl ? (
                <img
                  src={String(review.user.avatarUrl)}
                  alt={review.user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="text-xs"
                  style={{ color: colors.secondaryForeground, fontWeight: theme.fontWeights.heading }}
                >
                  {review.user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm">@{review.user.username}</span>
          </Link>
        </header>

        {/* Main content */}
        <main className="py-6">
        {/* Media embed */}
        <div className={`rounded-xl overflow-hidden bg-muted mb-6 ${review.mediaType === "TEXT" ? "min-h-[200px]" : "aspect-video"}`}>
          <MediaPreview
            mediaType={review.mediaType as "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT" | "EXTERNAL_LINK"}
            mediaUrl={review.mediaUrl as string | null | undefined}
            mediaConfig={review.mediaConfig as Record<string, unknown> | null}
            title={review.title}
            renderMarkdown={review.mediaType === "TEXT"}
          />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(review.publishedAt)}</span>
            </div>
            <div className="text-border">|</div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{calculateReadTime(review.description as unknown as string)}</span>
            </div>
            <div className="text-border">|</div>
            <button
              onClick={() => {
                if (session) {
                  bookmarkMutation.mutate(!review.isBookmarked);
                }
              }}
              disabled={!session || bookmarkMutation.isPending}
              className={`hover:text-foreground transition-colors ${
                review.isBookmarked ? "text-emerald-500" : ""
              } ${!session ? "opacity-50 cursor-not-allowed" : ""}`}
              title={session ? (review.isBookmarked ? "Remove bookmark" : "Bookmark") : "Log in to bookmark"}
            >
              {review.isBookmarked ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Meta fields */}
        {review.metaFields && review.metaFields.length > 0 && (
          <div className="mb-4 text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {review.metaFields.map((field, index) => (
                <span key={index}>
                  <span className="text-muted-foreground">{field.label}:</span>{" "}
                  <span className="text-foreground">{field.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {review.categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {review.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        {review.categories.length > 0 && review.description && (
          <hr className="border-border mb-6" />
        )}

        {/* Description */}
        {review.description && (
          <MarkdownRenderer
            content={String(review.description)}
            className="mb-12"
          />
        )}

        {/* Other reviews by category */}
        <CategoryReviewsSection categoryReviews={categoryReviews} />
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
