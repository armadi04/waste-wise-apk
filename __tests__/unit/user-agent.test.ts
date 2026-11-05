import { describe, expect, it } from 'bun:test';

import { audienceLabel, describeUserAgent } from '@/lib/user-agent';
import { buildUserAgent } from '@/lib/user-agent-header';

describe('describeUserAgent', () => {
  it('names the device from the app user agent', () => {
    expect(
      describeUserAgent(
        'WasteWise-Mobile/1.0.0 (Android 14; Xiaomi 23078RKD5C)',
      ),
    ).toEqual({
      label: 'WasteWise app · Xiaomi 23078RKD5C',
      kind: 'mobile-app',
      system: 'Android 14',
    });
  });

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

describe('buildUserAgent', () => {
  it('describes app version, Android release and device', () => {
    expect(
      buildUserAgent(
        { Release: '14', Brand: 'xiaomi', Model: '23078RKD5C' },
        '1.2.0',
        'android',
      ),
    ).toBe('WasteWise-Mobile/1.2.0 (Android 14; Xiaomi 23078RKD5C)');
  });

  it('does not repeat the brand when the model already includes it', () => {
    expect(
      buildUserAgent(
        { Release: '13', Brand: 'samsung', Model: 'Samsung SM-A546E' },
        '1.0.0',
        'android',
      ),
    ).toBe('WasteWise-Mobile/1.0.0 (Android 13; Samsung SM-A546E)');
  });

  it('strips characters that would break the header format', () => {
    expect(
      buildUserAgent(
        { Release: '14', Brand: 'Acme', Model: 'X1 (Pro); é' },
        undefined,
        'android',
      ),
    ).toBe('WasteWise-Mobile/0.0.0 (Android 14; Acme X1 Pro)');
  });
});

describe('audienceLabel', () => {
  it('maps audiences to user-facing labels', () => {
    expect(audienceLabel('mobile')).toBe('Mobile');
    expect(audienceLabel('admin')).toBe('Browser');
  });
});
