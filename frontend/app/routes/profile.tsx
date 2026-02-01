import { useMutation } from "@tanstack/react-query";
import { ChevronRight, LogOut, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, redirect, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";
import { AvatarUpload } from "~/components/profile/avatar-upload";
import { BookmarksList } from "~/components/profile/bookmarks-list";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";
import type { PaginationMetaDto } from "~/lib/api/api";
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

  // Fetch both user and review bookmarks in parallel with pagination
  const [usersRes, reviewsRes] = await Promise.all([
    loaderFetch(() =>
      api.bookmarks.bookmarksControllerGetUserBookmarks(
        { page: 1, limit: 5 },
        { headers: authHeaders }
      )
    ),
    loaderFetch(() =>
      api.bookmarks.bookmarksControllerGetReviewBookmarks(
        { page: 1, limit: 5 },
        { headers: authHeaders }
      )
    )
  ]);

  const usersData = usersRes?.data?.data;
  const reviewsData = reviewsRes?.data?.data;

  const defaultMeta: PaginationMetaDto = { page: 1, limit: 10, total: 0, totalPages: 0 };

  return {
    bookmarkedUsers: usersData?.items ?? [],
    bookmarkedReviews: reviewsData?.items ?? [],
    usersMeta: usersData?.meta ?? defaultMeta,
    reviewsMeta: reviewsData?.meta ?? defaultMeta,
  };
}

export default function ProfilePage() {
  const { bookmarkedUsers, bookmarkedReviews, usersMeta, reviewsMeta } = useLoaderData<typeof loader>();
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
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update avatar";
      toast.error(message);
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
      toast.success("Profile updated");
    },
  });

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
          <p className="text-sm text-muted-foreground mt-1">Your account and bookmarks</p>
        </div>

        {/* Profile Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Your profile
          </h2>

          <div className="p-5 rounded-sm bg-card">
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
                        <button
                          onClick={() => updateBioMutation.mutate(editBio)}
                          disabled={updateBioMutation.isPending}
                          className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateBioMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updateBioMutation.isPending}
                          className="px-4 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
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
                          className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                        >
                          View my media
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Bookmarks Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Bookmarks
          </h2>

          <BookmarksList
            initialUsers={bookmarkedUsers}
            initialReviews={bookmarkedReviews}
            initialUsersMeta={usersMeta}
            initialReviewsMeta={reviewsMeta}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>

          <Link
            to={user ? `/users/${user.username}` : "/"}
            className="px-6 py-2.5 rounded-full bg-foreground text-background font-medium hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
