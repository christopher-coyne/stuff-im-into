import { ChevronRight, LogOut, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";

export function meta() {
  return [
    { title: "Profile | Stuffiminto" },
    { name: "description", content: "Manage your account and bookmarks" },
  ];
}

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

interface BookmarkedUser {
  id: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  theme: string;
  reviewCount: number;
  bookmarkedAt: string;
}

interface BookmarkedReview {
  id: string;
  title: string;
  description?: string | null;
  mediaType: string;
  mediaUrl?: string | null;
  bookmarkedAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string | null;
    theme: string;
  };
}

type BookmarkTab = "users" | "reviews";

export default function ProfilePage() {
  const { isAuthenticated, isLoading, logout, user, session, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Bookmarks state
  const [bookmarkTab, setBookmarkTab] = useState<BookmarkTab>("users");
  const [bookmarkedUsers, setBookmarkedUsers] = useState<BookmarkedUser[]>([]);
  const [bookmarkedReviews, setBookmarkedReviews] = useState<BookmarkedReview[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  const BIO_MAX_LENGTH = 160;

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!session) return;

      setLoadingBookmarks(true);
      try {
        const headers = { Authorization: `Bearer ${session.access_token}` };

        // Fetch both user and review bookmarks
        const [usersRes, reviewsRes] = await Promise.all([
          api.bookmarks?.bookmarksControllerGetUserBookmarks?.({ headers }).catch(() => null),
          api.bookmarks?.bookmarksControllerGetReviewBookmarks?.({ headers }).catch(() => null),
        ]);

        if (usersRes?.data?.data) {
          setBookmarkedUsers(usersRes.data.data as unknown as BookmarkedUser[]);
        }
        if (reviewsRes?.data?.data) {
          setBookmarkedReviews(reviewsRes.data.data as unknown as BookmarkedReview[]);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setLoadingBookmarks(false);
      }
    };

    fetchBookmarks();
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleStartEdit = () => {
    setEditBio(String(user?.bio || ""));
    setSaveError("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditBio("");
    setSaveError("");
  };

  const handleSaveBio = async () => {
    if (!session) {
      setSaveError("No session");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      console.log("Saving bio:", editBio);
      const response = await api.users.usersControllerUpdateMe(
        { bio: editBio },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      console.log("Save response:", response);
      await refreshUser();
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setSaveError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const gradient = user?.theme
    ? themeGradients[user.theme] || themeGradients.DEFAULT
    : themeGradients.DEFAULT;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Your account and bookmarks</p>
        </div>

        {/* Profile Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Profile
          </h2>

          <Card>
            <CardContent className="pt-6">
              {/* User Header */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={`h-20 w-20 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-2xl font-semibold text-white shrink-0`}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={String(user.avatarUrl)}
                      alt={user.username}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    user?.username?.charAt(0).toUpperCase()
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-semibold">@{user?.username}</h3>
                      <p className="text-muted-foreground text-sm">
                        Joined {user?.createdAt ? formatJoinDate(user.createdAt) : ""}
                      </p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={handleStartEdit}
                        className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit profile"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-3 space-y-3">
                      <div className="space-y-2">
                        <label htmlFor="bio" className="text-sm font-medium">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
                          placeholder="Tell us about yourself"
                          rows={3}
                          className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {editBio.length} / {BIO_MAX_LENGTH}
                        </p>
                      </div>
                      {saveError && (
                        <p className="text-sm text-destructive">{saveError}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveBio}
                          disabled={isSaving}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {user?.bio && (
                        <p className="text-sm mt-2">{String(user.bio)}</p>
                      )}
                      {user && (
                        <Link
                          to={`/${user.username}`}
                          className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-500 text-sm font-medium hover:bg-amber-500/30 transition-colors"
                        >
                          View my media
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookmarks Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Bookmarks
          </h2>

          <Card>
            <CardContent className="pt-0 px-0">
              {/* Tabs */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setBookmarkTab("users")}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                    bookmarkTab === "users"
                      ? "border-amber-500 text-amber-500"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Users
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      bookmarkTab === "users"
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {bookmarkedUsers.length}
                  </span>
                </button>
                <button
                  onClick={() => setBookmarkTab("reviews")}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                    bookmarkTab === "reviews"
                      ? "border-amber-500 text-amber-500"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Reviews
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      bookmarkTab === "reviews"
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {bookmarkedReviews.length}
                  </span>
                </button>
              </div>

              {/* Bookmark List */}
              <div className="divide-y divide-border">
                {loadingBookmarks ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading bookmarks...
                  </div>
                ) : bookmarkTab === "users" ? (
                  bookmarkedUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No bookmarked users yet
                    </div>
                  ) : (
                    bookmarkedUsers.map((bookmarkedUser) => {
                      const userGradient =
                        themeGradients[bookmarkedUser.theme] || themeGradients.DEFAULT;
                      return (
                        <Link
                          key={bookmarkedUser.id}
                          to={`/${bookmarkedUser.username}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
                        >
                          <div
                            className={`h-12 w-12 rounded-full bg-linear-to-br ${userGradient} flex items-center justify-center text-lg font-semibold text-white shrink-0`}
                          >
                            {bookmarkedUser.avatarUrl ? (
                              <img
                                src={bookmarkedUser.avatarUrl}
                                alt={bookmarkedUser.username}
                                className="h-full w-full rounded-full object-cover"
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
                      );
                    })
                  )
                ) : bookmarkedReviews.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No bookmarked reviews yet
                  </div>
                ) : (
                  bookmarkedReviews.map((review) => {
                    const reviewUserGradient =
                      themeGradients[review.user.theme] || themeGradients.DEFAULT;
                    return (
                      <Link
                        key={review.id}
                        to={`/review/${review.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
                      >
                        <div
                          className={`h-12 w-12 rounded-full bg-linear-to-br ${reviewUserGradient} flex items-center justify-center text-lg font-semibold text-white shrink-0`}
                        >
                          {review.user.avatarUrl ? (
                            <img
                              src={review.user.avatarUrl}
                              alt={review.user.username}
                              className="h-full w-full rounded-full object-cover"
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
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>

          <Button
            asChild
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Link to={user ? `/${user.username}` : "/"}>View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
