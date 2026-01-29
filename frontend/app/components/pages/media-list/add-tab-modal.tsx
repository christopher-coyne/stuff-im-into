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

export function AddTabModal({
  open,
  onOpenChange,
  onSuccess,
}: AddTabModalProps) {
  const { session } = useAuth();
  const [tabName, setTabName] = useState("");
  const [error, setError] = useState("");

  const createTabMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.tabs.tabsControllerCreateTab(
        { name },
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
    setError("");
    createTabMutation.reset();
  };

  const handleSubmit = () => {
    if (!tabName.trim()) return;
    setError("");
    createTabMutation.mutate(tabName.trim());
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
