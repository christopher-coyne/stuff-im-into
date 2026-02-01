import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { api } from "~/lib/api/client";
import type {
  BookmarkedUserDto,
  BookmarkedReviewDto,
  PaginationMetaDto,
  PaginatedBookmarkedUsersDto,
  PaginatedBookmarkedReviewsDto,
} from "~/lib/api/api";
import { useAuth } from "~/lib/auth-context";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

type BookmarkTab = "users" | "reviews";

interface BookmarksListProps {
  initialUsers: BookmarkedUserDto[];
  initialReviews: BookmarkedReviewDto[];
  initialUsersMeta: PaginationMetaDto;
  initialReviewsMeta: PaginationMetaDto;
}

export function BookmarksList({
  initialUsers,
  initialReviews,
  initialUsersMeta,
  initialReviewsMeta,
}: BookmarksListProps) {
  const { session } = useAuth();
  const [bookmarkTab, setBookmarkTab] = useState<BookmarkTab>("users");
  const [usersPage, setUsersPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);

  // Use the same limit as the initial data to ensure consistent pagination
  const usersLimit = initialUsersMeta.limit;
  const reviewsLimit = initialReviewsMeta.limit;

  // Fetch bookmarked users with pagination
  const usersQuery = useQuery({
    queryKey: ["bookmarked-users", usersPage, usersLimit],
    queryFn: async () => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.bookmarks.bookmarksControllerGetUserBookmarks(
        { page: usersPage, limit: usersLimit },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.data.data as PaginatedBookmarkedUsersDto;
    },
    enabled: !!session && usersPage > 1, // Only fetch for pages > 1
  });

  // Fetch bookmarked reviews with pagination
  const reviewsQuery = useQuery({
    queryKey: ["bookmarked-reviews", reviewsPage, reviewsLimit],
    queryFn: async () => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.bookmarks.bookmarksControllerGetReviewBookmarks(
        { page: reviewsPage, limit: reviewsLimit },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.data.data as PaginatedBookmarkedReviewsDto;
    },
    enabled: !!session && reviewsPage > 1, // Only fetch for pages > 1
  });

  // For page 1, use initial data from SSR. For other pages, use query data.
  const users = usersPage === 1 ? initialUsers : (usersQuery.data?.items ?? []);
  const usersMeta = usersPage === 1 ? initialUsersMeta : (usersQuery.data?.meta ?? initialUsersMeta);
  const reviews = reviewsPage === 1 ? initialReviews : (reviewsQuery.data?.items ?? []);
  const reviewsMeta = reviewsPage === 1 ? initialReviewsMeta : (reviewsQuery.data?.meta ?? initialReviewsMeta);

  // Show loading when fetching pages > 1
  const isUsersLoading = usersPage > 1 && usersQuery.isLoading;
  const isReviewsLoading = reviewsPage > 1 && reviewsQuery.isLoading;

  const isLoading =
    (bookmarkTab === "users" && isUsersLoading) ||
    (bookmarkTab === "reviews" && isReviewsLoading);

  return (
    <div className="rounded-sm bg-card overflow-hidden">
      {/* Pill Tabs */}
      <div className="flex gap-2 p-4">
        <button
          onClick={() => setBookmarkTab("users")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 rounded-full transition-all ${
            bookmarkTab === "users"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Users
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              bookmarkTab === "users"
                ? "bg-white/20 text-white"
                : "bg-background text-muted-foreground"
            }`}
          >
            {usersMeta.total}
          </span>
        </button>
        <button
          onClick={() => setBookmarkTab("reviews")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 rounded-full transition-all ${
            bookmarkTab === "reviews"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Reviews
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              bookmarkTab === "reviews"
                ? "bg-white/20 text-white"
                : "bg-background text-muted-foreground"
            }`}
          >
            {reviewsMeta.total}
          </span>
        </button>
      </div>

      {/* Bookmark List */}
      <div className="px-4 pb-4 space-y-2">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : bookmarkTab === "users" ? (
          users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No bookmarked users yet
            </div>
          ) : (
            <>
              {users.map((bookmarkedUser) => (
                <Link
                  key={bookmarkedUser.id}
                  to={`/users/${bookmarkedUser.username}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-all hover:-translate-y-0.5"
                >
                  <div className="h-11 w-11 rounded-lg bg-linear-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-base font-semibold text-white shrink-0 overflow-hidden">
                    {bookmarkedUser.avatarUrl ? (
                      <img
                        src={String(bookmarkedUser.avatarUrl)}
                        alt={bookmarkedUser.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      bookmarkedUser.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">@{bookmarkedUser.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {bookmarkedUser.reviewCount} reviews
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </Link>
              ))}

              {/* Users Pagination */}
              {usersMeta.totalPages > 1 && (
                <div className="pt-4 border-t border-border mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                          disabled={usersPage === 1}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm text-muted-foreground px-2">
                          Page {usersPage} of {usersMeta.totalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setUsersPage((p) => Math.min(usersMeta.totalPages, p + 1))}
                          disabled={usersPage >= usersMeta.totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No bookmarked reviews yet
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <Link
                key={review.id}
                to={`/review/${review.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-all hover:-translate-y-0.5"
              >
                <div className="h-11 w-11 rounded-lg bg-linear-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-base font-semibold text-white shrink-0 overflow-hidden">
                  {review.user.avatarUrl ? (
                    <img
                      src={String(review.user.avatarUrl)}
                      alt={review.user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    review.user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{review.title}</p>
                  <p className="text-sm text-muted-foreground">
                    by @{review.user.username}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </Link>
            ))}

            {/* Reviews Pagination */}
            {reviewsMeta.totalPages > 1 && (
              <div className="pt-4 border-t border-border mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                        disabled={reviewsPage === 1}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm text-muted-foreground px-2">
                        Page {reviewsPage} of {reviewsMeta.totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setReviewsPage((p) => Math.min(reviewsMeta.totalPages, p + 1))}
                        disabled={reviewsPage >= reviewsMeta.totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
