import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface EditSidebarProps {
  currentTab: { id: string; name: string } | null;
  onExitEditMode: () => void;
  onAddTab: () => void;
  onDeleteTab: () => void;
  onAddCategory: () => void;
}

export function EditSidebar({
  currentTab,
  onExitEditMode,
  onAddTab,
  onDeleteTab,
  onAddCategory,
}: EditSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const truncatedTabName = currentTab
    ? currentTab.name.length > 20
      ? `${currentTab.name.slice(0, 20)}...`
      : currentTab.name
    : null;

  return (
    <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end">
      {/* Edit Panel */}
      {isOpen && (
        <div className="bg-background border border-border rounded-lg shadow-lg overflow-hidden mb-2 w-72">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Edit Mode</span>
            <button
              onClick={onExitEditMode}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="space-y-5">
              {/* Tabs Section */}
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Tabs {truncatedTabName && (
                    <span className="normal-case">({truncatedTabName})</span>
                  )}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={onAddTab}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Tab
                  </button>
                  <button
                    onClick={onDeleteTab}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Tab
                  </button>
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Reviews
                </div>
                <div className="space-y-1">
                  {currentTab && (
                    <Link
                      to={`/reviews/add?tab=${currentTab.id}`}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Review
                    </Link>
                  )}
                  <button
                    onClick={onAddCategory}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-background border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors shadow-lg flex items-center gap-2"
      >
        <span className="text-sm font-medium">Edit</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
