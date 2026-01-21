import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { ReviewsGrid } from "~/components/pages/media-list/reviews-grid";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useDebounce } from "~/hooks/use-debounce";
import { api } from "~/lib/api/client";
import type { CategoryDto, PaginatedReviewsDto } from "~/lib/api/api";
import type { Route } from "./+types/$username.$tabId";

// Theme gradient colors for header background
const themeGradients: Record<string, string> = {
  DEFAULT: "from-gray-600 to-gray-800",
  EMBER: "from-amber-600 to-orange-800",
  OCEAN: "from-cyan-600 to-blue-800",
  FOREST: "from-emerald-600 to-green-800",
  VIOLET: "from-violet-600 to-purple-800",
  ROSE: "from-rose-600 to-pink-800",
  MINIMAL: "from-zinc-600 to-zinc-800",
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const { username, tabId } = params;
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const categoryId = url.searchParams.get("category") || undefined;

  if (!username) {
    throw new Response("Username is required", { status: 400 });
  }

  const response = await api.users.usersControllerFindByUsername(username);
  const user = response.data.data;

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Determine current tab - use provided tabId or default to first tab
  const currentTab = tabId
    ? user.tabs.find((tab) => tab.id === tabId)
    : user.tabs[0];

  if (tabId && !currentTab) {
    throw new Response("Tab not found", { status: 404 });
  }

  // Fetch categories and reviews for the current tab
  let categories: CategoryDto[] = [];
  let reviews: PaginatedReviewsDto = {
    items: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  };

  if (currentTab) {
    const [categoriesResponse, reviewsResponse] = await Promise.all([
      api.tabs.tabsControllerFindCategoriesForTab(currentTab.id),
      api.tabs.tabsControllerFindReviewsForTab(currentTab.id, { search, categoryId }),
    ]);
    categories = categoriesResponse.data.data || [];
    reviews = reviewsResponse.data.data || reviews;
  }

  return { user, currentTab: currentTab || null, categories, reviews };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.user) {
    return [{ title: "User not found" }];
  }
  const tabSuffix = data.currentTab ? ` - ${data.currentTab.name}` : "";
  return [
    { title: `${data.user.username}${tabSuffix} | Stuffiminto` },
    { name: "description", content: data.user.bio || `Check out what ${data.user.username} is into.` },
  ];
}

export default function MediaListPage() {
  const { user, currentTab, categories, reviews } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showBio, setShowBio] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);

  const selectedCategory = searchParams.get("category") || "all";

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch) {
      searchParams.set("search", debouncedSearch);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  }, [debouncedSearch]);

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
  };

  const gradient = themeGradients[user.theme] || themeGradients.DEFAULT;
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`bg-gradient-to-br ${gradient} px-6 py-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="h-20 w-20 rounded-full bg-white/20 flex-shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={String(user.avatarUrl)}
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/60 text-2xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Username and Join Date */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">@{user.username}</h1>
              <p className="text-white/70 text-sm">Joined {joinDate}</p>
            </div>

            {/* About Button */}
            {user.bio && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBio(!showBio)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {showBio ? "Hide" : "About"}
              </Button>
            )}
          </div>

          {/* Bio (collapsible) */}
          {showBio && user.bio && (
            <div className="mt-4 p-4 rounded-lg bg-black/20 text-white/90">
              {String(user.bio)}
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      {user.tabs.length > 0 && (
        <nav className="border-b">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex gap-1">
              {user.tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={`/${user.username}/${tab.id}`}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    currentTab?.id === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main content area */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentTab ? (
          <div>
            {/* Search and Filter */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {categories.length > 0 && (
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Reviews Grid */}
            <ReviewsGrid reviews={reviews.items} />
          </div>
        ) : (
          <p className="text-muted-foreground">No tabs yet</p>
        )}
      </main>
    </div>
  );
}
