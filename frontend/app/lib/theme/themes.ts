// Theme system with aesthetics and palettes
// Backend stores: aesthetic slug + palette name
// Frontend stores: all styling definitions

export interface Palette {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  border: string;
  accent: string;
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

export const AESTHETICS: Record<string, Aesthetic> = {
  neobrutalist: {
    name: "Neobrutalist",
    description: "Bold, loud, and unapologetic",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeights: { heading: "700", body: "500" },
    borderRadius: "0",
    borderWidth: "3px",
    shadowStyle: "4px 4px 0px",
    palettes: {
      default: {
        background: "#ffffff",
        foreground: "#000000",
        primary: "#00ff00",
        secondary: "#ffff00",
        muted: "#f0f0f0",
        mutedForeground: "#666666",
        border: "#000000",
        accent: "#ff00ff",
      },
      hotPink: {
        background: "#fff0f5",
        foreground: "#1a1a1a",
        primary: "#ff1493",
        secondary: "#ff69b4",
        muted: "#ffe4ec",
        mutedForeground: "#8b4563",
        border: "#1a1a1a",
        accent: "#ff00ff",
      },
      electric: {
        background: "#0a0a0a",
        foreground: "#ffffff",
        primary: "#00ffff",
        secondary: "#ff00ff",
        muted: "#1a1a1a",
        mutedForeground: "#888888",
        border: "#00ffff",
        accent: "#ffff00",
      },
    },
  },
  minimalist: {
    name: "Minimalist",
    description: "Clean, spacious, and refined",
    fontFamily: "'Inter', sans-serif",
    fontWeights: { heading: "600", body: "400" },
    borderRadius: "8px",
    borderWidth: "1px",
    shadowStyle: "0 1px 3px rgba(0,0,0,0.1)",
    palettes: {
      default: {
        background: "#ffffff",
        foreground: "#171717",
        primary: "#171717",
        secondary: "#525252",
        muted: "#f5f5f5",
        mutedForeground: "#737373",
        border: "#e5e5e5",
        accent: "#3b82f6",
      },
      warm: {
        background: "#faf9f7",
        foreground: "#1c1917",
        primary: "#78716c",
        secondary: "#a8a29e",
        muted: "#f5f5f4",
        mutedForeground: "#78716c",
        border: "#e7e5e4",
        accent: "#ea580c",
      },
      dark: {
        background: "#0a0a0a",
        foreground: "#fafafa",
        primary: "#fafafa",
        secondary: "#a1a1aa",
        muted: "#18181b",
        mutedForeground: "#71717a",
        border: "#27272a",
        accent: "#6366f1",
      },
    },
  },
  terminal: {
    name: "Terminal",
    description: "Hacker vibes, dark forest green",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeights: { heading: "600", body: "400" },
    borderRadius: "0",
    borderWidth: "1px",
    shadowStyle: "none",
    palettes: {
      default: {
        background: "#0d1f0d",
        foreground: "#4ade80",
        primary: "#22c55e",
        secondary: "#16a34a",
        muted: "#14291a",
        mutedForeground: "#4ade80",
        border: "#22c55e",
        accent: "#86efac",
      },
      amber: {
        background: "#1a1400",
        foreground: "#fbbf24",
        primary: "#f59e0b",
        secondary: "#d97706",
        muted: "#292000",
        mutedForeground: "#fcd34d",
        border: "#f59e0b",
        accent: "#fde68a",
      },
      phosphor: {
        background: "#001a1a",
        foreground: "#00ffff",
        primary: "#00d4d4",
        secondary: "#00a3a3",
        muted: "#002929",
        mutedForeground: "#67e8f9",
        border: "#00d4d4",
        accent: "#a5f3fc",
      },
    },
  },
};

export type AestheticSlug = keyof typeof AESTHETICS;
export type PaletteName<T extends AestheticSlug> = keyof (typeof AESTHETICS)[T]["palettes"];

export interface ResolvedTheme extends Omit<Aesthetic, "palettes"> {
  slug: AestheticSlug;
  paletteName: string;
  colors: Palette;
}

export function getTheme(aestheticSlug: string, palette: string): ResolvedTheme {
  const aesthetic = AESTHETICS[aestheticSlug] ?? AESTHETICS.minimalist;
  const slug = (aestheticSlug in AESTHETICS ? aestheticSlug : "minimalist") as AestheticSlug;
  const colors = aesthetic.palettes[palette] ?? aesthetic.palettes.default;

  return {
    slug,
    paletteName: palette in aesthetic.palettes ? palette : "default",
    name: aesthetic.name,
    description: aesthetic.description,
    fontFamily: aesthetic.fontFamily,
    fontWeights: aesthetic.fontWeights,
    borderRadius: aesthetic.borderRadius,
    borderWidth: aesthetic.borderWidth,
    shadowStyle: aesthetic.shadowStyle,
    colors,
  };
}

export function getDefaultTheme(): ResolvedTheme {
  return getTheme("minimalist", "default");
}

// Get all palette names for an aesthetic
export function getPaletteNames(aestheticSlug: string): string[] {
  const aesthetic = AESTHETICS[aestheticSlug];
  if (!aesthetic) return ["default"];
  return Object.keys(aesthetic.palettes);
}

// Get all aesthetic slugs
export function getAestheticSlugs(): AestheticSlug[] {
  return Object.keys(AESTHETICS) as AestheticSlug[];
}
