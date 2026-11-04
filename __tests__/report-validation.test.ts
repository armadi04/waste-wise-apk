import { describe, expect, it } from 'bun:test';

import { reportSchema } from '@/lib/validation/report';

describe('reportSchema', () => {
  it('accepts a valid description', () => {
    const result = reportSchema.safeParse({
      description: 'Plastic bottles near the river bank',
    });
    expect(result.success).toBe(true);
  });

  it('rejects descriptions shorter than 3 characters', () => {
    const result = reportSchema.safeParse({ description: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects descriptions longer than 2000 characters', () => {
    const result = reportSchema.safeParse({ description: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});
