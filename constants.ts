import { ResourceType } from "./types";

export const START_YEAR = 1990;
export const END_YEAR = 2050;
export const CURRENT_REAL_YEAR = 2024;

// Resource Units for display
export const UNITS: Record<ResourceType, string> = {
  Oil: 'Billion Barrels',
  Coal: 'Million Tonnes',
  Gas: 'Trillion Cubic Meters'
};

// Cyberpunk Color Palette
export const COLORS = {
  background: '#0f172a', // Slate 900
  panel: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
  primary: '#06b6d4', // Cyan 500
  secondary: '#ec4899', // Pink 500
  text: '#f1f5f9', // Slate 100
  danger: '#ef4444', // Red 500
  safe: '#10b981', // Emerald 500
};

export const MAP_STYLE = {
  fillColor: '#1e293b',
  weight: 1,
  opacity: 1,
  color: '#334155', // Border color
  fillOpacity: 0.7
};
