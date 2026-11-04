import { describe, expect, it } from 'bun:test';

import { parseInline, parseMarkdownLite } from '@/lib/markdown-lite';

describe('markdown-lite', () => {
  it('parses headings, bullets and paragraphs', () => {
    const blocks = parseMarkdownLite(
      '## Features\n\n* **auth:** add 2FA ([#12](https://x))\n  - nested\n\nPlain text\ncontinues\n<!-- hidden -->',
    );
    expect(blocks.map((b) => b.kind)).toEqual([
      'heading',
      'bullet',
      'bullet',
      'paragraph',
    ]);
    expect(blocks[0]).toEqual({
      kind: 'heading',
      level: 2,
      spans: [{ text: 'Features' }],
    });
    expect(blocks[1]).toEqual({
      kind: 'bullet',
      depth: 0,
      spans: [{ text: 'auth:', bold: true }, { text: ' add 2FA (#12)' }],
    });
    expect(blocks[2]).toMatchObject({ kind: 'bullet', depth: 1 });
    expect(blocks[3]).toEqual({
      kind: 'paragraph',
      spans: [{ text: 'Plain text continues' }],
    });
  });

  it('keeps inline code', () => {
    expect(parseInline('run `bun test` now')).toEqual([
      { text: 'run ' },
      { text: 'bun test', code: true },
      { text: ' now' },
    ]);
  });

  it('returns nothing for empty notes', () => {
    expect(parseMarkdownLite('  \n\n')).toEqual([]);
  });
});
