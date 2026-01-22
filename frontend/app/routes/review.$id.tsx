import { ArrowLeft, Bookmark, Calendar, ChevronRight, Clock, Share2 } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { api } from "~/lib/api/client";
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

const themeGradients: Record<string, string> = {
  DEFAULT: "from-gray-600/80 to-gray-900",
  EMBER: "from-amber-700/80 to-stone-900",
  OCEAN: "from-cyan-700/80 to-slate-900",
  FOREST: "from-emerald-700/80 to-stone-900",
  VIOLET: "from-violet-700/80 to-slate-900",
  ROSE: "from-rose-700/80 to-stone-900",
  MINIMAL: "from-zinc-600/80 to-zinc-900",
};

const themeTagColors: Record<string, string> = {
  DEFAULT: "bg-gray-600 text-gray-100",
  EMBER: "bg-amber-600 text-amber-100",
  OCEAN: "bg-cyan-600 text-cyan-100",
  FOREST: "bg-emerald-600 text-emerald-100",
  VIOLET: "bg-violet-600 text-violet-100",
  ROSE: "bg-rose-600 text-rose-100",
  MINIMAL: "bg-zinc-600 text-zinc-100",
};

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

  if (!id) {
    throw new Response("Review ID is required", { status: 400 });
  }

  const response = await api.reviews.reviewsControllerFindById(id);
  const review = response.data.data;

  if (!review) {
    throw new Response("Review not found", { status: 404 });
  }

  // Fetch other reviews from the same categories
  const categoryReviews: Record<string, { name: string; reviews: typeof review[] }> = {};

  if (review.categories.length > 0) {
    const categoryFetches = review.categories.map(async (category) => {
      const res = await api.tabs.tabsControllerFindReviewsForTab(review.tab.id, {
        categoryId: category.id,
        limit: 5,
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

  const gradient = themeGradients[review.user.theme] || themeGradients.DEFAULT;
  const tagColor = themeTagColors[review.user.theme] || themeTagColors.DEFAULT;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <div className="pt-6 pb-4">
          <Link
            to={`/${review.user.username}/${review.tab.slug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to @{review.user.username}&apos;s list</span>
          </Link>
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
        <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-6">
          {review.mediaUrl ? (
            <img
              src={String(review.mediaUrl)}
              alt={review.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No media
            </div>
          )}
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
            <button className="hover:text-foreground transition-colors">
              <Bookmark className="h-5 w-5" />
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
          <div className="prose prose-sm dark:prose-invert max-w-none mb-12">
            <p className="whitespace-pre-wrap">{String(review.description)}</p>
          </div>
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
    </div>
  );
}
