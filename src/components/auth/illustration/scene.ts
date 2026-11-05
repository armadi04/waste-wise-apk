/**
 * Pure geometry for the isometric login illustration. Returns a flat list of
 * shapes so the same scene renders in react-native-svg (app) and as an SVG
 * string (design previews). No React or native imports here.
 */

export interface ScenePalette {
  brand: string;
  brandPressed: string;
  brandForeground: string;
  primary: string;
  success: string;
  shadow: string;
  organic: string;
  plastic: string;
  paper: string;
}

export type Shape =
  | {
      kind: 'polygon';
      points: string;
      fill: string;
      opacity?: number;
    }
  | {
      kind: 'path';
      d: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      dash?: string;
      opacity?: number;
    }
  | {
      kind: 'ellipse';
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      fill: string;
      opacity?: number;
    };

export interface SceneGradient {
  id: string;
  type: 'linear' | 'radial';
  stops: { offset: number; color: string; opacity: number }[];
  /** linear: x1,y1,x2,y2 in 0..1; radial: cx,cy,r in 0..1 */
  coords: number[];
}

export const SCENE_WIDTH = 360;
export const SCENE_HEIGHT = 300;

const ORIGIN_X = 180;
const ORIGIN_Y = 178;
const UNIT = 10.4;
const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

type P = [number, number];

/** World (x right-down, y left-down, z up) → screen. */
function iso(x: number, y: number, z = 0): P {
  return [
    ORIGIN_X + (x - y) * COS * UNIT,
    ORIGIN_Y + (x + y) * SIN * UNIT - z * UNIT,
  ];
}

const pts = (list: P[]) =>
  list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

const pathOf = (list: P[], close = true) =>
  list
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ') + (close ? ' Z' : '');

type WithoutTints<F extends (t: Tints, ...rest: never[]) => unknown> =
  Parameters<F> extends [Tints, ...infer R] ? R : never;

/** Shading tints: dark overlay for side faces, light overlay for tops. */
interface Tints {
  dark: string;
  light: string;
}

/** Three visible faces of an axis-aligned box, base color plus shading. */
function box(
  t: Tints,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  color: string,
  shade = { top: 0.22, left: 0, right: 0.24 },
): Shape[] {
  const top = [
    iso(x, y, z + h),
    iso(x + w, y, z + h),
    iso(x + w, y + d, z + h),
    iso(x, y + d, z + h),
  ];
  const left = [
    iso(x, y + d, z + h),
    iso(x + w, y + d, z + h),
    iso(x + w, y + d, z),
    iso(x, y + d, z),
  ];
  const right = [
    iso(x + w, y, z + h),
    iso(x + w, y + d, z + h),
    iso(x + w, y + d, z),
    iso(x + w, y, z),
  ];
  const out: Shape[] = [];
  for (const [face, tint, amount] of [
    [left, t.dark, shade.left],
    [right, t.dark, shade.right],
    [top, t.light, shade.top],
  ] as const) {
    out.push({ kind: 'polygon', points: pts(face), fill: color });
    if (amount > 0)
      out.push({
        kind: 'polygon',
        points: pts(face),
        fill: tint,
        opacity: amount,
      });
  }
  return out;
}

/** Point on the left (y = y0 + d) face, u along x, v up. */
function onLeftFace(x: number, y: number, z: number, u: number, v: number): P {
  return iso(x + u, y, z + v);
}

/** Point on a horizontal plane at height z. */
function onTop(x: number, y: number, z: number, u: number, w: number): P {
  return iso(x + u, y + w, z);
}

function groundShadow(
  x: number,
  y: number,
  r: number,
  palette: ScenePalette,
  opacity = 0.28,
): Shape {
  const [cx, cy] = iso(x, y, 0);
  return {
    kind: 'ellipse',
    cx,
    cy,
    rx: r * COS * UNIT,
    ry: r * SIN * UNIT,
    fill: palette.shadow,
    opacity,
  };
}

function sparkle(
  cx: number,
  cy: number,
  r: number,
  fill: string,
  opacity = 1,
): Shape {
  const k = r * 0.22;
  const d = `M${cx} ${cy - r} C${cx + k} ${cy - k} ${cx + k} ${cy - k} ${cx + r} ${cy} C${cx + k} ${cy + k} ${cx + k} ${cy + k} ${cx} ${cy + r} C${cx - k} ${cy + k} ${cx - k} ${cy + k} ${cx - r} ${cy} C${cx - k} ${cy - k} ${cx - k} ${cy - k} ${cx} ${cy - r} Z`;
  return { kind: 'path', d, fill, opacity };
}

