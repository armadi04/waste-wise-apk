import { describe, expect, it } from 'bun:test';

import { notificationRoute } from '@/lib/notifications';

describe('notificationRoute', () => {
  it('maps report links to the report screen', () => {
    expect(notificationRoute('/reports/12')).toBe('/reports/12');
    expect(notificationRoute('/reports/12/')).toBe('/reports/12');
  });

  it('ignores links the app cannot open', () => {
    expect(notificationRoute(null)).toBeNull();
    expect(notificationRoute('/users/3')).toBeNull();
    expect(notificationRoute('https://example.com')).toBeNull();
  });
});
