import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { ReviewForm, type ReviewFormData } from "~/components/reviews";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";
import type { CreateReviewDto } from "~/lib/api/api";

export default function AddReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth();
  const initialTabId = searchParams.get("tab") || "";

  const createReviewMutation = useMutation({
    mutationFn: async (data: CreateReviewDto) => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.reviews.reviewsControllerCreate(data, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      return response.data.data;
    },
    onSuccess: (review) => {
      if (review) {
        navigate(`/review/${review.id}`);
      }
    },
  });

  const handleSubmit = (data: ReviewFormData) => {
    const validMetaFields = data.metaFields.filter((f) => f.label.trim() && f.value.trim());

    createReviewMutation.mutate({
      title: data.title.trim(),
      tabId: data.tabId,
      description: data.description.trim() || undefined,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl.trim() || undefined,
      categoryIds: data.categoryIds.length > 0 ? data.categoryIds : undefined,
      metaFields: validMetaFields.length > 0 ? validMetaFields : undefined,
      publish: data.publish,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to add a review.</p>
      </div>
    );
  }

  const errorMessage = createReviewMutation.error
    ? (createReviewMutation.error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || "Failed to create review"
    : null;

  return (
    <ReviewForm
      user={user}
      initialTabId={initialTabId}
      onSubmit={handleSubmit}
      isSubmitting={createReviewMutation.isPending}
      error={errorMessage}
      submitLabel="Publish Review"
    />
  );
}
