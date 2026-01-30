import { useMutation } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Pencil } from "lucide-react";
import { useState } from "react";
import { useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";
import type { UserResponseDto } from "~/lib/api/api";
import { getHeaderGradient } from "~/lib/theme";

interface ProfileHeaderProps {
  user: UserResponseDto;
  theme: string;
  isOwnProfile: boolean;
  isEditMode: boolean;
  onEditModeChange: (editing: boolean) => void;
}

export function ProfileHeader({
  user,
  theme,
  isOwnProfile,
  isEditMode,
  onEditModeChange,
}: ProfileHeaderProps) {
  const { session } = useAuth();
  const revalidator = useRevalidator();
  const [showBio, setShowBio] = useState(false);

  const gradient = getHeaderGradient(theme);
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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
    onSuccess: () => {
      revalidator.revalidate();
    },
  });

  return (
    <header className={`bg-linear-to-br ${gradient} px-6 py-8 rounded-xl`}>
      <div className="flex items-center gap-6">
        {/* Profile Picture */}
        <div className="h-20 w-20 rounded-full bg-white/20 shrink-0 overflow-hidden">
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
            onClick={() => bookmarkUserMutation.mutate(!user.isBookmarked)}
            disabled={bookmarkUserMutation.isPending}
            className={`bg-white/10 border-white/20 hover:bg-white/20 ${
              user.isBookmarked ? "text-amber-400" : "text-white"
            }`}
          >
            {user.isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Edit / View Mode Button (only for own profile) */}
        {isOwnProfile && (
          isEditMode ? (
            <Button
              size="sm"
              onClick={() => onEditModeChange(false)}
              className="bg-black text-white hover:bg-black/90"
            >
              View mode
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditModeChange(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )
        )}
      </div>

      {/* Bio (collapsible) */}
      {showBio && user.bio && (
        <div className="mt-4 p-4 rounded-lg bg-black/20 text-white/90">
          {String(user.bio)}
        </div>
      )}
    </header>
  );
}
