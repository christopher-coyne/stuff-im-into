import { useQuery } from "@tanstack/react-query";
import { Heart, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Api } from "~/lib/api/api";
import type { UserResponseDto } from "~/lib/api/api";

const api = new Api({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000" });

type SortOption = "most_popular" | "recently_active" | "newest" | "most_reviews";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "most_popular", label: "Most popular" },
  { value: "recently_active", label: "Recently active" },
  { value: "newest", label: "Newest" },
  { value: "most_reviews", label: "Most reviews" },
];

// Theme gradient colors for avatars
const themeGradients: Record<string, string> = {
  DEFAULT: "from-gray-400 to-gray-600",
  EMBER: "from-amber-400 to-orange-600",
  OCEAN: "from-cyan-400 to-blue-600",
  FOREST: "from-emerald-400 to-green-600",
  VIOLET: "from-violet-400 to-purple-600",
  ROSE: "from-rose-400 to-pink-600",
  MINIMAL: "from-zinc-400 to-zinc-600",
};

function UserCard({ user }: { user: UserResponseDto }) {
  const gradient = themeGradients[user.theme] || themeGradients.DEFAULT;
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <Link to={`/@${user.username}`} className="block">
      <Card className="p-4 hover:border-zinc-700 transition-colors">
        <div className="flex gap-4">
          {/* Avatar */}
          <div
            className={`h-12 w-12 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0`}
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
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Heart className="h-4 w-4" />
                <span>{user.bookmarkCount}</span>
              </div>
              {user.tabNames.length > 0 && (
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {user.tabNames.slice(0, 3).map((tab) => (
                    <Badge key={tab} variant="secondary">
                      {tab}
                    </Badge>
                  ))}
                  {user.tabNames.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{user.tabNames.length - 3}
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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("most_popular");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", search, sortBy],
    queryFn: async () => {
      const response = await api.users.usersControllerFindAll({
        search: search || undefined,
        sortBy,
      });
      return response.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-background border border-input rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* User List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found
            </div>
          ) : (
            users.map((user) => <UserCard key={user.id} user={user} />)
          )}
        </div>
      </div>
    </div>
  );
}
