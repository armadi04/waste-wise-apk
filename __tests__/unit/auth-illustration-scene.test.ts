import { describe, expect, it } from 'bun:test';

import {
  buildScene,
  SCENE_GRADIENTS,
  sceneToSvg,
  type ScenePalette,
} from '@/components/auth/illustration/scene';

const palette: ScenePalette = {
  brand: 'c-brand',
  brandPressed: 'c-brand-pressed',
  brandForeground: 'c-fg',
  primary: 'c-primary',
  success: 'c-success',
  shadow: 'c-shadow',
  organic: 'c-organic',
  plastic: 'c-plastic',
  paper: 'c-paper',
};

describe('auth illustration scene', () => {
  it('only paints with palette colors or its own gradients', () => {
    const allowed = new Set([
      ...Object.values(palette),
      ...SCENE_GRADIENTS(palette).map((g) => `url(#${g.id})`),
    ]);
    const shapes = buildScene(palette);
    expect(shapes.length).toBeGreaterThan(50);
    for (const shape of shapes) {
      const fill = 'fill' in shape ? shape.fill : undefined;
      const stroke = shape.kind === 'path' ? shape.stroke : undefined;
      for (const color of [fill, stroke]) {
        if (color !== undefined) expect(allowed.has(color)).toBe(true);
      }
    }
  });

  it('keeps gradient ids namespaced', () => {
    for (const g of SCENE_GRADIENTS(palette)) {
      expect(g.id.startsWith('authIllo')).toBe(true);
    }
  });

  it('serialises to a standalone svg without hex literals', () => {
    const svg = sceneToSvg(palette);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
