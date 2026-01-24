import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, ChevronRight, Clock, Pencil, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate, useRevalidator } from "react-router";
import { ReviewForm, type ReviewFormData } from "~/components/reviews";
import { MediaPreview } from "~/components/reviews/media-preview";
import { Button } from "~/components/ui/button";
import { MarkdownRenderer } from "~/components/ui/markdown-renderer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";
import type { ReviewListItemDto, UpdateReviewDto } from "~/lib/api/api";
import { getReviewGradient, getTagColor } from "~/lib/theme";
import { getAuthHeaders } from "~/lib/supabase/server";
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

  const response = await api.reviews.reviewsControllerFindById(id, {
    headers: authHeaders,
  });
  const review = response.data.data;

  if (!review) {
    throw new Response("Review not found", { status: 404 });
  }

  // Fetch other reviews from the same categories
  const categoryReviews: Record<string, { name: string; reviews: ReviewListItemDto[] }> = {};

  if (review.categories.length > 0) {
    const categoryFetches = review.categories.map(async (category) => {
      const res = await api.tabs.tabsControllerFindReviewsForTab(review.tab.id, {
        categoryId: category.id,
        limit: 5,
      }, {
        headers: authHeaders,
      });
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

  return { review, categoryReviews };
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
  const { review, categoryReviews } = useLoaderData<typeof loader>();
  const { user: loggedInUser, session } = useAuth();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [optimisticBookmarked, setOptimisticBookmarked] = useState<boolean | null>(null);

  const isOwner = loggedInUser?.id === review.user.id;
  const isBookmarked = optimisticBookmarked ?? review.isBookmarked;

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
      navigate(`/${review.user.username}/${review.tab.slug}`);
    },
  });

  const handleDeleteConfirm = () => {
    deleteReviewMutation.mutate();
  };

  // Bookmark mutation - pass desired state as parameter to avoid closure issues
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
    onMutate: (shouldBookmark) => {
      setOptimisticBookmarked(shouldBookmark);
    },
    onError: () => {
      setOptimisticBookmarked(null);
    },
    onSuccess: () => {
      revalidator.revalidate();
      setOptimisticBookmarked(null);
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
      mediaType: data.mediaType as UpdateReviewDto["mediaType"],
      mediaUrl: data.mediaUrl.trim() || undefined,
      mediaConfig,
      categoryIds: data.categoryIds.length > 0 ? data.categoryIds : [],
      metaFields: validMetaFields.length > 0 ? validMetaFields : [],
      publish: data.publish,
    });
  };

  const gradient = getReviewGradient(review.user.theme);
  const tagColor = getTagColor(review.user.theme);

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
            to={`/${review.user.username}/${review.tab.slug}`}
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

        {/* Header with gradient */}
        <header className={`bg-gradient-to-b ${gradient} rounded-t-xl px-6 py-6`}>
          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">{review.title}</h1>

          {/* User info */}
          <Link
            to={`/${review.user.username}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-amber-500 overflow-hidden flex items-center justify-center">
              {review.user.avatarUrl ? (
                <img
                  src={String(review.user.avatarUrl)}
                  alt={review.user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white text-xs font-bold">
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
            theme={review.user.theme}
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
                  bookmarkMutation.mutate(!isBookmarked);
                }
              }}
              disabled={!session || bookmarkMutation.isPending}
              className={`hover:text-foreground transition-colors ${
                isBookmarked ? "text-amber-500" : ""
              } ${!session ? "opacity-50 cursor-not-allowed" : ""}`}
              title={session ? (isBookmarked ? "Remove bookmark" : "Bookmark") : "Log in to bookmark"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
            <button className="hover:text-foreground transition-colors">
              <Share2 className="h-5 w-5" />
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
          <div className="flex gap-2 flex-wrap mb-8">
            {review.categories.map((cat) => (
              <span
                key={cat.id}
                className={`text-sm px-3 py-1 rounded-full ${tagColor}`}
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {review.description && (
          <MarkdownRenderer
            content={String(review.description)}
            className="mb-12"
            theme={review.user.theme}
          />
        )}

        {/* Related reviews */}
        {review.relatedReviews.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Related</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {review.relatedReviews.map((related) => (
                <Link key={related.id} to={`/review/${related.id}`} className="group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                    {related.mediaUrl ? (
                      <img
                        src={String(related.mediaUrl)}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-medium line-clamp-2">{related.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Other reviews by category */}
        {Object.entries(categoryReviews).map(([categoryId, { name, reviews }]) => (
          <section key={categoryId} className="mb-8">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold">Other {name}</h2>
              </div>
              <div className="divide-y divide-border">
                {reviews.map((item) => (
                  <Link
                    key={item.id}
                    to={`/review/${item.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.mediaUrl ? (
                        <img
                          src={String(item.mediaUrl)}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                          ?
                        </div>
                      )}
                    </div>
                    <span className="flex-1 font-medium">{item.title}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{review.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteReviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
