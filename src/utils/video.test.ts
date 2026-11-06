import { describe, expect, it } from 'vitest';

import { clamp, getVideoEmbedUrl } from './video';

describe('getVideoEmbedUrl', () => {
  it('reconhece youtube watch', () => {
    expect(getVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('reconhece link curto youtu.be', () => {
    expect(getVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('reconhece shorts e embed', () => {
    expect(getVideoEmbedUrl('https://www.youtube.com/shorts/abc123XYZ')).toBe(
      'https://www.youtube.com/embed/abc123XYZ',
    );
    expect(getVideoEmbedUrl('https://www.youtube.com/embed/abc123XYZ')).toBe(
      'https://www.youtube.com/embed/abc123XYZ',
    );
  });

  it('reconhece twitch e streamable', () => {
    expect(getVideoEmbedUrl('https://www.twitch.tv/videos/123456789')).toContain(
      'player.twitch.tv/?video=123456789',
    );
    expect(getVideoEmbedUrl('https://streamable.com/abcd12')).toBe('https://streamable.com/e/abcd12');
  });

  it('retorna null para URL não reconhecida ou vazia', () => {
    expect(getVideoEmbedUrl('https://example.com/video.mp4')).toBeNull();
    expect(getVideoEmbedUrl('')).toBeNull();
  });
});

describe('clamp', () => {
  it('limita ao intervalo', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(42, 0, 100)).toBe(42);
  });
});
