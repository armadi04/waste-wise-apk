import { describe, expect, it } from 'bun:test';

import { darkColors, lightColors } from '@/theme/tokens';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe('theme tokens', () => {
  it('defines every token in both themes', () => {
    expect(Object.keys(darkColors).sort()).toEqual(
      Object.keys(lightColors).sort(),
    );
  });

  for (const [mode, colors] of [
    ['light', lightColors],
    ['dark', darkColors],
  ] as const) {
    it(`keeps status and category text readable in ${mode} mode`, () => {
      for (const token of [
        colors.categoryOrganic,
        colors.categoryPlastic,
        colors.categoryPaper,
        colors.categoryUnknown,
      ]) {
        expect(contrast(token, colors.surface)).toBeGreaterThanOrEqual(4.5);
      }
      for (const [fg, bg] of [
        [colors.progressForeground, colors.progressBackground],
        [colors.warningForeground, colors.warningBackground],
        [colors.successForeground, colors.successBackground],
        [colors.dangerForeground, colors.dangerBackground],
      ] as const) {
        expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
