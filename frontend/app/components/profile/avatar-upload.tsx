import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadAvatar } from "~/lib/cloudflare/upload";
import { useAuth } from "~/lib/auth-context";

interface AvatarUploadProps {
  currentUrl?: string | null;
  username: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

export function AvatarUpload({
  currentUrl,
  username,
  onUpload,
  disabled = false,
  size = "md",
}: AvatarUploadProps) {
  const { session } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!session?.access_token) {
      setError("Not authenticated");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadAvatar(file, session.access_token);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading || disabled}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-white/20 group disabled:cursor-not-allowed`}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={username}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/60 text-2xl font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Overlay - always visible when uploading, otherwise on hover */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
          isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
