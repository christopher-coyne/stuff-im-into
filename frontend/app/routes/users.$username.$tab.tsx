import { useQuery } from "@tanstack/react-query";
import { GripVertical, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useSearchParams } from "react-router";
import { AddCategoryModal } from "~/components/pages/media-list/add-category-modal";
import { AddTabModal } from "~/components/pages/media-list/add-tab-modal";
import { DeleteTabModal } from "~/components/pages/media-list/delete-tab-modal";
import { EditSidebar } from "~/components/pages/media-list/edit-sidebar";
import { ProfileHeader } from "~/components/pages/media-list/profile-header";
import { ReviewsGrid } from "~/components/pages/media-list/reviews-grid";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useAuth } from "~/lib/auth-context";
import { useDebounce } from "~/hooks/use-debounce";
import { api } from "~/lib/api/client";
import { loaderFetch } from "~/lib/api/loader-fetch";
import type { CategoryDto, PaginatedReviewsDto } from "~/lib/api/api";
import { getAuthHeaders } from "~/lib/supabase/server";
import type { Route } from "./+types/users.$username.$tab";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { username, tab: tabSlug } = params;
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const categorySlug = url.searchParams.get("category") || undefined;

  if (!username) {
    throw new Response("Username is required", { status: 400 });
  }

  // Get auth headers from cookies (for SSR)
  const authHeaders = await getAuthHeaders(request);

  const userResponse = await loaderFetch(() =>
    api.users.usersControllerFindByUsername(username, { headers: authHeaders })
  );
  const user = userResponse.data.data;

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Determine current tab - use provided tab slug or default to first tab
  const currentTab = tabSlug
    ? user.tabs.find((tab) => tab.slug === tabSlug)
    : user.tabs[0];

  if (tabSlug && !currentTab) {
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
      loaderFetch(() => api.tabs.tabsControllerFindCategoriesForTab(currentTab.id)),
      loaderFetch(() => api.tabs.tabsControllerFindReviewsForTab(currentTab.id, { search }, { headers: authHeaders })),
    ]);
    categories = categoriesResponse.data.data || [];

    // If category slug is provided, find the category ID
    const categoryId = categorySlug
      ? categories.find((c) => c.slug === categorySlug)?.id
      : undefined;

    // Re-fetch reviews with category filter if needed
    if (categoryId) {
      const filteredResponse = await loaderFetch(() =>
        api.tabs.tabsControllerFindReviewsForTab(currentTab.id, { search, categoryId }, { headers: authHeaders })
      );
      reviews = filteredResponse.data.data || reviews;
    } else {
      reviews = reviewsResponse.data.data || reviews;
    }
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
  const { user: loggedInUser, session } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddTabModal, setShowAddTabModal] = useState(false);

  // Add category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Delete tab modal state
  const [showDeleteTabModal, setShowDeleteTabModal] = useState(false);

  // React Query for categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", currentTab?.id],
    queryFn: async () => {
      if (!currentTab) return [];
      const response = await api.tabs.tabsControllerFindCategoriesForTab(currentTab.id);
      return response.data.data || [];
    },
    initialData: categories,
    enabled: !!currentTab,
  });

  // Drag and drop state
  const [localTabs, setLocalTabs] = useState(user.tabs);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);

  const isOwnProfile = loggedInUser?.id === user.id;

  const selectedCategory = searchParams.get("category") || "all";

  // Sync localTabs when user data changes (e.g., navigating between profiles)
  useEffect(() => {
    setLocalTabs(user.tabs);
  }, [user.tabs]);

  // Update URL when debounced search changes
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch === currentSearch) return; // No change needed

    if (debouncedSearch) {
      searchParams.set("search", debouncedSearch);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams, { replace: true });
  }, [debouncedSearch]);

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
  };

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    if (tabId !== draggedTabId) {
      setDragOverTabId(tabId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTabId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetTabId || !session) return;

    const draggedIndex = localTabs.findIndex((t) => t.id === draggedTabId);
    const targetIndex = localTabs.findIndex((t) => t.id === targetTabId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder locally first for immediate feedback
    const newTabs = [...localTabs];
    const [draggedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);
    setLocalTabs(newTabs);

    // Reset drag state
    setDraggedTabId(null);
    setDragOverTabId(null);

    // Save to backend
    try {
      await api.tabs.tabsControllerReorderTabs(
        { tabIds: newTabs.map((t) => t.id) },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
    } catch (error) {
      console.error("Failed to reorder tabs:", error);
      // Revert on error
      setLocalTabs(user.tabs);
    }
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
        />

        {/* Main content area */}
        <main className="py-8">
        {currentTab ? (
          <div>
            {/* Tabs */}
            {localTabs.length > 0 && (
              <nav className="border-b border-border mb-6">
                <div className="flex gap-1">
                  {localTabs.map((tab) => (
                    <div
                      key={tab.id}
                      draggable={isEditMode && isOwnProfile}
                      onDragStart={(e) => handleDragStart(e, tab.id)}
                      onDragOver={(e) => handleDragOver(e, tab.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, tab.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center transition-all ${
                        draggedTabId === tab.id ? "opacity-50" : ""
                      } ${
                        dragOverTabId === tab.id ? "border-l-2 border-primary" : ""
                      }`}
                    >
                      {isEditMode && isOwnProfile && (
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab mr-1" />
                      )}
                      <Link
                        to={`/users/${user.username}/${tab.slug}`}
                        className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                          currentTab?.id === tab.id
                            ? "border-primary text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={(e) => {
                          if (isEditMode) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {tab.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </nav>
            )}

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
              {categoriesData && categoriesData.length > 0 && (
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categoriesData.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
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

      {/* Floating Edit Sidebar */}
      {isEditMode && isOwnProfile && (
        <EditSidebar
          currentTab={currentTab}
          onExitEditMode={() => setIsEditMode(false)}
          onAddTab={() => setShowAddTabModal(true)}
          onDeleteTab={() => setShowDeleteTabModal(true)}
          onAddCategory={() => setShowAddCategoryModal(true)}
        />
      )}

      <AddTabModal
        open={showAddTabModal}
        onOpenChange={setShowAddTabModal}
        onSuccess={(newTab) => navigate(`/users/${user.username}/${newTab.slug}`)}
      />

      {currentTab && (
        <AddCategoryModal
          open={showAddCategoryModal}
          onOpenChange={setShowAddCategoryModal}
          tabId={currentTab.id}
        />
      )}

      {currentTab && (
        <DeleteTabModal
          open={showDeleteTabModal}
          onOpenChange={setShowDeleteTabModal}
          tabId={currentTab.id}
          tabName={currentTab.name}
          reviewCount={reviews.items.length}
          onSuccess={() => navigate(`/users/${user.username}`)}
        />
      )}
    </div>
  );
}