function pyramid(
  t: Tints,
  x: number,
  y: number,
  z: number,
  size: number,
  h: number,
  color: string,
): Shape[] {
  const c = size / 2;
  const apex = iso(x + c, y + c, z + h);
  const left = [iso(x, y + size, z), iso(x + size, y + size, z), apex];
  const right = [iso(x + size, y, z), iso(x + size, y + size, z), apex];
  return [
    { kind: 'polygon', points: pts(left), fill: color },
    { kind: 'polygon', points: pts(right), fill: color },
    { kind: 'polygon', points: pts(right), fill: t.dark, opacity: 0.22 },
  ];
}

export const SCENE_GRADIENTS = (p: ScenePalette): SceneGradient[] => [
  {
    id: 'authIlloHalo',
    type: 'radial',
    coords: [0.5, 0.5, 0.5],
    stops: [
      { offset: 0, color: p.brandForeground, opacity: 0.16 },
      { offset: 1, color: p.brandForeground, opacity: 0 },
    ],
  },
  {
    id: 'authIlloShadow',
    type: 'radial',
    coords: [0.5, 0.5, 0.5],
    stops: [
      { offset: 0, color: p.shadow, opacity: 0.45 },
      { offset: 1, color: p.shadow, opacity: 0 },
    ],
  },
  {
    id: 'authIlloIsland',
    type: 'linear',
    coords: [0, 0, 1, 1],
    stops: [
      { offset: 0, color: p.primary, opacity: 1 },
      { offset: 1, color: p.brand, opacity: 1 },
    ],
  },
];

