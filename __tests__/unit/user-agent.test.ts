import { describe, expect, it } from 'bun:test';

import { describeUserAgent } from '@/lib/user-agent';

describe('describeUserAgent', () => {
  it('recognises the mobile app', () => {
    expect(describeUserAgent('WasteWise-Mobile').kind).toBe('mobile-app');
    expect(describeUserAgent('okhttp/4.12.0').label).toBe(
      'WasteWise Android app',
    );
  });

  it('names browser and system', () => {
    expect(
      describeUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
      ),
    ).toEqual({ label: 'Chrome on Windows', kind: 'desktop' });
    expect(
      describeUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      ).label,
    ).toBe('Safari on macOS');
    expect(
      describeUserAgent(
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 EdgA/130.0',
      ),
    ).toEqual({ label: 'Edge on Android', kind: 'phone' });
  });

  it('falls back for missing or unknown agents', () => {
    expect(describeUserAgent(null).label).toBe('Unknown device');
    expect(describeUserAgent('curl/8.0').label).toBe('Unknown device');
  });
});
