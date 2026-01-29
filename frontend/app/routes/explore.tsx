import { BookmarkCheck, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useDebounce } from "~/hooks/use-debounce";
import { api } from "~/lib/api/client";
import type { UserResponseDto } from "~/lib/api/api";
import { getAvatarGradient } from "~/lib/theme";
import { getAuthHeaders } from "~/lib/supabase/server";
import type { Route } from "./+types/explore";

const PAGE_SIZE = 5;

type SortOption = "most_popular" | "recently_active" | "newest" | "most_reviews";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "most_popular", label: "Most popular" },
  { value: "recently_active", label: "Recently active" },
  { value: "newest", label: "Newest" },
  { value: "most_reviews", label: "Most reviews" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const search = url.searchParams.get("search") || undefined;
  const sortBy = (url.searchParams.get("sortBy") as SortOption) || "most_popular";

  const authHeaders = await getAuthHeaders(request);

  const response = await api.users.usersControllerFindAll(
    { search, sortBy, page, limit: PAGE_SIZE },
    { headers: authHeaders }
  );

  return {
    users: response.data.data || [],
    page,
    search: search || "",
    sortBy,
  };
}

function UserCard({ user }: { user: UserResponseDto }) {
  const gradient = getAvatarGradient(user.theme);
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <Link to={`/users/${user.username}`} className="block">
      <Card className="p-4 hover:border-zinc-700 transition-colors">
        <div className="flex gap-4">
          {/* Avatar */}
          <div
            className={`h-12 w-12 rounded-full bg-linear-to-br ${gradient} shrink-0`}
          >
            {user.avatarUrl && (
              <img
                src={String(user.avatarUrl)}
                alt={user.username}
                className="h-full w-full rounded-full object-cover"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">@{user.username}</h3>
            <p className="text-sm text-muted-foreground">
              {user.reviewCount} reviews · Joined {joinDate}
            </p>
            {user.bio && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {String(user.bio)}
              </p>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.isBookmarked && (
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    <BookmarkCheck className="h-4 w-4" />
                  </div>
                )}
              </div>
              {user.tabs.length > 0 && (
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {user.tabs.slice(0, 3).map((tab) => (
                    <Badge key={tab.id} variant="secondary">
                      {tab.name}
                    </Badge>
                  ))}
                  {user.tabs.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{user.tabs.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function ExplorePage() {
  const { users, page, search: initialSearch, sortBy } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for search input (for debouncing)
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL when debounced search changes
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        newParams.set("search", debouncedSearch);
      } else {
        newParams.delete("search");
      }
      newParams.set("page", "1"); // Reset to page 1 on search change
      setSearchParams(newParams);
    }
  }, [debouncedSearch]);

  const handleSortChange = (value: SortOption) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortBy", value);
    newParams.set("page", "1"); // Reset to page 1 on sort change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams);
  };

  const hasNextPage = users.length === PAGE_SIZE;
  const hasPrevPage = page > 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-linear-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              Explore
            </span>
          </h1>
          <p className="text-muted-foreground">
            Discover people and their curated collections
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User List */}
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No users found</p>
              {(searchParams.get("search") || searchParams.get("sortBy") || searchParams.get("page")) && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearchParams(new URLSearchParams());
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            users.map((user) => <UserCard key={user.id} user={user} />)
          )}
        </div>

        {/* Pagination */}
        {users.length > 0 && (hasPrevPage || hasNextPage) && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!hasPrevPage}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
