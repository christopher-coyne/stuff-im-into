import { BookmarkCheck, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
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
import { loaderFetch } from "~/lib/api/loader-fetch";
import type { UserResponseDto } from "~/lib/api/api";
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

  const response = await loaderFetch(() =>
    api.users.usersControllerFindAll(
      { search, sortBy, page, limit: PAGE_SIZE },
      { headers: authHeaders }
    )
  );

  return {
    users: response.data.data || [],
    page,
    search: search || "",
    sortBy,
  };
}

function UserCard({ user }: { user: UserResponseDto }) {
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <Link to={`/users/${user.username}`} className="group block">
      <div className="relative p-5 rounded-sm bg-card shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-emerald-500">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 shrink-0 overflow-hidden ring-2 ring-border">
            {user.avatarUrl ? (
              <img
                src={String(user.avatarUrl)}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">@{user.username}</h3>
              {user.isBookmarked && (
                <BookmarkCheck className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {user.reviewCount} reviews · Joined {joinDate}
            </p>
            {user.bio && (
              <p className="mt-2 text-sm text-muted-foreground/80 line-clamp-2">
                {String(user.bio)}
              </p>
            )}

            {/* Tabs */}
            {user.tabs.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {user.tabs.slice(0, 3).map((tab) => (
                  <span
                    key={tab.id}
                    className="px-2.5 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                  >
                    {tab.name}
                  </span>
                ))}
                {user.tabs.length > 3 && (
                  <span className="text-xs text-muted-foreground/60">
                    +{user.tabs.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Discover people and their curated collections</p>

          {/* Controls */}
          <div className="flex gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg! rounded-lg"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-auto px-4 py-2 text-base rounded-lg">
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
