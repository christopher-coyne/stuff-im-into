import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { uploadReviewImage } from "~/lib/supabase/storage";

interface ImageUploadProps {
  userId: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImageUpload({
  userId,
  currentUrl,
  onUpload,
  onRemove,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadReviewImage(file, userId);
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

  if (currentUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
        <img
          src={currentUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading || disabled}
        className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm">Click to upload image</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
