import { useMutation, useQuery } from "@tanstack/react-query";
import { GripVertical, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { AddCategoryModal } from "~/components/pages/media-list/add-category-modal";
import { AddTabModal } from "~/components/pages/media-list/add-tab-modal";
import { DeleteTabModal } from "~/components/pages/media-list/delete-tab-modal";
import { EditSidebar } from "~/components/pages/media-list/edit-sidebar";
import { ProfileHeader } from "~/components/pages/media-list/profile-header";
import { ReviewsGrid } from "~/components/pages/media-list/reviews-grid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useAuth } from "~/lib/auth-context";
import { useDebounce } from "~/hooks/use-debounce";
import { api } from "~/lib/api/client";
import { loaderFetch } from "~/lib/api/loader-fetch";
import type { CategoryDto, PaginatedReviewsDto } from "~/lib/api/api";
import { getAuthHeaders } from "~/lib/supabase/server";
import { getTheme, type AestheticSlug } from "~/lib/theme/themes";
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

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<{
    aesthetic: AestheticSlug;
    palette: string;
  }>(() => {
    // Initialize from user's theme if available
    const aesthetic = user.userTheme?.aesthetic?.slug;
    const palette = user.userTheme?.palette;
    return {
      aesthetic: (aesthetic as AestheticSlug) || "minimalist",
      palette: palette || "default",
    };
  });

  // Resolve the full theme object
  const theme = getTheme(currentTheme.aesthetic, currentTheme.palette);
  const { styles } = theme;

  const saveThemeMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Not authenticated");
      await api.users.usersControllerUpdateTheme(
        { aestheticSlug: currentTheme.aesthetic, palette: currentTheme.palette },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save theme";
      toast.error(message);
    },
  });

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

  // Reorder tabs mutation
  const reorderTabsMutation = useMutation({
    mutationFn: async (tabIds: string[]) => {
      if (!session) throw new Error("Not authenticated");
      await api.tabs.tabsControllerReorderTabs(
        { tabIds },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
    },
    onError: (error) => {
      // Revert on error
      setLocalTabs(user.tabs);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to reorder tabs";
      toast.error(message);
    },
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

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
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
    reorderTabsMutation.mutate(newTabs.map((t) => t.id));
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  return (
    <div>
      {/* Themed content wrapper */}
      <div className="min-h-screen" style={styles.page}>
        <div className="max-w-3xl mx-auto px-6 pt-6">
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
          currentTheme={currentTheme}
          theme={theme}
        />

        {/* Main content area */}
        <main className="py-8">
        {currentTab ? (
          <div>
            {/* Tabs */}
            {localTabs.length > 0 && (
              <nav className="mb-6" style={styles.tabBar}>
                <div className="flex gap-1">
                  {localTabs.map((tab) => {
                    const isActive = currentTab?.id === tab.id;
                    return (
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
                        }`}
                        style={{
                          borderLeft: dragOverTabId === tab.id ? `2px solid ${theme.colors.primary}` : undefined,
                        }}
                      >
                        {isEditMode && isOwnProfile && (
                          <GripVertical className="h-4 w-4 cursor-grab mr-1" style={styles.mutedText} />
                        )}
                        <Link
                          to={`/users/${user.username}/${tab.slug}`}
                          className="px-4 py-3 text-sm -mb-px transition-colors"
                          style={styles.tab(isActive)}
                          onClick={(e) => {
                            if (isEditMode) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {tab.name}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </nav>
            )}

            {/* Search and Filter */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={styles.mutedText} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm"
                  style={styles.input}
                />
              </div>
              {categoriesData && categoriesData.length > 0 && (
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[200px]" style={styles.input}>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: theme.colors.background,
                      color: theme.colors.foreground,
                      borderColor: theme.colors.border,
                      borderWidth: theme.borderWidth,
                      borderRadius: theme.borderRadius,
                      "--accent": theme.colors.muted,
                      "--accent-foreground": theme.colors.foreground,
                    } as React.CSSProperties}
                  >
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
            <ReviewsGrid
              reviews={reviews.items}
              theme={theme}
              isOwner={isOwnProfile}
              currentTabId={currentTab?.id}
            />
          </div>
        ) : (
          <div className="p-8 text-center" style={styles.card}>
            <p style={styles.mutedText}>No content yet</p>
            {isOwnProfile && (
              <button
                onClick={() => setShowAddTabModal(true)}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm"
                style={styles.button}
              >
                <Plus className="h-4 w-4" />
                Add Tab
              </button>
            )}
          </div>
        )}
        </main>
        </div>
      </div>

      {/* Floating Edit Sidebar - outside themed wrapper */}
      {isEditMode && isOwnProfile && (
        <EditSidebar
          currentTab={currentTab}
          onExitEditMode={() => setIsEditMode(false)}
          onAddTab={() => setShowAddTabModal(true)}
          onDeleteTab={() => setShowDeleteTabModal(true)}
          onAddCategory={() => setShowAddCategoryModal(true)}
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          onSaveTheme={() => saveThemeMutation.mutate()}
          isSavingTheme={saveThemeMutation.isPending}
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
