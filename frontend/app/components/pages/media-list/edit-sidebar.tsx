import { Check, ChevronDown, ChevronUp, Palette, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { themeHeaderGradients, themeAvatarGradients } from "~/lib/theme";

interface EditSidebarProps {
  currentTab: { id: string; name: string } | null;
  selectedTheme: string;
  isThemeUpdating: boolean;
  onThemeChange: (theme: string) => void;
  onExitEditMode: () => void;
  onAddTab: () => void;
  onDeleteTab: () => void;
  onAddCategory: () => void;
}

export function EditSidebar({
  currentTab,
  selectedTheme,
  isThemeUpdating,
  onThemeChange,
  onExitEditMode,
  onAddTab,
  onDeleteTab,
  onAddCategory,
}: EditSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "theme">("content");

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

          {/* Tab Switcher */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "content"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="h-4 w-4" />
              Content
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "theme"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palette className="h-4 w-4" />
              Theme
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "content" ? (
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
            ) : (
              <div className="space-y-1">
                {Object.keys(themeHeaderGradients).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => onThemeChange(theme)}
                    disabled={isThemeUpdating}
                    className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      selectedTheme === theme
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-linear-to-br ${themeAvatarGradients[theme as keyof typeof themeAvatarGradients]}`}
                    />
                    <span className="flex-1 text-left">
                      {theme.charAt(0) + theme.slice(1).toLowerCase()}
                    </span>
                    {selectedTheme === theme && (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
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
