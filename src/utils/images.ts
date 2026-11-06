import manifest from '@/data/assets.json';

const LOCAL_ASSETS = manifest as Record<string, string>;

/**
 * Prefere a imagem baixada por `npm run assets`; se não houver, mantém a URL
 * remota. Assim o app funciona com ou sem o download das imagens.
 */
export function resolveImage(url?: string | null): string | null {
  if (!url) return null;
  return LOCAL_ASSETS[url] ?? url;
}