export function buildScene(p: ScenePalette): Shape[] {
  const tints: Tints = { dark: p.shadow, light: p.brandForeground };
  const B = (...args: WithoutTints<typeof box>) => box(tints, ...args);
  const Py = (...args: WithoutTints<typeof pyramid>) => pyramid(tints, ...args);
  const s: Shape[] = [];

  // Halo + island shadow.
  s.push({
    kind: 'ellipse',
    cx: ORIGIN_X,
    cy: ORIGIN_Y - 20,
    rx: 175,
    ry: 130,
    fill: 'url(#authIlloHalo)',
  });
  {
    const [cx, cy] = iso(0, 0, -6.5);
    s.push({
      kind: 'ellipse',
      cx,
      cy,
      rx: 12 * COS * UNIT,
      ry: 12 * SIN * UNIT,
      fill: 'url(#authIlloShadow)',
    });
  }

  // Floating island: soil body + grass top.
  s.push(
    ...B(-8, -8, -3.2, 16, 16, 2.2, p.brandPressed, {
      top: 0,
      left: 0.1,
      right: 0.35,
    }),
  );
  const islandTop = [
    iso(-8, -8, -1),
    iso(8, -8, -1),
    iso(8, 8, -1),
    iso(-8, 8, -1),
  ];
  const islandLeft = [
    iso(-8, 8, -1),
    iso(8, 8, -1),
    iso(8, 8, -1.8),
    iso(-8, 8, -1.8),
  ];
  const islandRight = [
    iso(8, -8, -1),
    iso(8, 8, -1),
    iso(8, 8, -1.8),
    iso(8, -8, -1.8),
  ];
  s.push({ kind: 'polygon', points: pts(islandLeft), fill: p.primary });
  s.push({ kind: 'polygon', points: pts(islandRight), fill: p.primary });
  s.push({
    kind: 'polygon',
    points: pts(islandRight),
    fill: p.shadow,
    opacity: 0.25,
  });
  s.push({
    kind: 'polygon',
    points: pts(islandTop),
    fill: 'url(#authIlloIsland)',
  });
  s.push({
    kind: 'polygon',
    points: pts(islandTop),
    fill: p.brandForeground,
    opacity: 0.08,
  });
  // Path tiles on the island.
  for (let i = -6; i <= 4; i += 2.5) {
    s.push({
      kind: 'polygon',
      points: pts([
        iso(i, 0.6, -1),
        iso(i + 1.8, 0.6, -1),
        iso(i + 1.8, 2.2, -1),
        iso(i, 2.2, -1),
      ]),
      fill: p.brandForeground,
      opacity: 0.14,
    });
  }

  // Bushes.
  for (const [bx, byy, r] of [
    [-7, -1.5, 1.1],
    [6.6, 5.2, 1.3],
    [7.2, 3.6, 0.9],
    [-1.2, 7, 0.9],
  ] as const) {
    const [cx, cy] = iso(bx, byy, -1);
    s.push({
      kind: 'ellipse',
      cx,
      cy: cy + 2,
      rx: r * UNIT * 0.95,
      ry: r * UNIT * 0.45,
      fill: p.shadow,
      opacity: 0.18,
    });
    s.push({
      kind: 'ellipse',
      cx,
      cy: cy - r * UNIT * 0.45,
      rx: r * UNIT * 0.85,
      ry: r * UNIT * 0.7,
      fill: p.organic,
    });
    s.push({
      kind: 'ellipse',
      cx: cx + r * 2.6,
      cy: cy - r * UNIT * 0.2,
      rx: r * UNIT * 0.5,
      ry: r * UNIT * 0.4,
      fill: p.shadow,
      opacity: 0.16,
    });
    s.push({
      kind: 'ellipse',
      cx: cx - r * 3,
      cy: cy - r * UNIT * 0.75,
      rx: r * UNIT * 0.32,
      ry: r * UNIT * 0.22,
      fill: p.brandForeground,
      opacity: 0.35,
    });
  }

  // Tree on the right corner.
  s.push(groundShadow(5.6, -5.4, 1.8, p, 0.25));
  s.push(...B(5.2, -5.8, -1, 0.8, 0.8, 1.6, p.brandPressed));
  s.push(...Py(4.1, -6.9, 0.4, 3, 3.6, p.organic));
  s.push(...Py(4.5, -6.5, 2.4, 2.2, 3, p.organic));

  // Smartphone at the back, screen facing the viewer.
  const phone = { x: -6.4, y: -6.6, z: -1, w: 6.4, d: 0.9, h: 10.8 };
  s.push(groundShadow(-3.2, -5.4, 3.4, p, 0.3));
  s.push(
    ...B(phone.x, phone.y, phone.z, phone.w, phone.d, phone.h, p.brandPressed, {
      top: 0.15,
      left: 0,
      right: 0.3,
    }),
  );
  const fy = phone.y + phone.d;
  const face = (u: number, v: number) => onLeftFace(phone.x, fy, phone.z, u, v);
  // Bezel + screen.
  s.push({
    kind: 'polygon',
    points: pts([
      face(0.35, 0.5),
      face(6.05, 0.5),
      face(6.05, 10.3),
      face(0.35, 10.3),
    ]),
    fill: p.brandForeground,
    opacity: 0.96,
  });
  s.push({
    kind: 'polygon',
    points: pts([
      face(2.4, 10.45),
      face(4, 10.45),
      face(4, 10.65),
      face(2.4, 10.65),
    ]),
    fill: p.brandPressed,
    opacity: 0.5,
  });
  // Photo: ground + bottle.
  s.push({
    kind: 'polygon',
    points: pts([
      face(0.35, 0.5),
      face(6.05, 0.5),
      face(6.05, 3.6),
      face(0.35, 3.6),
    ]),
    fill: p.primary,
    opacity: 0.18,
  });
  const bottle: [number, number][] = [
    [2.75, 2.2],
    [3.65, 2.2],
    [3.85, 2.5],
    [3.85, 6.4],
    [3.55, 7],
    [3.45, 7.6],
    [2.95, 7.6],
    [2.85, 7],
    [2.55, 6.4],
    [2.55, 2.5],
  ];
  s.push({
    kind: 'polygon',
    points: pts(bottle.map(([u, v]) => face(u, v))),
    fill: p.plastic,
  });
  s.push({
    kind: 'polygon',
    points: pts([
      face(2.55, 4.2),
      face(3.85, 4.2),
      face(3.85, 5.3),
      face(2.55, 5.3),
    ]),
    fill: p.brandForeground,
    opacity: 0.7,
  });
  s.push({
    kind: 'polygon',
    points: pts([
      face(2.95, 7.6),
      face(3.45, 7.6),
      face(3.45, 8.2),
      face(2.95, 8.2),
    ]),
    fill: p.brand,
  });
  // Viewfinder corners + scan line.
  const corner = (
    a: [number, number],
    b: [number, number],
    c: [number, number],
  ): Shape => ({
    kind: 'path',
    d: pathOf([face(...a), face(...b), face(...c)], false),
    stroke: p.primary,
    strokeWidth: 2.4,
  });
  s.push(corner([1, 8.4], [1, 9.4], [2, 9.4]));
  s.push(corner([4.4, 9.4], [5.4, 9.4], [5.4, 8.4]));
  s.push(corner([1, 2.4], [1, 1.4], [2, 1.4]));
  s.push(corner([4.4, 1.4], [5.4, 1.4], [5.4, 2.4]));
  s.push({
    kind: 'polygon',
    points: pts([
      face(0.9, 5.4),
      face(5.5, 5.4),
      face(5.5, 6.2),
      face(0.9, 6.2),
    ]),
    fill: p.primary,
    opacity: 0.22,
  });
  s.push({
    kind: 'path',
    d: pathOf([face(0.9, 5.8), face(5.5, 5.8)], false),
    stroke: p.primary,
    strokeWidth: 1.8,
  });

  // Dashed flight path from the phone to the bins.
  const arc = [iso(-0.2, -5.4, 7.5), iso(1.5, -1, 10), iso(-1.6, 3.4, 4.2)];
  s.push({
    kind: 'path',
    d: `M${arc[0]![0]} ${arc[0]![1]} Q${arc[1]![0]} ${arc[1]![1]} ${arc[2]![0]} ${arc[2]![1]}`,
    stroke: p.brandForeground,
    strokeWidth: 2.2,
    dash: '0.1 7',
    opacity: 0.75,
  });

  // Bins along the front edge.
  const bins = [
    { x: -6.2, color: p.organic, glyph: 'leaf' },
    { x: -3, color: p.plastic, glyph: 'bottle' },
    { x: 0.2, color: p.paper, glyph: 'sheet' },
  ] as const;
  const by = 3.4;
  for (const bin of bins) {
    s.push(groundShadow(bin.x + 1.3, by + 1.7, 2, p, 0.3));
    s.push(
      ...B(bin.x, by, -1, 2.6, 2.6, 3.6, bin.color, {
        top: 0.25,
        left: 0,
        right: 0.26,
      }),
    );
    s.push(
      ...B(bin.x - 0.15, by - 0.15, 2.6, 2.9, 2.9, 0.45, bin.color, {
        top: 0.4,
        left: 0.06,
        right: 0.3,
      }),
    );
    s.push(
      ...B(bin.x + 1, by + 1, 3.05, 0.6, 0.6, 0.25, bin.color, {
        top: 0.45,
        left: 0.1,
        right: 0.3,
      }),
    );
    const g = (u: number, v: number) => onLeftFace(bin.x, by + 2.6, -1, u, v);
    if (bin.glyph === 'leaf') {
      s.push({
        kind: 'path',
        d: `M${g(0.7, 0.8).join(' ')} Q${g(0.6, 2.4).join(' ')} ${g(1.8, 2.6).join(' ')} Q${g(1.9, 1).join(' ')} ${g(0.7, 0.8).join(' ')} Z`,
        fill: p.brandForeground,
        opacity: 0.88,
      });
    } else if (bin.glyph === 'bottle') {
      s.push({
        kind: 'polygon',
        points: pts([
          g(0.95, 0.7),
          g(1.45, 0.7),
          g(1.45, 2),
          g(1.3, 2.3),
          g(1.3, 2.6),
          g(1.1, 2.6),
          g(1.1, 2.3),
          g(0.95, 2),
        ]),
        fill: p.brandForeground,
        opacity: 0.88,
      });
    } else {
      s.push({
        kind: 'polygon',
        points: pts([g(0.75, 0.7), g(1.65, 0.7), g(1.65, 2.6), g(0.75, 2.6)]),
        fill: p.brandForeground,
        opacity: 0.88,
      });
      for (const v of [1.2, 1.6, 2])
        s.push({
          kind: 'path',
          d: pathOf([g(0.9, v), g(1.5, v)], false),
          stroke: bin.color,
          strokeWidth: 1.2,
        });
    }
  }

  // Floating AI result card.
  const card = { x: 1.6, y: -8.2, z: 9.6 };
  s.push(groundShadow(4, -5.8, 2.6, p, 0.18));
  s.push(
    ...B(card.x, card.y, card.z, 5.4, 3.6, 0.35, p.brandForeground, {
      top: 0,
      left: 0.12,
      right: 0.25,
    }),
  );
  const t = (u: number, w: number) =>
    onTop(card.x, card.y, card.z + 0.35, u, w);
  const dot = t(1, 1.8);
  s.push({
    kind: 'ellipse',
    cx: dot[0],
    cy: dot[1],
    rx: 5.5,
    ry: 3.2,
    fill: p.plastic,
  });
  s.push({
    kind: 'polygon',
    points: pts([t(1.8, 1.2), t(4.4, 1.2), t(4.4, 1.7), t(1.8, 1.7)]),
    fill: p.brand,
    opacity: 0.75,
  });
  s.push({
    kind: 'polygon',
    points: pts([t(1.8, 2.1), t(3.6, 2.1), t(3.6, 2.5), t(1.8, 2.5)]),
    fill: p.brand,
    opacity: 0.35,
  });
  const badge = iso(card.x + 5.6, card.y - 0.2, card.z + 1.5);
  s.push({
    kind: 'ellipse',
    cx: badge[0],
    cy: badge[1],
    rx: 9,
    ry: 9,
    fill: p.success,
  });
  s.push({
    kind: 'path',
    d: `M${badge[0] - 4} ${badge[1]} L${badge[0] - 1} ${badge[1] + 3} L${badge[0] + 4.5} ${badge[1] - 3.5}`,
    stroke: p.brandForeground,
    strokeWidth: 2.2,
  });

  // Floating litter heading to the bins.
  const leaf = iso(-7.5, 1.5, 5.4);
  s.push(groundShadow(-7.5, 1.5, 0.8, p, 0.18));
  s.push({
    kind: 'path',
    d: `M${leaf[0]} ${leaf[1]} q-9 -10 2 -18 q8 9 -2 18 Z`,
    fill: p.organic,
  });
  s.push({
    kind: 'path',
    d: `M${leaf[0]} ${leaf[1]} q1 -9 2 -16`,
    stroke: p.brandPressed,
    strokeWidth: 1,
    opacity: 0.5,
  });
  s.push(groundShadow(6.2, 1.8, 0.9, p, 0.18));
  s.push(
    ...B(5.6, 1.2, 4.2, 1.4, 1.8, 0.12, p.brandForeground, {
      top: 0,
      left: 0.15,
      right: 0.3,
    }),
  );

  // Ambient cubes + sparkles.
  s.push(
    ...B(-9.8, -3, 7.5, 0.8, 0.8, 0.8, p.brandForeground, {
      top: 0,
      left: 0.25,
      right: 0.4,
    }).map((sh) => ({ ...sh, opacity: (sh.opacity ?? 1) * 0.5 })),
  );
  s.push(...B(8.8, -9, 2.5, 0.6, 0.6, 0.6, p.primary));
  const sp = iso(card.x + 6.4, card.y - 1.8, card.z + 3.6);
  s.push(sparkle(sp[0], sp[1], 10, p.brandForeground));
  s.push(sparkle(sp[0] - 22, sp[1] - 8, 5, p.brandForeground, 0.7));
  const sp2 = iso(-8, -6, 9);
  s.push(sparkle(sp2[0], sp2[1], 5, p.brandForeground, 0.55));

  return s;
}

