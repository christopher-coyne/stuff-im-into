import { Check, ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import {
  AESTHETICS,
  getAestheticSlugs,
  getPaletteNames,
  type AestheticSlug,
} from "~/lib/theme/themes";

interface ThemeSelection {
  aesthetic: AestheticSlug;
  palette: string;
}

interface EditSidebarProps {
  currentTab: { id: string; name: string } | null;
  onExitEditMode: () => void;
  onAddTab: () => void;
  onDeleteTab: () => void;
  onAddCategory: () => void;
  currentTheme: ThemeSelection;
  onThemeChange: (theme: ThemeSelection) => void;
  onSaveTheme: () => void;
  isSavingTheme?: boolean;
}

type SidebarTab = "content" | "theme";

export function EditSidebar({
  currentTab,
  onExitEditMode,
  onAddTab,
  onDeleteTab,
  onAddCategory,
  currentTheme,
  onThemeChange,
  onSaveTheme,
  isSavingTheme,
}: EditSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>("content");
  const aestheticSlugs = getAestheticSlugs();
  const currentPalettes = getPaletteNames(currentTheme.aesthetic);
  // If the user's palette doesn't exist, treat the first palette as selected
  const effectivePalette = currentPalettes.includes(currentTheme.palette)
    ? currentTheme.palette
    : currentPalettes[0];

  const truncatedTabName = currentTab
    ? currentTab.name.length > 20
      ? `${currentTab.name.slice(0, 20)}...`
      : currentTab.name
    : null;


  return (
    <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end">
      {/* Edit Panel */}
      {isOpen && (
        <div className="bg-background border border-border rounded-lg shadow-lg overflow-hidden mb-2 w-72 max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <span className="text-sm font-semibold">Edit Mode</span>
            <button
              onClick={onExitEditMode}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "content"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "theme"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Theme
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            {activeTab === "content" && (
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
            )}

            {activeTab === "theme" && (
              <div className="space-y-4">
                {/* Aesthetic Selection */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Style
                  </div>
                  <div className="space-y-1">
                    {aestheticSlugs.map((slug) => {
                      const aesthetic = AESTHETICS[slug];
                      const isSelected = currentTheme.aesthetic === slug;
                      return (
                        <button
                          key={slug}
                          onClick={() => {
                            const firstPalette = getPaletteNames(slug)[0];
                            onThemeChange({ aesthetic: slug, palette: firstPalette });
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{aesthetic.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {aesthetic.description}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Palette Selection */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Palette
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPalettes.map((paletteName) => {
                      const palette =
                        AESTHETICS[currentTheme.aesthetic].palettes[paletteName];
                      const isSelected = effectivePalette === paletteName;
                      return (
                        <button
                          key={paletteName}
                          onClick={() =>
                            onThemeChange({
                              ...currentTheme,
                              palette: paletteName,
                            })
                          }
                          className={`relative flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                            isSelected
                              ? "ring-2 ring-primary ring-offset-1"
                              : "hover:bg-muted"
                          }`}
                          title={paletteName}
                        >
                          {/* Color preview swatches */}
                          <div className="flex gap-0.5">
                            <div
                              className="w-3 h-3 rounded-sm border border-border"
                              style={{ backgroundColor: palette.background }}
                            />
                            <div
                              className="w-3 h-3 rounded-sm border border-border"
                              style={{ backgroundColor: palette.primary }}
                            />
                            <div
                              className="w-3 h-3 rounded-sm border border-border"
                              style={{ backgroundColor: palette.accent }}
                            />
                          </div>
                          <span className="capitalize">{paletteName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={onSaveTheme}
                  disabled={isSavingTheme}
                  className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingTheme ? "Saving..." : "Save Theme"}
                </button>
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
