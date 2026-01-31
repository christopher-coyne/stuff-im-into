import { useMutation } from "@tanstack/react-query";
import { ChevronRight, LogOut, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, redirect, useLoaderData, useNavigate } from "react-router";
import { AvatarUpload } from "~/components/profile/avatar-upload";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";
import { loaderFetch } from "~/lib/api/loader-fetch";
import { getAuthHeaders } from "~/lib/supabase/server";
import type { Route } from "./+types/profile";

export function meta() {
  return [
    { title: "Profile | Stuffiminto" },
    { name: "description", content: "Manage your account and bookmarks" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const authHeaders = await getAuthHeaders(request);

  // Check if user is authenticated by looking for Authorization header
  if (!("Authorization" in authHeaders)) {
    throw redirect("/");
  }

  // Fetch both user and review bookmarks in parallel
  const [usersRes, reviewsRes] = await Promise.all([
    loaderFetch(() =>
      api.bookmarks.bookmarksControllerGetUserBookmarks({ headers: authHeaders })
    ).catch(() => null),
    loaderFetch(() =>
      api.bookmarks.bookmarksControllerGetReviewBookmarks({ headers: authHeaders })
    ).catch(() => null),
  ]);

  return {
    bookmarkedUsers: (usersRes?.data?.data || []) as BookmarkedUser[],
    bookmarkedReviews: (reviewsRes?.data?.data || []) as BookmarkedReview[],
  };
}

interface BookmarkedUser {
  id: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
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
  };
}

type BookmarkTab = "users" | "reviews";

export default function ProfilePage() {
  const { bookmarkedUsers, bookmarkedReviews } = useLoaderData<typeof loader>();
  const { logout, user, session, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");

  // Avatar upload mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!session) throw new Error("Not authenticated");
      await api.users.usersControllerUpdateMe(
        { avatarUrl },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
    },
    onSuccess: () => {
      refreshUser();
    },
  });

  // Bio update mutation
  const updateBioMutation = useMutation({
    mutationFn: async (bio: string) => {
      if (!session) throw new Error("Not authenticated");
      await api.users.usersControllerUpdateMe(
        { bio },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
    },
    onSuccess: () => {
      refreshUser();
      setIsEditing(false);
    },
  });

  // Bookmarks tab state
  const [bookmarkTab, setBookmarkTab] = useState<BookmarkTab>("users");

  const BIO_MAX_LENGTH = 160;

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleStartEdit = () => {
    setEditBio(String(user?.bio || ""));
    updateBioMutation.reset();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditBio("");
    updateBioMutation.reset();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

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
                {isEditing && user ? (
                  <AvatarUpload
                    userId={user.id}
                    currentUrl={user.avatarUrl ? String(user.avatarUrl) : null}
                    username={user.username}
                    onUpload={(url) => updateAvatarMutation.mutate(url)}
                    disabled={updateAvatarMutation.isPending}
                    size="lg"
                  />
                ) : (
                  <div
                    className="h-20 w-20 rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-2xl font-semibold text-white shrink-0"
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
                )}

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
                      {updateBioMutation.error && (
                        <p className="text-sm text-destructive">
                          {(updateBioMutation.error as { response?: { data?: { message?: string } } })
                            ?.response?.data?.message || "Failed to save changes"}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateBioMutation.mutate(editBio)}
                          disabled={updateBioMutation.isPending}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          {updateBioMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={updateBioMutation.isPending}
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
                          to={`/users/${user.username}`}
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
                {bookmarkTab === "users" ? (
                  bookmarkedUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No bookmarked users yet
                    </div>
                  ) : (
                    bookmarkedUsers.map((bookmarkedUser) => (
                        <Link
                          key={bookmarkedUser.id}
                          to={`/users/${bookmarkedUser.username}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
                        >
                          <div
                            className="h-12 w-12 rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-lg font-semibold text-white shrink-0"
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
                      )
                    )
                  )
                ) : bookmarkedReviews.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No bookmarked reviews yet
                  </div>
                ) : (
                  bookmarkedReviews.map((review) => (
                      <Link
                        key={review.id}
                        to={`/review/${review.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
                      >
                        <div
                          className="h-12 w-12 rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-lg font-semibold text-white shrink-0"
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
                    ))
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
            <Link to={user ? `/users/${user.username}` : "/"}>View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
