/**
 * Tiny Markdown subset for release notes: headings, bullets and paragraphs,
 * with **bold** and `code` inline spans. Links keep their text only.
 */
export type InlineSpan = { text: string; bold?: boolean; code?: boolean };

export type MarkdownBlock =
  | { kind: 'heading'; level: 1 | 2 | 3; spans: InlineSpan[] }
  | { kind: 'bullet'; depth: number; spans: InlineSpan[] }
  | { kind: 'paragraph'; spans: InlineSpan[] };

export function parseInline(text: string): InlineSpan[] {
  const clean = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  const spans: InlineSpan[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  for (const match of clean.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) spans.push({ text: clean.slice(last, index) });
    const token = match[0];
    spans.push(
      token.startsWith('**')
        ? { text: token.slice(2, -2), bold: true }
        : { text: token.slice(1, -1), code: true },
    );
    last = index + token.length;
  }
  if (last < clean.length) spans.push({ text: clean.slice(last) });
  return spans.filter((span) => span.text.length > 0);
}

export function parseMarkdownLite(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) {
      blocks.push({
        kind: 'paragraph',
        spans: parseInline(paragraph.join(' ')),
      });
      paragraph = [];
    }
  };

  const text = source.replace(/<!--[\s\S]*?-->/g, '').replace(/\r\n/g, '\n');
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (heading) {
      flush();
      const level = Math.min(heading[1]!.length, 3) as 1 | 2 | 3;
      blocks.push({ kind: 'heading', level, spans: parseInline(heading[2]!) });
      continue;
    }
    const bullet = /^(\s*)[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      flush();
      blocks.push({
        kind: 'bullet',
        depth: Math.min(Math.floor(bullet[1]!.length / 2), 2),
        spans: parseInline(bullet[2]!),
      });
      continue;
    }
    paragraph.push(line.trim());
  }
  flush();
  return blocks;
}
