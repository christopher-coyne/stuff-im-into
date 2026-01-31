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

interface RenameTabModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabId: string;
  currentName: string;
  onSuccess: (newSlug: string) => void;
}

export function RenameTabModal({
  open,
  onOpenChange,
  tabId,
  currentName,
  onSuccess,
}: RenameTabModalProps) {
  const { session } = useAuth();
  const [tabName, setTabName] = useState(currentName);
  const [error, setError] = useState("");

  // Sync state when currentName prop changes (e.g., navigating to different tab)
  useEffect(() => {
    setTabName(currentName);
  }, [currentName]);

  const renameTabMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.tabs.tabsControllerUpdateTab(
        tabId,
        { name },
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
      setError(axiosError.response?.data?.message || "Failed to rename tab");
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setTabName(currentName);
    setError("");
    renameTabMutation.reset();
  };

  // Reset tab name when modal opens with new current name
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTabName(currentName);
      setError("");
    } else {
      handleClose();
    }
  };

  const handleSubmit = () => {
    if (!tabName.trim()) return;
    if (tabName.trim() === currentName) {
      handleClose();
      return;
    }
    setError("");
    renameTabMutation.mutate(tabName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Tab</DialogTitle>
          <DialogDescription>
            Enter a new name for this tab.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Tab name"
            value={tabName}
            onChange={(e) => setTabName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tabName.trim()) {
                handleSubmit();
              }
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!tabName.trim() || renameTabMutation.isPending}
            >
              {renameTabMutation.isPending ? "Renaming..." : "Rename Tab"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
