// Theme system with aesthetics and palettes
// Backend stores: aesthetic slug + palette name
// Frontend stores: all styling definitions

import { AESTHETICS } from "./theme-definitions";

/**
 * Color palette for a theme variant.
 *
 * Naming convention:
 * - `background` is the base color (for backgrounds, buttons, etc.)
 * - `foreground` is the text color that sits on that background
 *
 * Example (minimalist default):
 *   background: #ffffff (white page)
 *   foreground: #171717 (dark text on white)
 *
 *   primary: #171717 (dark button/header background)
 *   primaryForeground: #ffffff (white text on dark button)
 *
 *   muted: #f5f5f5 (light gray for subtle areas)
 *   mutedForeground: #737373 (gray text for secondary info)
 *
 * The `accent` color is standalone (no foreground pair) - used for highlights like links.
 */
export interface Palette {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  accent: string;
  headerGradient?: string;
}

export interface Aesthetic {
  name: string;
  description: string;
  fontFamily: string;
  fontWeights: { heading: string; body: string };
  borderRadius: string;
  borderWidth: string;
  shadowStyle: string;
  palettes: Record<string, Palette>;
}

// Re-export AESTHETICS for convenience
export { AESTHETICS };

export type AestheticSlug = keyof typeof AESTHETICS;
export type PaletteName<T extends AestheticSlug> = keyof (typeof AESTHETICS)[T]["palettes"];

// Pre-computed style objects for common UI elements
export interface ThemeStyles {
  // Page wrapper
  page: React.CSSProperties;
  // Profile header
  header: React.CSSProperties;
  headerText: React.CSSProperties;
  headerTextMuted: React.CSSProperties;
  // Avatar
  avatar: React.CSSProperties;
  avatarFallback: React.CSSProperties;
  // Buttons
  button: React.CSSProperties;
  buttonIcon: React.CSSProperties;
  // Inputs
  input: React.CSSProperties;
  // Tabs
  tabBar: React.CSSProperties;
  tab: (isActive: boolean) => React.CSSProperties;
  // Cards/containers
  card: React.CSSProperties;
  cardMuted: React.CSSProperties;
  // Tags
  tag: React.CSSProperties;
  // Text
  mutedText: React.CSSProperties;
}

export interface ResolvedTheme extends Omit<Aesthetic, "palettes"> {
  slug: AestheticSlug;
  paletteName: string;
  colors: Palette;
  styles: ThemeStyles;
}

export function getTheme(aestheticSlug: string, palette: string): ResolvedTheme {
  const aesthetic = AESTHETICS[aestheticSlug] ?? AESTHETICS.minimalist;
  const slug = (aestheticSlug in AESTHETICS ? aestheticSlug : "minimalist") as AestheticSlug;
  const paletteNames = Object.keys(aesthetic.palettes);
  const firstPalette = paletteNames[0];
  const colors = aesthetic.palettes[palette] ?? aesthetic.palettes[firstPalette];

  // Shared border style
  const border = `${aesthetic.borderWidth} solid ${colors.border}`;

  // Pre-compute common styles
  const styles: ThemeStyles = {
    page: {
      backgroundColor: colors.background,
      color: colors.foreground,
      fontFamily: aesthetic.fontFamily,
    },
    header: {
      background: colors.headerGradient || colors.primary,
      borderRadius: aesthetic.borderRadius,
      border,
      boxShadow: aesthetic.shadowStyle,
    },
    headerText: {
      color: colors.primaryForeground,
      fontWeight: aesthetic.fontWeights.heading,
    },
    headerTextMuted: {
      color: colors.primaryForeground,
      opacity: 0.7,
    },
    avatar: {
      borderRadius: aesthetic.borderRadius,
      border,
      backgroundColor: colors.background,
    },
    avatarFallback: {
      color: colors.mutedForeground,
      fontWeight: aesthetic.fontWeights.heading,
    },
    button: {
      backgroundColor: colors.background,
      color: colors.foreground,
      border,
      borderRadius: aesthetic.borderRadius,
      fontWeight: aesthetic.fontWeights.body,
      fontFamily: aesthetic.fontFamily,
    },
    buttonIcon: {
      backgroundColor: colors.background,
      color: colors.foreground,
      border,
      borderRadius: aesthetic.borderRadius,
    },
    input: {
      backgroundColor: colors.muted,
      color: colors.foreground,
      border,
      borderRadius: aesthetic.borderRadius,
      fontFamily: aesthetic.fontFamily,
    },
    tabBar: {
      borderBottom: border,
    },
    tab: (isActive: boolean) => ({
      fontWeight: aesthetic.fontWeights.body,
      borderBottom: `${aesthetic.borderWidth} solid ${isActive ? colors.primary : "transparent"}`,
      color: isActive ? colors.foreground : colors.mutedForeground,
    }),
    card: {
      backgroundColor: colors.background,
      border,
      borderRadius: aesthetic.borderRadius,
      boxShadow: aesthetic.shadowStyle,
    },
    cardMuted: {
      backgroundColor: colors.muted,
      borderRadius: aesthetic.borderRadius,
      border,
    },
    tag: {
      backgroundColor: colors.secondary,
      color: colors.secondaryForeground,
      borderRadius: aesthetic.borderRadius,
      border,
      fontWeight: aesthetic.fontWeights.body,
      fontFamily: aesthetic.fontFamily,
    },
    mutedText: {
      color: colors.mutedForeground,
    },
  };

  return {
    slug,
    paletteName: palette in aesthetic.palettes ? palette : firstPalette,
    name: aesthetic.name,
    description: aesthetic.description,
    fontFamily: aesthetic.fontFamily,
    fontWeights: aesthetic.fontWeights,
    borderRadius: aesthetic.borderRadius,
    borderWidth: aesthetic.borderWidth,
    shadowStyle: aesthetic.shadowStyle,
    colors,
    styles,
  };
}

export function getDefaultTheme(): ResolvedTheme {
  return getTheme("minimalist", "light");
}

// Get all palette names for an aesthetic
export function getPaletteNames(aestheticSlug: string): string[] {
  const aesthetic = AESTHETICS[aestheticSlug];
  if (!aesthetic) return [];
  return Object.keys(aesthetic.palettes);
}

// Get all aesthetic slugs
export function getAestheticSlugs(): AestheticSlug[] {
  return Object.keys(AESTHETICS) as AestheticSlug[];
}
