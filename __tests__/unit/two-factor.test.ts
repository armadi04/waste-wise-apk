import { describe, expect, it } from 'bun:test';

import { groupSecret } from '@/lib/two-factor';

describe('groupSecret', () => {
  it('groups the setup key in fours', () => {
    expect(groupSecret('JBSWY3DPEHPK3PXP')).toBe('JBSW Y3DP EHPK 3PXP');
    expect(groupSecret('ABCDEF')).toBe('ABCD EF');
    expect(groupSecret('')).toBe('');
  });
});
