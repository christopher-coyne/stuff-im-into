import type { Aesthetic } from "./themes";

/**
 * All available aesthetics and their palettes.
 * Each aesthetic defines typography, spacing, and shape.
 * Each palette within an aesthetic defines colors.
 */
export const AESTHETICS: Record<string, Aesthetic> = {
  // ============================================
  // NEOBRUTALIST
  // Bold, loud, and unapologetic
  // ============================================
  neobrutalist: {
    name: "Neobrutalist",
    description: "Bold, loud, and unapologetic",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeights: { heading: "700", body: "500" },
    borderRadius: "0",
    borderWidth: "3px",
    shadowStyle: "4px 4px 0px",
    palettes: {
      neon: {
        background: "#ffffff",
        foreground: "#000000",
        primary: "#00ff00",
        primaryForeground: "#000000",
        secondary: "#ffff00",
        secondaryForeground: "#000000",
        muted: "#f0f0f0",
        mutedForeground: "#666666",
        border: "#000000",
        accent: "#ff00ff",
      },
      hotPink: {
        background: "#fff0f5",
        foreground: "#1a1a1a",
        primary: "#ff1493",
        primaryForeground: "#ffffff",
        secondary: "#ff69b4",
        secondaryForeground: "#1a1a1a",
        muted: "#ffe4ec",
        mutedForeground: "#8b4563",
        border: "#1a1a1a",
        accent: "#ff00ff",
      },
      electric: {
        background: "#0a0a0a",
        foreground: "#ffffff",
        primary: "#00ffff",
        primaryForeground: "#000000",
        secondary: "#ff00ff",
        secondaryForeground: "#ffffff",
        muted: "#1a1a1a",
        mutedForeground: "#888888",
        border: "#00ffff",
        accent: "#ffff00",
      },
    },
  },

  // ============================================
  // MINIMALIST
  // Clean, spacious, and refined
  // ============================================
  minimalist: {
    name: "Minimalist",
    description: "Clean, spacious, and refined",
    fontFamily: "'Inter', sans-serif",
    fontWeights: { heading: "600", body: "400" },
    borderRadius: "8px",
    borderWidth: "1px",
    shadowStyle: "0 1px 3px rgba(0,0,0,0.1)",
    palettes: {
      light: {
        background: "#ffffff",
        foreground: "#171717",
        primary: "#171717",
        primaryForeground: "#ffffff",
        secondary: "#525252",
        secondaryForeground: "#ffffff",
        muted: "#f5f5f5",
        mutedForeground: "#737373",
        border: "#e5e5e5",
        accent: "#3b82f6",
      },
      warm: {
        background: "#faf9f7",
        foreground: "#1c1917",
        primary: "#78716c",
        primaryForeground: "#ffffff",
        secondary: "#a8a29e",
        secondaryForeground: "#1c1917",
        muted: "#f5f5f4",
        mutedForeground: "#78716c",
        border: "#e7e5e4",
        accent: "#ea580c",
      },
      dark: {
        background: "#0a0a0a",
        foreground: "#fafafa",
        primary: "#fafafa",
        primaryForeground: "#000000",
        secondary: "#a1a1aa",
        secondaryForeground: "#0a0a0a",
        muted: "#18181b",
        mutedForeground: "#71717a",
        border: "#27272a",
        accent: "#6366f1",
      },
    },
  },

  // ============================================
  // TERMINAL
  // Hacker vibes, monospace
  // ============================================
  terminal: {
    name: "Terminal",
    description: "Hacker vibes, dark forest green",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeights: { heading: "600", body: "400" },
    borderRadius: "0",
    borderWidth: "1px",
    shadowStyle: "none",
    palettes: {
      green: {
        background: "#0d1f0d",
        foreground: "#4ade80",
        primary: "#22c55e",
        primaryForeground: "#0d1f0d",
        secondary: "#fbbf24",
        secondaryForeground: "#0d1f0d",
        muted: "#14291a",
        mutedForeground: "#4ade80",
        border: "#22c55e",
        accent: "#86efac",
      },
      amber: {
        background: "#1a1400",
        foreground: "#fbbf24",
        primary: "#f59e0b",
        primaryForeground: "#1a1400",
        secondary: "#4ade80",
        secondaryForeground: "#1a1400",
        muted: "#292000",
        mutedForeground: "#fcd34d",
        border: "#f59e0b",
        accent: "#fde68a",
      },
      phosphor: {
        background: "#001a1a",
        foreground: "#00ffff",
        primary: "#00d4d4",
        primaryForeground: "#001a1a",
        secondary: "#f472b6",
        secondaryForeground: "#001a1a",
        muted: "#002929",
        mutedForeground: "#67e8f9",
        border: "#00d4d4",
        accent: "#a5f3fc",
      },
    },
  },

  // ============================================
  // LAVA LAMP
  // Groovy, psychedelic vibes
  // ============================================
  lavaLamp: {
    name: "Lava Lamp",
    description: "Groovy, psychedelic vibes",
    fontFamily: "'Nunito', sans-serif",
    fontWeights: { heading: "800", body: "500" },
    borderRadius: "24px",
    borderWidth: "0",
    shadowStyle: "0 8px 32px rgba(255, 100, 150, 0.3)",
    palettes: {
      cosmic: {
        background: "#1a1a2e",
        foreground: "#eaeaea",
        primary: "#ff6b6b",
        primaryForeground: "#1a1a2e",
        secondary: "#feca57",
        secondaryForeground: "#1a1a2e",
        muted: "#2d2d44",
        mutedForeground: "#a0a0b0",
        border: "#ff9ff3",
        accent: "#54a0ff",
        headerGradient: "linear-gradient(135deg, #ff6b6b, #feca57, #ff9ff3, #54a0ff)",
      },
      sunset: {
        background: "#2d1b2d",
        foreground: "#fff5e6",
        primary: "#ff7e5f",
        primaryForeground: "#2d1b2d",
        secondary: "#feb47b",
        secondaryForeground: "#2d1b2d",
        muted: "#3d2b3d",
        mutedForeground: "#c9a0a0",
        border: "#ff7e5f",
        accent: "#86a8e7",
        headerGradient: "linear-gradient(135deg, #ff7e5f, #feb47b, #ff9a8b, #ffecd2)",
      },
      ocean: {
        background: "#0f0f23",
        foreground: "#e0f7fa",
        primary: "#00bcd4",
        primaryForeground: "#0f0f23",
        secondary: "#7c4dff",
        secondaryForeground: "#ffffff",
        muted: "#1a1a33",
        mutedForeground: "#80cbc4",
        border: "#7c4dff",
        accent: "#ff4081",
        headerGradient: "linear-gradient(135deg, #00bcd4, #7c4dff, #ff4081, #00bcd4)",
      },
    },
  },

  // ============================================
  // PASTEL DREAM
  // Soft, calming, and gentle
  // ============================================
  pastelDream: {
    name: "Pastel Dream",
    description: "Soft, calming, and gentle",
    fontFamily: "'Quicksand', sans-serif",
    fontWeights: { heading: "600", body: "400" },
    borderRadius: "16px",
    borderWidth: "1px",
    shadowStyle: "0 4px 20px rgba(0, 0, 0, 0.05)",
    palettes: {
      lavender: {
        background: "#faf8ff",
        foreground: "#4a4458",
        primary: "#b8a9c9",
        primaryForeground: "#2d2640",
        secondary: "#d4c5e2",
        secondaryForeground: "#4a4458",
        muted: "#f0ebf7",
        mutedForeground: "#8b7fa3",
        border: "#e2d9f0",
        accent: "#9b7fc9",
      },
      mint: {
        background: "#f5fbf8",
        foreground: "#3d5249",
        primary: "#9dd5c0",
        primaryForeground: "#1e3329",
        secondary: "#bfe5d6",
        secondaryForeground: "#3d5249",
        muted: "#e8f5ef",
        mutedForeground: "#6b9580",
        border: "#cce8dc",
        accent: "#5db898",
      },
      peach: {
        background: "#fffaf8",
        foreground: "#5c4a45",
        primary: "#f5c4b8",
        primaryForeground: "#3d2a25",
        secondary: "#fad9d0",
        secondaryForeground: "#5c4a45",
        muted: "#fef0ec",
        mutedForeground: "#a68b83",
        border: "#f5ddd6",
        accent: "#e89b8a",
      },
    },
  },

  // ============================================
  // EDITORIAL
  // Classic print, refined and readable
  // ============================================
  editorial: {
    name: "Editorial",
    description: "Classic print, refined and readable",
    fontFamily: "'Merriweather', serif",
    fontWeights: { heading: "700", body: "400" },
    borderRadius: "2px",
    borderWidth: "1px",
    shadowStyle: "none",
    palettes: {
      classic: {
        background: "#fdfcf9",
        foreground: "#1a1a1a",
        primary: "#1a1a1a",
        primaryForeground: "#fdfcf9",
        secondary: "#c41e3a",
        secondaryForeground: "#ffffff",
        muted: "#f5f3ed",
        mutedForeground: "#666666",
        border: "#d4d0c7",
        accent: "#c41e3a",
      },
      magazine: {
        background: "#ffffff",
        foreground: "#2d2d2d",
        primary: "#e63946",
        primaryForeground: "#ffffff",
        secondary: "#457b9d",
        secondaryForeground: "#ffffff",
        muted: "#f8f8f8",
        mutedForeground: "#6b6b6b",
        border: "#e0e0e0",
        accent: "#1d3557",
      },
      sepia: {
        background: "#f4ecd8",
        foreground: "#3c2f1e",
        primary: "#5c4a32",
        primaryForeground: "#f4ecd8",
        secondary: "#8b7355",
        secondaryForeground: "#f4ecd8",
        muted: "#e8dcc6",
        mutedForeground: "#6b5a45",
        border: "#c9b896",
        accent: "#9c6644",
      },
    },
  },

  // ============================================
  // DARK FOREST
  // Deep, earthy, and mysterious
  // ============================================
  darkForest: {
    name: "Dark Forest",
    description: "Deep, earthy, and mysterious",
    fontFamily: "'Source Sans 3', sans-serif",
    fontWeights: { heading: "600", body: "400" },
    borderRadius: "4px",
    borderWidth: "1px",
    shadowStyle: "0 4px 12px rgba(0, 0, 0, 0.3)",
    palettes: {
      moss: {
        background: "#1a2419",
        foreground: "#c9d4c5",
        primary: "#4a6741",
        primaryForeground: "#e8f0e5",
        secondary: "#8fbc8f",
        secondaryForeground: "#1a2419",
        muted: "#2a3628",
        mutedForeground: "#8a9b85",
        border: "#3d4f38",
        accent: "#9acd32",
      },
      autumn: {
        background: "#1f1a15",
        foreground: "#d4c8b8",
        primary: "#8b4513",
        primaryForeground: "#f5ebe0",
        secondary: "#daa520",
        secondaryForeground: "#1f1a15",
        muted: "#2d2620",
        mutedForeground: "#a09080",
        border: "#4a3f35",
        accent: "#cd853f",
      },
      midnight: {
        background: "#0f1419",
        foreground: "#b8c5d0",
        primary: "#2d4a3e",
        primaryForeground: "#d0e0d8",
        secondary: "#4a7c6f",
        secondaryForeground: "#0f1419",
        muted: "#1a2530",
        mutedForeground: "#7a8a95",
        border: "#2a3a45",
        accent: "#5f9ea0",
      },
    },
  },
};
