import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { ReviewListItemDto } from "~/lib/api/api";

interface CategoryReviewsSectionProps {
  categoryReviews: Record<string, { name: string; reviews: ReviewListItemDto[] }>;
}

export function CategoryReviewsSection({ categoryReviews }: CategoryReviewsSectionProps) {
  return (
    <>
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
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
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
    </>
  );
}
