import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabId: string;
}

export function AddCategoryModal({
  open,
  onOpenChange,
  tabId,
}: AddCategoryModalProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!session) throw new Error("Not authenticated");
      const response = await api.tabs.tabsControllerCreateCategory(
        tabId,
        { name },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", tabId] });
      handleClose();
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Failed to create category");
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setCategoryName("");
    setError("");
    createCategoryMutation.reset();
  };

  const handleSubmit = () => {
    if (!categoryName.trim()) return;
    setError("");
    createCategoryMutation.mutate(categoryName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Enter a name for your new category. Categories help organize reviews within this tab.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Category name (e.g., Favorites, Sci-Fi, Must Watch)"
            value={categoryName}
            maxLength={100}
            onChange={(e) => setCategoryName(e.target.value.slice(0, 100))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && categoryName.trim()) {
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
              disabled={!categoryName.trim() || createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