/** Serialise the scene to a standalone SVG string (used for design previews). */
export function sceneToSvg(p: ScenePalette): string {
  const grads = SCENE_GRADIENTS(p)
    .map((g) => {
      const stops = g.stops
        .map(
          (st) =>
            `<stop offset="${st.offset}" stop-color="${st.color}" stop-opacity="${st.opacity}"/>`,
        )
        .join('');
      return g.type === 'linear'
        ? `<linearGradient id="${g.id}" x1="${g.coords[0]}" y1="${g.coords[1]}" x2="${g.coords[2]}" y2="${g.coords[3]}">${stops}</linearGradient>`
        : `<radialGradient id="${g.id}" cx="${g.coords[0]}" cy="${g.coords[1]}" r="${g.coords[2]}">${stops}</radialGradient>`;
    })
    .join('');
  const body = buildScene(p)
    .map((sh) => {
      const op = sh.opacity === undefined ? '' : ` opacity="${sh.opacity}"`;
      if (sh.kind === 'polygon')
        return `<polygon points="${sh.points}" fill="${sh.fill}"${op}/>`;
      if (sh.kind === 'ellipse')
        return `<ellipse cx="${sh.cx}" cy="${sh.cy}" rx="${sh.rx}" ry="${sh.ry}" fill="${sh.fill}"${op}/>`;
      return `<path d="${sh.d}" fill="${sh.fill ?? 'none'}"${sh.stroke ? ` stroke="${sh.stroke}" stroke-width="${sh.strokeWidth ?? 1}" stroke-linecap="round" stroke-linejoin="round"` : ''}${sh.dash ? ` stroke-dasharray="${sh.dash}"` : ''}${op}/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}"><defs>${grads}</defs>${body}</svg>`;
}
