import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
import type { TabDto } from "~/lib/api/api";

interface AddTabModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newTab: TabDto) => void;
}

const TAB_NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 200;

export function AddTabModal({
  open,
  onOpenChange,
  onSuccess,
}: AddTabModalProps) {
  const { session } = useAuth();
  const [tabName, setTabName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const createTabMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.tabs.tabsControllerCreateTab(
        { name, description: description || undefined },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.data.data;
    },
    onSuccess: (newTab) => {
      if (newTab) {
        handleClose();
        onSuccess(newTab);
      }
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Failed to create tab");
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setTabName("");
    setDescription("");
    setError("");
    createTabMutation.reset();
  };

  const handleSubmit = () => {
    if (!tabName.trim()) return;
    setError("");
    createTabMutation.mutate({
      name: tabName.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              disabled={!tabName.trim() || createTabMutation.isPending}
            >
              {createTabMutation.isPending ? "Creating..." : "Create Tab"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
