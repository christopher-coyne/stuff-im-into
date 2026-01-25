import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, GripVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useRevalidator, useSearchParams } from "react-router";
import { ReviewsGrid } from "~/components/pages/media-list/reviews-grid";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useAuth } from "~/lib/auth-context";
import { useDebounce } from "~/hooks/use-debounce";
import { api } from "~/lib/api/client";
import type { CategoryDto, PaginatedReviewsDto } from "~/lib/api/api";
import { getHeaderGradient, themeHeaderGradients } from "~/lib/theme";
import { getAuthHeaders } from "~/lib/supabase/server";
import type { Route } from "./+types/$username.$tab";

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

  const response = await api.users.usersControllerFindByUsername(username, {
    headers: authHeaders,
  });
  const user = response.data.data;

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
      api.tabs.tabsControllerFindCategoriesForTab(currentTab.id),
      api.tabs.tabsControllerFindReviewsForTab(currentTab.id, { search }, { headers: authHeaders }),
    ]);
    categories = categoriesResponse.data.data || [];

    // If category slug is provided, find the category ID
    const categoryId = categorySlug
      ? categories.find((c) => c.slug === categorySlug)?.id
      : undefined;

    // Re-fetch reviews with category filter if needed
    if (categoryId) {
      const filteredResponse = await api.tabs.tabsControllerFindReviewsForTab(currentTab.id, { search, categoryId }, { headers: authHeaders });
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
  const [showBio, setShowBio] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [isCreatingTab, setIsCreatingTab] = useState(false);
  const [tabError, setTabError] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>(user.theme || "DEFAULT");

  // Add category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Delete tab modal state
  const [showDeleteTabModal, setShowDeleteTabModal] = useState(false);

  // Bookmark state
  const [optimisticBookmarked, setOptimisticBookmarked] = useState<boolean | null>(null);
  const revalidator = useRevalidator();
  const isUserBookmarked = optimisticBookmarked ?? user.isBookmarked;

  // React Query for categories
  const queryClient = useQueryClient();

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

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!currentTab || !session) throw new Error("Not authenticated");
      const response = await api.tabs.tabsControllerCreateCategory(
        currentTab.id,
        { name },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", currentTab?.id] });
      setShowAddCategoryModal(false);
      setNewCategoryName("");
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (theme: string) => {
      if (!session) throw new Error("Not authenticated");
      await api.users.usersControllerUpdateMe(
        { theme: theme as "DEFAULT" | "EMBER" | "OCEAN" | "FOREST" | "VIOLET" | "ROSE" | "MINIMAL" },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
    },
    onError: () => {
      // Revert to original theme on error
      setSelectedTheme(user.theme || "DEFAULT");
    },
  });

  // Bookmark user mutation
  const bookmarkUserMutation = useMutation({
    mutationFn: async (shouldBookmark: boolean) => {
      if (!session) throw new Error("Not authenticated");
      if (shouldBookmark) {
        await api.bookmarks.bookmarksControllerBookmarkUser(user.id, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } else {
        await api.bookmarks.bookmarksControllerUnbookmarkUser(user.id, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }
    },
    onMutate: (shouldBookmark) => {
      setOptimisticBookmarked(shouldBookmark);
    },
    onError: () => {
      setOptimisticBookmarked(null);
    },
    onSuccess: () => {
      revalidator.revalidate();
      setOptimisticBookmarked(null);
    },
  });

  // Delete tab mutation
  const deleteTabMutation = useMutation({
    mutationFn: async (tabId: string) => {
      if (!session) throw new Error("Not authenticated");
      await api.tabs.tabsControllerDeleteTab(tabId, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    },
    onSuccess: () => {
      setShowDeleteTabModal(false);
      // Navigate to user's profile (first tab or profile page)
      const remainingTabs = localTabs.filter((t) => t.id !== currentTab?.id);
      if (remainingTabs.length > 0) {
        navigate(`/${user.username}/${remainingTabs[0].slug}`);
      } else {
        navigate(`/${user.username}`);
      }
    },
  });

  const handleDeleteTab = () => {
    if (currentTab) {
      deleteTabMutation.mutate(currentTab.id);
    }
  };

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

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme); // Optimistic update
    updateThemeMutation.mutate(theme);
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

  const handleCreateTab = async () => {
    if (!session || !newTabName.trim()) return;

    setIsCreatingTab(true);
    setTabError("");

    try {
      const response = await api.tabs.tabsControllerCreateTab(
        { name: newTabName.trim() },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      if (response.data?.data) {
        setShowAddTabModal(false);
        setNewTabName("");
        // Navigate to the new tab
        navigate(`/${user.username}/${response.data.data.slug}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setTabError(err.response?.data?.message || "Failed to create tab");
    } finally {
      setIsCreatingTab(false);
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate(newCategoryName.trim());
  };

  const gradient = getHeaderGradient(selectedTheme);
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 pt-6">
        {/* Header */}
        <header className={`bg-gradient-to-br ${gradient} px-6 py-8 rounded-xl`}>
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

            {/* Bookmark Button (only for other users' profiles) */}
            {session && !isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => bookmarkUserMutation.mutate(!isUserBookmarked)}
                disabled={bookmarkUserMutation.isPending}
                className={`bg-white/10 border-white/20 hover:bg-white/20 ${
                  isUserBookmarked ? "text-amber-400" : "text-white"
                }`}
              >
                {isUserBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Edit Button (only for own profile, hidden when in edit mode) */}
            {isOwnProfile && !isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Bio (collapsible) */}
          {showBio && user.bio && (
            <div className="mt-4 p-4 rounded-lg bg-black/20 text-white/90">
              {String(user.bio)}
            </div>
          )}
        </header>

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
                        to={`/${user.username}/${tab.slug}`}
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
              {isEditMode && isOwnProfile && (
                <Button variant="outline" onClick={() => setShowAddCategoryModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )}
              {isEditMode && isOwnProfile && currentTab && (
                <Link to={`/reviews/add?tab=${currentTab.id}`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Review
                  </Button>
                </Link>
              )}
            </div>

            {/* Reviews Grid */}
            <ReviewsGrid reviews={reviews.items} theme={user.theme} />

            {/* Delete Tab (only in edit mode) */}
            {isEditMode && isOwnProfile && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this tab and all its reviews
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteTabModal(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Tab
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No tabs yet</p>
        )}
        </main>
      </div>

      {/* Sticky Edit Navbar */}
      {isEditMode && isOwnProfile && (
        <div className="fixed top-0 left-0 right-0 bg-background border-b border-border p-4 z-50">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button variant="outline" onClick={() => setIsEditMode(false)}>
              Exit Edit Mode
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Theme:</span>
                <Select value={selectedTheme} onValueChange={handleThemeChange} disabled={updateThemeMutation.isPending}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(themeHeaderGradients).map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme.charAt(0) + theme.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowAddTabModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tab
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tab Modal */}
      <Dialog open={showAddTabModal} onOpenChange={setShowAddTabModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tab</DialogTitle>
            <DialogDescription>
              Enter a name for your new tab. This will create a new section on your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Tab name (e.g., Movies, Books, Music)"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTabName.trim()) {
                  handleCreateTab();
                }
              }}
            />
            {tabError && (
              <p className="text-sm text-destructive">{tabError}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddTabModal(false);
                  setNewTabName("");
                  setTabError("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTab}
                disabled={!newTabName.trim() || isCreatingTab}
              >
                {isCreatingTab ? "Creating..." : "Create Tab"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Enter a name for your new category. Categories help organize reviews within this tab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Category name (e.g., Favorites, Sci-Fi, Must Watch)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCategoryName.trim()) {
                  handleCreateCategory();
                }
              }}
            />
            {createCategoryMutation.error && (
              <p className="text-sm text-destructive">
                {(createCategoryMutation.error as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message || "Failed to create category"}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName("");
                  createCategoryMutation.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Tab Confirmation Modal */}
      <Dialog open={showDeleteTabModal} onOpenChange={setShowDeleteTabModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tab</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{currentTab?.name}&quot;? This will permanently delete the tab and all {reviews.items.length} review{reviews.items.length !== 1 ? "s" : ""} within it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteTabModal(false)}
              disabled={deleteTabMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTab}
              disabled={deleteTabMutation.isPending}
            >
              {deleteTabMutation.isPending ? "Deleting..." : "Delete Tab"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
