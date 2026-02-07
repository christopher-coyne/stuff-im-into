import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";

const TAB_NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 200;

interface EditTabModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabId: string;
  currentName: string;
  currentDescription: string | null | undefined;
  onSuccess: (newSlug: string) => void;
}

export function EditTabModal({
  open,
  onOpenChange,
  tabId,
  currentName,
  currentDescription,
  onSuccess,
}: EditTabModalProps) {
  const { session } = useAuth();
  const [tabName, setTabName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || "");
  const [error, setError] = useState("");

  // Sync state when props change (e.g., navigating to different tab)
  useEffect(() => {
    setTabName(currentName);
    setDescription(currentDescription || "");
  }, [currentName, currentDescription]);

  const updateTabMutation = useMutation({
    mutationFn: async ({ name, description }: { name?: string; description?: string }) => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.tabs.tabsControllerUpdateTab(
        tabId,
        { name, description },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.data.data;
    },
    onSuccess: (updatedTab) => {
      if (updatedTab) {
        handleClose();
        onSuccess(updatedTab.slug);
      }
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Failed to update tab");
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setTabName(currentName);
    setDescription(currentDescription || "");
    setError("");
    updateTabMutation.reset();
  };

  // Reset state when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTabName(currentName);
      setDescription(currentDescription || "");
      setError("");
    } else {
      handleClose();
    }
  };

  const handleSubmit = () => {
    if (!tabName.trim()) return;

    const nameChanged = tabName.trim() !== currentName;
    const descriptionChanged = (description.trim() || null) !== (currentDescription || null);

    // If nothing changed, just close
    if (!nameChanged && !descriptionChanged) {
      handleClose();
      return;
    }

    setError("");
    updateTabMutation.mutate({
      name: nameChanged ? tabName.trim() : undefined,
      description: descriptionChanged ? description.trim() : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tab</DialogTitle>
          <DialogDescription>
            Update the name and description for this tab.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Tab name"
            value={tabName}
            maxLength={TAB_NAME_MAX_LENGTH}
            onChange={(e) => setTabName(e.target.value.slice(0, TAB_NAME_MAX_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tabName.trim()) {
                handleSubmit();
              }
            }}
          />
          <div className="space-y-2">
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
              rows={2}
              className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length} / {DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!tabName.trim() || updateTabMutation.isPending}
            >
              {updateTabMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
