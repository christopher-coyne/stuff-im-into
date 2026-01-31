import { useMutation } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Pencil } from "lucide-react";
import { useState } from "react";
import { useRevalidator } from "react-router";
import { toast } from "sonner";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";
import type { UserResponseDto } from "~/lib/api/api";
import { AESTHETICS, type AestheticSlug, type ResolvedTheme } from "~/lib/theme/themes";

interface ProfileHeaderProps {
  user: UserResponseDto;
  isOwnProfile: boolean;
  isEditMode: boolean;
  onEditModeChange: (editing: boolean) => void;
  currentTheme?: { aesthetic: AestheticSlug; palette: string };
  theme: ResolvedTheme;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isEditMode,
  onEditModeChange,
  currentTheme,
  theme,
}: ProfileHeaderProps) {
  const { session } = useAuth();
  const revalidator = useRevalidator();
  const [showBio, setShowBio] = useState(false);
  const { styles } = theme;

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Get theme display name
  const themeName = currentTheme
    ? AESTHETICS[currentTheme.aesthetic]?.name ?? "Unknown"
    : null;
  const paletteName = currentTheme?.palette ?? "default";

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
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update bookmark";
      toast.error(message);
    },
  });

  return (
    <header className="px-6 py-8" style={styles.header}>
      <div className="flex items-center gap-6">
        {/* Profile Picture */}
        <div className="h-20 w-20 shrink-0 overflow-hidden" style={styles.avatar}>
          {user.avatarUrl ? (
            <img
              src={String(user.avatarUrl)}
              alt={user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-2xl"
              style={styles.avatarFallback}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Username and Join Date */}
        <div className="flex-1">
          <h1 className="text-2xl" style={styles.headerText}>
            @{user.username}
          </h1>
          <p className="text-sm" style={styles.headerTextMuted}>
            Joined {joinDate}
          </p>
          {themeName && (
            <p className="text-xs mt-1" style={{ ...styles.headerTextMuted, opacity: 0.6 }}>
              {themeName} · <span className="capitalize">{paletteName}</span>
            </p>
          )}
        </div>

        {/* About Button */}
        {user.bio && (
          <button
            onClick={() => setShowBio(!showBio)}
            className="px-3 py-1.5 text-sm"
            style={styles.button}
          >
            {showBio ? "Hide" : "About"}
          </button>
        )}

        {/* Bookmark Button (only for other users' profiles) */}
        {session && !isOwnProfile && (
          <button
            onClick={() => bookmarkUserMutation.mutate(!user.isBookmarked)}
            disabled={bookmarkUserMutation.isPending}
            className="p-2"
            style={{
              ...styles.buttonIcon,
              color: user.isBookmarked ? theme.colors.accent : theme.colors.foreground,
              opacity: bookmarkUserMutation.isPending ? 0.5 : 1,
            }}
          >
            {user.isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Edit / View Mode Button (only for own profile) */}
        {isOwnProfile && (
          isEditMode ? (
            <button
              onClick={() => onEditModeChange(false)}
              className="px-3 py-1.5 text-sm"
              style={styles.button}
            >
              View mode
            </button>
          ) : (
            <button
              onClick={() => onEditModeChange(true)}
              className="p-2"
              style={styles.buttonIcon}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {/* Bio (collapsible) */}
      {showBio && user.bio && (
        <div className="mt-4 p-4" style={styles.card}>
          {String(user.bio)}
        </div>
      )}
    </header>
  );
}
