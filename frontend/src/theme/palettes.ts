// Paletas de cores do sistema. A definição visual (valores dos tokens) vive em
// src/index.css nos seletores :root[data-palette='<id>']. Aqui ficam apenas os
// metadados usados pela UI de seleção e os helpers de aplicação/persistência.

export interface Palette {
  id: string
  name: string
  /** Cores de amostra (hex) para o preview do seletor. */
  swatches: [string, string, string]
  dark?: boolean
}

export const PALETTES: Palette[] = [
  { id: 'indigo', name: 'Índigo', swatches: ['#5865f2', '#8a5bd6', '#eef0f4'] },
  { id: 'emerald', name: 'Esmeralda', swatches: ['#1f9d6b', '#2f9e8f', '#eef0f4'] },
  { id: 'violet', name: 'Violeta', swatches: ['#7d5bd6', '#c2557a', '#eef0f4'] },
  { id: 'sunset', name: 'Pôr do sol', swatches: ['#d98a24', '#d64545', '#eef0f4'] },
  { id: 'ocean', name: 'Oceano', swatches: ['#3a7bd5', '#2f9e8f', '#eef0f4'] },
  { id: 'graphite', name: 'Grafite (escuro)', swatches: ['#6c7cff', '#1e202a', '#111218'], dark: true },
]

export const DEFAULT_PALETTE = 'indigo'
const STORAGE_KEY = 'palette'

function isValid(id: string | null): id is string {
  return !!id && PALETTES.some((p) => p.id === id)
}

/** Lê a paleta salva neste dispositivo (ou o default). */
export function getStoredPalette(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    return isValid(id) ? id : DEFAULT_PALETTE
  } catch {
    return DEFAULT_PALETTE
  }
}

/** Aplica a paleta no <html> e persiste. Fonte única de efeito colateral. */
export function applyPalette(id: string): string {
  const valid = isValid(id) ? id : DEFAULT_PALETTE
  document.documentElement.setAttribute('data-palette', valid)
  try {
    localStorage.setItem(STORAGE_KEY, valid)
  } catch {
    /* ignore quota/privacy errors */
  }
  return valid
}
