export type ThemeName = "DEFAULT" | "EMBER" | "OCEAN" | "FOREST" | "VIOLET" | "ROSE" | "MINIMAL";

/**
 * Avatar/Card gradients - lighter colors for small elements like avatars and cards
 */
export const themeAvatarGradients: Record<ThemeName, string> = {
  DEFAULT: "from-gray-400 to-gray-600",
  EMBER: "from-amber-400 to-orange-600",
  OCEAN: "from-cyan-400 to-blue-600",
  FOREST: "from-emerald-400 to-green-600",
  VIOLET: "from-violet-400 to-purple-600",
  ROSE: "from-rose-400 to-pink-600",
  MINIMAL: "from-zinc-400 to-zinc-600",
};

/**
 * Header gradients - medium intensity for page headers (profile page, list page)
 */
export const themeHeaderGradients: Record<ThemeName, string> = {
  DEFAULT: "from-gray-600 to-gray-800",
  EMBER: "from-amber-600 to-orange-800",
  OCEAN: "from-cyan-600 to-blue-800",
  FOREST: "from-emerald-600 to-green-800",
  VIOLET: "from-violet-600 to-purple-800",
  ROSE: "from-rose-600 to-pink-800",
  MINIMAL: "from-zinc-600 to-zinc-800",
};

/**
 * Review gradients - darker with opacity for review detail pages
 */
export const themeReviewGradients: Record<ThemeName, string> = {
  DEFAULT: "from-gray-600/80 to-gray-900",
  EMBER: "from-amber-700/80 to-stone-900",
  OCEAN: "from-cyan-700/80 to-slate-900",
  FOREST: "from-emerald-700/80 to-stone-900",
  VIOLET: "from-violet-700/80 to-slate-900",
  ROSE: "from-rose-700/80 to-stone-900",
  MINIMAL: "from-zinc-600/80 to-zinc-900",
};

/**
 * Tag/Badge colors - for category pills and badges
 */
export const themeTagColors: Record<ThemeName, string> = {
  DEFAULT: "bg-gray-600 text-gray-100",
  EMBER: "bg-amber-600 text-amber-100",
  OCEAN: "bg-cyan-600 text-cyan-100",
  FOREST: "bg-emerald-600 text-emerald-100",
  VIOLET: "bg-violet-600 text-violet-100",
  ROSE: "bg-rose-600 text-rose-100",
  MINIMAL: "bg-zinc-600 text-zinc-100",
};

/**
 * Helper to get gradient with fallback to DEFAULT
 */
export function getAvatarGradient(theme: string | undefined | null): string {
  return themeAvatarGradients[(theme as ThemeName) || "DEFAULT"] || themeAvatarGradients.DEFAULT;
}

export function getHeaderGradient(theme: string | undefined | null): string {
  return themeHeaderGradients[(theme as ThemeName) || "DEFAULT"] || themeHeaderGradients.DEFAULT;
}

export function getReviewGradient(theme: string | undefined | null): string {
  return themeReviewGradients[(theme as ThemeName) || "DEFAULT"] || themeReviewGradients.DEFAULT;
}

export function getTagColor(theme: string | undefined | null): string {
  return themeTagColors[(theme as ThemeName) || "DEFAULT"] || themeTagColors.DEFAULT;
}
