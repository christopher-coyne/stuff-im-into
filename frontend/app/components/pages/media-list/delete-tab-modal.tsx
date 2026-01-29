import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAuth } from "~/lib/auth-context";
import { api } from "~/lib/api/client";

interface DeleteTabModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabId: string;
  tabName: string;
  reviewCount: number;
  onSuccess: () => void;
}

export function DeleteTabModal({
  open,
  onOpenChange,
  tabId,
  tabName,
  reviewCount,
  onSuccess,
}: DeleteTabModalProps) {
  const { session } = useAuth();

  const deleteTabMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Not authenticated");
      await api.tabs.tabsControllerDeleteTab(tabId, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    },
    onSuccess: () => {
      onOpenChange(false);
      onSuccess();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Tab</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{tabName}&quot;? This will permanently delete the tab and all {reviewCount} review{reviewCount !== 1 ? "s" : ""} within it. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteTabMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteTabMutation.mutate()}
            disabled={deleteTabMutation.isPending}
          >
            {deleteTabMutation.isPending ? "Deleting..." : "Delete Tab"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
