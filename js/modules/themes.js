// Curated visual themes + synchronized Avatar Lab presets

export const THEMES = {
  crimson: {
    id: 'crimson',
    name: 'Crimson Forge',
    short: 'Crimson',
    icon: '◈',
    desc: 'Obsidian dark with signature crimson coral & cyan highlights',
    light: false,
    bg: '#07080f',
    bgElev: 'rgba(15, 17, 29, 0.72)',
    ink: '#f6f7fb',
    muted: '#9ca3c2',
    c1: '#f73b56',
    c2: '#38bdf8',
    c3: '#fbbf24',
    border: 'rgba(247, 59, 86, 0.25)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    avatar: {
      bodyColor: '#f73b56',
      eyeColor: '#111316',
      surface: 'sphere',
      accessory: 'cyber-visor',
      roundness: 1,
      outline: true,
    },
  },
  cyber: {
    id: 'cyber',
    name: 'Astral Cyber',
    short: 'Astral',
    icon: '✦',
    desc: 'Deep cosmos indigo with electric cyan & ultraviolet neon',
    light: false,
    bg: '#050614',
    bgElev: 'rgba(14, 16, 40, 0.72)',
    ink: '#f2f5ff',
    muted: '#9ca6d8',
    c1: '#7cf7ff',
    c2: '#8b5cf6',
    c3: '#ff7ad9',
    border: 'rgba(124, 247, 255, 0.24)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    avatar: {
      bodyColor: '#6d4aff',
      eyeColor: '#7cf7ff',
      surface: 'sphere',
      accessory: 'orbitals',
      roundness: 1,
      outline: true,
    },
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix',
    short: 'Matrix',
    icon: '⌘',
    desc: 'Terminal midnight with emerald phosphor & aqua beams',
    light: false,
    bg: '#020d0a',
    bgElev: 'rgba(6, 26, 20, 0.74)',
    ink: '#ecfff8',
    muted: '#86c4ae',
    c1: '#10b981',
    c2: '#22d3ee',
    c3: '#a3e635',
    border: 'rgba(16, 185, 129, 0.28)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    avatar: {
      bodyColor: '#10b981',
      eyeColor: '#05031a',
      surface: 'diamond',
      accessory: 'orbitals',
      roundness: 0.85,
      outline: true,
    },
  },
  gold: {
    id: 'gold',
    name: 'Solar Gold',
    short: 'Solar',
    icon: '★',
    desc: 'Warm volcanic slate with molten amber & rose flares',
    light: false,
    bg: '#0c0805',
    bgElev: 'rgba(28, 19, 12, 0.74)',
    ink: '#fff9ed',
    muted: '#cdb794',
    c1: '#f59e0b',
    c2: '#fb7185',
    c3: '#fde047',
    border: 'rgba(245, 158, 11, 0.28)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    avatar: {
      bodyColor: '#f59e0b',
      eyeColor: '#111316',
      surface: 'capsule',
      accessory: 'diadem',
      roundness: 1,
      outline: true,
    },
  },
  light: {
    id: 'light',
    name: 'Studio Paper',
    short: 'Light',
    icon: '☀',
    desc: 'Crisp editorial daylight with high-contrast slate & crimson',
    light: true,
    bg: '#f5f6fa',
    bgElev: 'rgba(255, 255, 255, 0.84)',
    ink: '#0f172a',
    muted: '#475569',
    c1: '#e11d48',
    c2: '#0284c7',
    c3: '#d97706',
    border: 'rgba(15, 23, 42, 0.12)',
    subtle: 'rgba(15, 23, 42, 0.04)',
    avatar: {
      bodyColor: '#e11d48',
      eyeColor: '#ffffff',
      surface: 'sphere',
      accessory: 'earmuffs',
      roundness: 1,
      outline: false,
    },
  },
}

export const THEME_ORDER = ['crimson', 'cyber', 'emerald', 'gold', 'light']

export function applyThemeVars(theme) {
  const r = document.documentElement.style
  r.setProperty('--bg', theme.bg)
  r.setProperty('--glass', theme.bgElev)
  r.setProperty('--ink', theme.ink)
  r.setProperty('--muted', theme.muted)
  r.setProperty('--c1', theme.c1)
  r.setProperty('--c2', theme.c2)
  r.setProperty('--c3', theme.c3)
  r.setProperty('--glass-border', theme.border)
  r.setProperty('--subtle', theme.subtle)
  document.documentElement.dataset.theme = theme.id
  document.documentElement.classList.toggle('is-light', !!theme.light)
}
