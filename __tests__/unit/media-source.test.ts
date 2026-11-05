import { describe, expect, it, mock } from 'bun:test';

let token: string | null = 'access-token';
mock.module('@/auth/token-storage', () => ({
  getCachedAccessToken: () => token,
}));

const { mediaImageSource } = await import('@/lib/media-source');
const { API_BASE_URL } = await import('@/lib/config');

describe('mediaImageSource', () => {
  it('adds the Bearer token for our own API URLs', () => {
    const uri = `${API_BASE_URL}/media/5/view`;
    expect(mediaImageSource(uri)).toEqual({
      uri,
      headers: { Authorization: 'Bearer access-token' },
    });
  });

  it('never sends the token to local files or other origins', () => {
    expect(mediaImageSource('file:///cache/photo.jpg')).toEqual({
      uri: 'file:///cache/photo.jpg',
    });
    expect(mediaImageSource('https://evil.example/x.jpg')).toEqual({
      uri: 'https://evil.example/x.jpg',
    });
  });

  it('falls back to a plain source when signed out', () => {
    token = null;
    const uri = `${API_BASE_URL}/media/5/view`;
    expect(mediaImageSource(uri)).toEqual({ uri });
  });
});
