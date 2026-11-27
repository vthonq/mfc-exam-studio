import type { AppSettings, StudioPalette, ThemeMode } from '../types';

export interface StudioPaletteMeta {
  id: StudioPalette;
  name: string;
  nameVi: string;
  tagline: string;
  theme: ThemeMode;
  metaThemeColor: string;
  swatches: [string, string, string];
}

export const DEFAULT_PALETTE: StudioPalette = 'obsidian';

export const STUDIO_PALETTES: StudioPaletteMeta[] = [
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    nameVi: 'Đêm Obsidian (Linear)',
    tagline: 'Crisp dark canvas · sharp 1px glass',
    theme: 'dark',
    metaThemeColor: '#09090b',
    swatches: ['#09090b', '#18181d', '#6366f1'],
  },
  {
    id: 'paper',
    name: 'Warm Ivory Paper',
    nameVi: 'Giấy Ngà Ấm (Sáng)',
    tagline: 'Calm ivory paper · editorial contrast',
    theme: 'light',
    metaThemeColor: '#faf8f5',
    swatches: ['#faf8f5', '#ffffff', '#4f46e5'],
  },
  {
    id: 'forest',
    name: 'Deep Forest Slate',
    nameVi: 'Rừng Đêm (Êm Mắt)',
    tagline: 'Nordic pine dark · low-glare focus',
    theme: 'dark',
    metaThemeColor: '#06110e',
    swatches: ['#06110e', '#0d1f19', '#10b981'],
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    nameVi: 'Xanh Chàm Studio',
    tagline: 'Deep sapphire twilight · studio glow',
    theme: 'dark',
    metaThemeColor: '#070a19',
    swatches: ['#070a19', '#111734', '#818cf8'],
  },
];

export function isStudioPalette(value: unknown): value is StudioPalette {
  return value === 'obsidian' || value === 'paper' || value === 'forest' || value === 'indigo';
}

export function resolvePalette(
  saved?: Partial<Pick<AppSettings, 'palette' | 'theme'>> | null,
): StudioPalette {
  if (isStudioPalette(saved?.palette)) {
    return saved.palette;
  }
  if (saved?.theme === 'light') {
    return 'paper';
  }
  if (saved?.theme === 'dark') {
    return 'obsidian';
  }
  return DEFAULT_PALETTE;
}

export function getPaletteMeta(id: StudioPalette): StudioPaletteMeta {
  return STUDIO_PALETTES.find((p) => p.id === id) ?? STUDIO_PALETTES[0];
}

export function getNextPalette(id: StudioPalette): StudioPalette {
  const idx = STUDIO_PALETTES.findIndex((p) => p.id === id);
  if (idx === -1) return DEFAULT_PALETTE;
  return STUDIO_PALETTES[(idx + 1) % STUDIO_PALETTES.length].id;
}
