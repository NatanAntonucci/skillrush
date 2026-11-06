/**
 * Converte um clique em uma imagem `object-contain` para percentual (0–100)
 * relativo à área realmente desenhada — não à caixa do elemento, que pode
 * ter tarjas (letterbox) quando a proporção da imagem difere do container.
 */
export interface HotspotPoint {
  x: number;
  y: number;
}

export function pointToPercentage(
  clientX: number,
  clientY: number,
  element: HTMLImageElement,
): HotspotPoint | null {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  const naturalWidth = element.naturalWidth || rect.width;
  const naturalHeight = element.naturalHeight || rect.height;

  const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
  const drawnWidth = naturalWidth * scale;
  const drawnHeight = naturalHeight * scale;

  const offsetX = rect.left + (rect.width - drawnWidth) / 2;
  const offsetY = rect.top + (rect.height - drawnHeight) / 2;

  const x = ((clientX - offsetX) / drawnWidth) * 100;
  const y = ((clientY - offsetY) / drawnHeight) * 100;

  return {
    x: clamp(Math.round(x), 0, 100),
    y: clamp(Math.round(y), 0, 100),
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Extrai o ID de um vídeo do YouTube, quando houver. */
export function getYoutubeId(url: string): string | null {
  if (!url) return null;

  const match = url
    .trim()
    .match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([\w-]{6,})/);

  return match?.[1] ?? null;
}

/** Thumbnail do YouTube em resolução de card. */
export function getVideoThumbnail(url: string): string | null {
  const id = getYoutubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Converte a URL do vídeo em uma URL de embed, quando reconhecida. */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  const youtubeId = getYoutubeId(trimmed);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  const twitch = trimmed.match(/twitch\.tv\/videos\/(\d+)/);
  if (twitch?.[1]) {
    return `https://player.twitch.tv/?video=${twitch[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`;
  }

  const streamable = trimmed.match(/streamable\.com\/([\w-]+)/);
  if (streamable?.[1]) {
    return `https://streamable.com/e/${streamable[1]}`;
  }

  const medal = trimmed.match(/medal\.tv\/games\/[^/]+\/clips\/([\w-]+)/);
  if (medal?.[1]) {
    return `https://medal.tv/clip/${medal[1]}`;
  }

  return null;
}
