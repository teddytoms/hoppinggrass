// Every picture in the game, drawn as SVG in Ruhi's marker-pen style:
// her shapes, two layers of pen strokes on each colour, inky edges, wobbly
// lines, soft shadows for depth and glitter for magic.
// Each function returns SVG markup as text.

import { PIECES } from './data.js';

const INK = '#16161A';
const NS = 'http://www.w3.org/2000/svg';

const BODY = {
  round: 'M-70,0 C-70,-26 -30,-30 10,-26 C40,-23 68,-19 68,0 C68,19 40,23 10,26 C-30,30 -70,26 -70,0 Z',
  pointy: 'M-70,0 C-70,-26 -30,-30 10,-26 C40,-22 62,-10 84,0 C62,10 40,22 10,26 C-30,30 -70,26 -70,0 Z',
};
const bodyShape = nose => (nose === 'round' ? 'round' : 'pointy');
const BODY_SIZE = { little: [0.82, 0.86], long: [1, 0.96], jumbo: [1.14, 1.16] };

// Shared patterns, filters and gradients. Put once into the page, and into
// every picture that is turned into an image for the flight.
const DEFS = `
<pattern id="cc-hatchA" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(58)"><rect width="1.5" height="5" fill="#fff" opacity="0.24"/></pattern>
<pattern id="cc-hatchB" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-34)"><rect width="1.4" height="8" fill="#000" opacity="0.09"/></pattern>
<linearGradient id="cc-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.32"/><stop offset="0.4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#0B0F33" stop-opacity="0.4"/></linearGradient>
<radialGradient id="cc-halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFF6B0" stop-opacity="0.9"/><stop offset="1" stop-color="#FFF6B0" stop-opacity="0"/></radialGradient>
<radialGradient id="cc-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#14204A" stop-opacity="0"/><stop offset="1" stop-color="#14204A" stop-opacity="0.36"/></radialGradient>
<filter id="cc-wob" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter>
<filter id="cc-wob2" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter>
<filter id="cc-blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="cc-blur2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="cc-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.2  0 0 0 -0.9 0.56"/></filter>
<clipPath id="cc-clip-round"><path d="${BODY.round}"/></clipPath>
<clipPath id="cc-clip-pointy"><path d="${BODY.pointy}"/></clipPath>`;

export const defs = () => `<svg class="cc-defs" width="0" height="0" aria-hidden="true" style="position:absolute"><defs>${DEFS}</defs></svg>`;

const svg = (vb, inner, extra = '') => `<svg viewBox="${vb}" ${extra}>${inner}</svg>`;

// A picture that stands alone (for drawing onto the flight canvas).
export function standalone(markup, width, height) {
  return markup.replace(/^<svg /, `<svg xmlns="${NS}" width="${width}" height="${height}" `).replace('>', `><defs>${DEFS}</defs>`);
}

// One coloured-in shape: the colour, two layers of pen strokes, an inky edge.
const pen = (shape, fill, edge = 'rgba(0,0,0,0.35)', w = 1) =>
  shape(`fill="${fill}" stroke="${edge}" stroke-width="${w}" stroke-linejoin="round"`) + shape('fill="url(#cc-hatchA)"') + shape('fill="url(#cc-hatchB)"');
const poly = pts => a => `<polygon points="${pts}" ${a}/>`;
const path = d => a => `<path d="${d}" ${a}/>`;
const ell = (cx, cy, rx, ry) => a => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`;
const rect = (x, y, w, h, r = 0) => a => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${a}/>`;

const SPK = 'M0,-7 Q1,-1 7,0 Q1,1 0,7 Q-1,1 -7,0 Q-1,-1 0,-7 Z';
const sparkle = (x, y, s = 1, fill = '#fff', cls = 'tw') => `<path class="${cls}" d="${SPK}" transform="translate(${x} ${y}) scale(${s})" fill="${fill}"/>`;
const HEART = 'M0,7 C-13,-4 -6,-13 0,-5 C6,-13 13,-4 0,7 Z';
const STAR = '0,-16 4.1,-5.7 15.2,-4.9 6.7,2.2 9.4,12.9 0,7 -9.4,12.9 -6.7,2.2 -15.2,-4.9 -4.1,-5.7';
const BOLT = '4,-15 -9,2 -1,2 -5,15 9,-3 1,-3';
const CLOUD = 'M-24,8 a9,9 0 0 1 6,-15 a11,11 0 0 1 20,-5 a10,10 0 0 1 16,10 a8,8 0 0 1 -2,14 q-20,6 -40,-4 Z';
const SCRIB = '-44,18 42,16 -38,10 46,6 -34,2 40,-4 -30,-8 36,-14 -24,-18 22,-22';
const berryG = (x = 0, y = 0, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0,-5 C7,-6 7,3 0,7 C-7,3 -7,-6 0,-5 Z" fill="#E8341F" stroke="#9E1A0C" stroke-width="0.8"/><path d="M-2,0 h0.1 M2,1 h0.1 M0,3.5 h0.1" stroke="#FFD91A" stroke-width="1.6" stroke-linecap="round"/><polygon points="0,-4 -6,-9 -2,-6 0,-11 2,-6 6,-9" fill="#0B6B4F"/></g>`;

/* ---------- The plane, seen from above, nose to the right ---------- */

const RAINBOW = [
  ['-74,-30 -38,-30 -50,30 -74,30', '#1877F2'], ['-74,4 -47,30 -74,30', '#0B6B4F'],
  ['-38,-30 -28,-30 -34,30 -50,30', '#E8341F'], ['-28,-30 -18,-30 -26,30 -34,30', '#6B3A1E'],
  ['-18,-30 -4,-30 -14,30 -26,30', '#7A22C4'], ['-4,-30 6,-30 0,30 -14,30', '#FF2E9A'],
  ['6,-30 24,-30 16,30 0,30', '#FF7A12'], ['24,-30 32,-30 28,30 16,30', '#22C3C9'],
  ['32,-30 44,-30 40,30 28,30', '#2433B8'], ['44,-30 90,-30 90,30 40,30', '#C6A2F2'],
];

function paintMarks(id) {
  const stripes = list => `<g stroke="#000" stroke-opacity="0.2" stroke-width="0.8">${list.map(([p, c]) => `<polygon points="${p}" fill="${c}"/>`).join('')}</g>`;
  if (id === 'two-colours') return stripes([['-74,-30 4,-30 -10,30 -74,30', '#FF2E9A'], ['4,-30 90,-30 90,30 -10,30', '#22C3C9']]);
  if (id === 'rainbow') return stripes(RAINBOW);
  if (id === 'glitter-rainbow') {
    return stripes(RAINBOW) + '<polygon points="-30,-30 -14,-30 -44,30 -60,30" fill="#fff" opacity="0.28"/><polygon points="20,-30 28,-30 2,30 -6,30" fill="#fff" opacity="0.22"/>'
      + [[-52, -10], [-36, 12], [-12, -14], [4, 10], [20, -8], [36, 12], [48, -4], [-24, 2]].map(([x, y], i) => sparkle(x, y, 0.5 + (i % 3) * 0.12, i % 2 ? '#FFF6B0' : '#fff')).join('');
  }
  return '<rect x="-74" y="-30" width="164" height="60" fill="#C9CED6"/><polygon points="-74,-6 90,-12 90,2 -74,8" fill="#E3E7EE"/>';
}

function noseMarks(id) {
  if (id === 'pointy') return '<polygon points="58,-30 77,-30 77,30 56,30" fill="#FFD91A"/><polygon points="77,-30 90,-30 90,30 77,30" fill="#16161A"/>';
  if (id === 'glitter-nose') return '<polygon points="54,-30 66,-30 64,30 52,30" fill="#FF2E9A"/><polygon points="66,-30 78,-30 78,30 64,30" fill="#FFD91A"/><polygon points="78,-30 90,-30 90,30 78,30" fill="#7A22C4"/>' + sparkle(70, -3, 0.55) + sparkle(60, 6, 0.4, '#FFF6B0');
  return '<polygon points="52,-30 70,-30 70,30 50,30" fill="#8D939D"/>';
}

const lerp = (a, b, t) => a + (b - a) * t;

// The top wing; the bottom one is its mirror.
function wingHalf(id) {
  if (id === 'paper') {
    return pen(poly('-6,-22 16,-22 8,-58 -8,-56'), '#EEF0F4', '#8D939D') + '<path d="M5,-22 L1,-57" stroke="#8D939D" stroke-width="1" fill="none"/>';
  }
  if (id === 'rainbow-wings') {
    const cols = ['#FF2E9A', '#FF7A12', '#FFD91A', '#22C3C9'];
    const at = t => [lerp(-6, -14, t), lerp(24, 12, t), lerp(-24, -69, t)];
    let out = '';
    cols.forEach((c, i) => {
      const [l0, r0, y0] = at(i / 4), [l1, r1, y1] = at((i + 1) / 4);
      out += pen(poly(`${l0},${y0} ${r0},${y0} ${r1},${y1} ${l1},${y1}`), c, 'rgba(0,0,0,0.3)', 0.8);
    });
    return out + pen(poly('-14,-69 12,-69 9,-88 -12,-85'), '#C6A2F2', '#6B3FB8') + sparkle(2, -76, 0.45);
  }
  return pen(poly('-4,-24 20,-23 12,-62 -8,-62'), '#22C3C9', '#0E7F86') + pen(poly('-8,-62 12,-62 9,-80 -7,-78'), '#FFAD96', '#D9755C');
}

function wingHull(id) {
  if (id === 'paper') return '-6,-22 16,-22 8,-58 -8,-56';
  if (id === 'rainbow-wings') return '-6,-24 24,-24 9,-88 -12,-85';
  return '-4,-24 20,-23 9,-80 -7,-78';
}

function engineHalf(id) {
  if (id === 'turbo') return pen(rect(-18, -42, 11, 6, 1), '#FF2E9A', '#B3136A', 0.8) + pen(rect(-20, -56, 11, 6, 1), '#FF2E9A', '#B3136A', 0.8);
  if (id === 'star-rockets') {
    const rocket = (x, y) => `<path d="M${x},${y} l-13,4 l13,4 Z" fill="#FF7A12"/><path d="M${x},${y + 2} l-7,2 l7,2 Z" fill="#FFE833"/>`
      + pen(path(`M${x},${y} h16 q7,4 0,8 h-16 Z`), '#7A22C4', '#3E0F6B', 0.8)
      + `<polygon points="${STAR}" transform="translate(${x + 8} ${y + 4}) scale(0.2)" fill="#FFD91A"/>`;
    return rocket(-24, -45) + rocket(-27, -60);
  }
  return pen(rect(-17, -45, 12, 8, 2), '#8D939D', '#4A4E5C', 0.8) + `<path d="M-19,-49 v16" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
}

const WHEEL = `<g fill="none" stroke="#4A4E5C" stroke-width="1.5"><path d="M34,-22 V-36"/><circle cx="34" cy="-42" r="6" fill="#DADDE4"/><path d="M28,-42 H40 M34,-48 V-36 M30,-46 L38,-38 M38,-46 L30,-38"/></g>`;

function topMarks(id, popped) {
  if (id === 'soft-seats') {
    return pen(rect(-24, -8, 48, 16, 6), '#BFF3FA', '#1A9FB0', 0.8)
      + [-16, -5, 6].map(x => pen(rect(x, -5, 9, 10, 3), '#FF8FC4', '#B3136A', 0.6)).join('');
  }
  if (id === 'snack-bar') {
    return pen(rect(-24, -9, 48, 18, 4), '#FFF3C4', '#A77B00', 0.8)
      + [-24, -12, 0, 12].map((x, i) => `<rect x="${x}" y="-9" width="12" height="6" fill="${i % 2 ? '#fff' : '#E8341F'}" opacity="0.9"/>`).join('')
      + '<circle cx="-12" cy="3" r="3.2" fill="#FF8FC4"/><circle cx="0" cy="3" r="3.2" fill="#7A4A2A"/><circle cx="12" cy="3" r="3.2" fill="#FFD91A"/>';
  }
  if (id === 'popup') {
    if (!popped) return pen(ell(0, 0, 22, 7), '#FFE833', '#A77B00', 0.9) + '<ellipse cx="0" cy="0" rx="15" ry="3.6" fill="none" stroke="#A77B00" stroke-width="0.8" stroke-dasharray="3 2.5"/>';
    const faces = [[-12, '#FF9F85'], [0, '#B46BFF'], [12, '#FF2E9A']].map(([x, c]) =>
      `<circle cx="${x}" cy="-1" r="4" fill="#BFF3FA" stroke="#A77B00" stroke-width="0.7"/><path d="M${x - 2.6},0.2 a2.6,2.6 0 0 1 5.2,0 Z" fill="${c}"/><circle cx="${x - 1}" cy="-0.9" r="0.45" fill="${INK}"/><circle cx="${x + 1}" cy="-0.9" r="0.45" fill="${INK}"/>`).join('');
    return '<ellipse cx="3" cy="5" rx="25" ry="9" fill="#0B0F33" opacity="0.4" filter="url(#cc-blur2)"/><ellipse cx="0" cy="2.5" rx="24" ry="8.4" fill="#C99A00"/>'
      + pen(ell(0, -1, 24, 8), '#FFE833', '#A77B00', 0.9) + faces;
  }
  return '';
}

export function sticker(id) {
  const g = {
    heart: `<path d="${HEART}" transform="scale(1.5)" fill="#FF2E9A" stroke="#4A1FB8" stroke-width="1.6"/>`,
    star: `<polygon points="${STAR}" fill="#FFD91A" stroke="#B97A00" stroke-width="1.6" stroke-linejoin="round"/>`,
    strawberry: berryG(0, 0, 2),
    lightning: `<polygon points="${BOLT}" fill="#FFE833" stroke="#4A1FB8" stroke-width="1.6" stroke-linejoin="round"/>`,
  }[id] ?? '';
  return svg('-20 -20 40 40', `<g filter="url(#cc-wob2)">${g}</g>`, 'class="art sticker"');
}
const stickerInner = id => sticker(id).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

// `show` lists the kinds of piece already put on (for the build animation);
// leave it out to draw the whole plane.
function planeInner(design, { popped = false, show = null } = {}) {
  const has = k => !show || show.includes(k);
  const d = { ...design, nose: has('nose') ? design.nose : 'round', paint: has('paint') ? design.paint : 'plain', top: has('top') ? design.top : 'none', stickers: has('stickers') ? design.stickers : [] };
  const [bx, by] = BODY_SIZE[d.body] ?? BODY_SIZE.little;
  const shape = bodyShape(d.nose);
  const shift = +(26 * by - 26).toFixed(2);
  const half = `<g transform="translate(0 ${-shift})">${has('wings') ? WHEEL + wingHalf(d.wings) : ''}${has('wings') && has('engines') ? engineHalf(d.engines) : ''}</g>`;
  const body = a => `<path d="${BODY[shape]}" ${a}/>`;
  const fins = d.nose === 'glitter-nose' ? pen(poly('50,-17 59,-24 60,-14'), '#A63BD9', '#5E1A85', 0.8) + pen(poly('50,17 59,24 60,14'), '#A63BD9', '#5E1A85', 0.8) : '';
  const stickers = (d.stickers ?? []).map(s => `<g transform="translate(${(s.x * 100).toFixed(1)} ${(s.y * 80).toFixed(1)}) scale(0.5)">${stickerInner(s.id)}</g>`).join('');
  return `<g filter="url(#cc-wob2)">${half}<g transform="scale(1,-1)">${half}</g>
<g transform="scale(${bx} ${by})"><g clip-path="url(#cc-clip-${shape})">${paintMarks(d.paint)}${noseMarks(d.nose)}</g>
${body('fill="url(#cc-hatchA)"')}${body('fill="url(#cc-hatchB)"')}${body('fill="url(#cc-shade)"')}
${body('fill="none" stroke="#B9BFC9" stroke-width="7"')}<path d="${BODY[shape]}" fill="none" stroke="#F4F6FA" stroke-width="1.6" transform="translate(0 -2.2)" opacity="0.8"/><path d="${BODY[shape]}" fill="none" stroke="#6F7682" stroke-width="1.1" transform="scale(1.06)"/>
<path d="M-48,-17 C-20,-22 20,-20 50,-11" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.55"/>
<path d="M-64,8 v8 M-61,8 v9 M-58,8 v10 M-55,8 v10" stroke="${INK}" stroke-width="1.8"/>${fins}</g></g>
<g transform="translate(${(-22 * bx).toFixed(1)} 0)"><g filter="url(#cc-wob2)">${topMarks(d.top, popped)}</g></g>${stickers}`;
}

const PLANE_VB = '-110 -95 220 190';
export const plane = (design, opts) => svg(PLANE_VB, planeInner(design, opts), 'class="art plane"');

// A soft dark shape of the plane, for its shadow on the ground.
export function planeShadow(design) {
  const [bx, by] = BODY_SIZE[design.body] ?? BODY_SIZE.little;
  const shift = +(26 * by - 26).toFixed(2);
  const wing = `<polygon points="${wingHull(design.wings)}" transform="translate(0 ${-shift})"/>`;
  return svg(PLANE_VB, `<g fill="#14204A" opacity="0.32" filter="url(#cc-blur)"><path d="${BODY[bodyShape(design.nose)]}" transform="scale(${bx} ${by})"/>${wing}<g transform="scale(1,-1)">${wing}</g></g>`, 'class="art shadow"');
}

// A picture of one piece on its own, for the workshop tray and the shop.
export function pieceIcon(id) {
  const p = PIECES[id];
  if (!p) return svg('-20 -20 40 40', '');
  const base = { body: 'long', wings: 'paper', engines: 'chuk', nose: 'round', top: 'none', paint: 'plain', stickers: [] };
  if (p.kind === 'body') {
    return svg('-88 -38 184 76', `<g filter="url(#cc-wob2)"><g transform="scale(${BODY_SIZE[id].join(' ')})"><g clip-path="url(#cc-clip-round)">${paintMarks('plain')}</g><path d="${BODY.round}" fill="url(#cc-shade)"/><path d="${BODY.round}" fill="none" stroke="#8D939D" stroke-width="5"/></g>${Array.from({ length: p.seats / 4 }, (_, i) => `<circle cx="${-30 + i * 22}" cy="0" r="7" fill="#BFF3FA" stroke="#4A4E5C" stroke-width="1.5"/>`).join('')}</g>`, 'class="art piece"');
  }
  if (p.kind === 'wings') return svg('-60 -95 110 190', `<g filter="url(#cc-wob2)">${wingHalf(id)}<g transform="scale(1,-1)">${wingHalf(id)}</g></g>`, 'class="art piece"');
  if (p.kind === 'engines') return svg('-44 -66 44 40', `<g filter="url(#cc-wob2)">${engineHalf(id)}</g>`, 'class="art piece"');
  if (p.kind === 'nose') {
    const shape = bodyShape(id);
    return svg('26 -36 66 72', `<g filter="url(#cc-wob2)"><g clip-path="url(#cc-clip-${shape})">${paintMarks('plain')}${noseMarks(id)}</g><path d="${BODY[shape]}" fill="url(#cc-shade)"/><path d="${BODY[shape]}" fill="none" stroke="#8D939D" stroke-width="5"/>${id === 'glitter-nose' ? pen(poly('50,-17 59,-24 60,-14'), '#A63BD9') + pen(poly('50,17 59,24 60,14'), '#A63BD9') : ''}</g>`, 'class="art piece"');
  }
  if (p.kind === 'top') {
    const none = '<circle r="12" fill="none" stroke="#8D939D" stroke-width="3" stroke-dasharray="5 4"/><path d="M-8,8 L8,-8" stroke="#8D939D" stroke-width="3" stroke-linecap="round"/>';
    return svg('-32 -20 64 40', `<g filter="url(#cc-wob2)">${id === 'none' ? none : topMarks(id, true)}</g>`, 'class="art piece"');
  }
  return svg('-90 -40 180 80', `<g filter="url(#cc-wob2)"><g clip-path="url(#cc-clip-round)">${paintMarks(id)}</g><path d="${BODY.round}" fill="url(#cc-hatchA)"/><path d="${BODY.round}" fill="url(#cc-shade)"/><path d="${BODY.round}" fill="none" stroke="#8D939D" stroke-width="4"/></g>`, 'class="art piece"');
}

/* ---------- Jellyfish: customers and the three bosses ---------- */

export const JELLY_COLOURS = [
  ['#FF9F85', '#22C3C9'], ['#C6A2F2', '#FF2E9A'], ['#FFD91A', '#FF7A12'],
  ['#8FE8C4', '#1877F2'], ['#FF8FC4', '#7A22C4'], ['#8FD3F5', '#2433B8'],
];

const LEGS = 'M-14,2 q5,8 0,15 q-5,7 0,13 M-5,2 q5,9 0,16 q-5,7 0,13 M5,2 q5,8 0,15 q-5,7 0,14 M14,2 q5,8 0,14 q-5,6 0,12';
const DOME = 'M-21,3 A21,21 0 0 1 21,3 Z';
const eyes = (lash = '#2433B8') => `<circle cx="-7" cy="-5" r="3.4" fill="#fff"/><circle cx="7" cy="-5" r="3.4" fill="#fff"/><circle cx="-6.4" cy="-4.6" r="1.7" fill="#22306B"/><circle cx="7.6" cy="-4.6" r="1.7" fill="#22306B"/>`
  + (lash ? `<path d="M-10,-9 l-1.5,-5 M-7,-9.5 v-5.5 M-4,-9 l1.5,-5 M4,-9 l-1.5,-5 M7,-9.5 v-5.5 M10,-9 l1.5,-5" stroke="${lash}" stroke-width="1.5" stroke-linecap="round"/>` : '');
const mouths = {
  happy: '<path d="M-4,0 q4,3 8,0" stroke="#D12B14" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  wow: '<ellipse cx="0" cy="0.5" rx="2.6" ry="2.2" fill="#D12B14"/>',
  idle: '<path d="M-3,0.5 h6" stroke="#D12B14" stroke-width="1.5" stroke-linecap="round"/>',
};

function jellyInner(dome, legs, mood = 'happy', lash) {
  return `<g filter="url(#cc-wob2)"><path d="${LEGS}" fill="none" stroke="${legs}" stroke-width="4.6" stroke-linecap="round"/><path d="${LEGS}" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>`
    + pen(path(DOME), dome, 'rgba(0,0,0,0.3)') + '<path d="M-15,-6 a16,16 0 0 1 12,-10" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.55"/>'
    + eyes(lash) + (mouths[mood] ?? mouths.happy) + '</g>';
}

export function jelly(colourIndex = 0, mood = 'happy') {
  const [dome, legs] = JELLY_COLOURS[colourIndex] ?? JELLY_COLOURS[0];
  return svg('-26 -26 52 62', jellyInner(dome, legs, mood, '#2433B8'), 'class="art jelly"');
}

export function boss(id, mood = 'idle') {
  const m = mood === 'happy' ? 'happy' : mood === 'wow' ? 'wow' : 'idle';
  let inner = '';
  if (id === 'ching') {
    inner = jellyInner('#FF2E9A', '#FFC400', m, '#7A22C4')
      + `<g filter="url(#cc-wob2)"><polygon points="-12,-19 -8,-27 -3,-20 0,-29 3,-20 8,-27 12,-19" fill="#FFD91A" stroke="#B97A00" stroke-width="1"/>${sparkle(-20, -16, 0.6, '#FFF6B0')}${sparkle(21, -10, 0.5)}${sparkle(17, 14, 0.45, '#FFF6B0')}</g>`;
  } else if (id === 'ityul') {
    inner = jellyInner('#C6A2F2', '#8FD3F5', m, '').replace(/<circle cx="-7" cy="-5" r="3.4"[^]*?<circle cx="7.6" cy="-4.6" r="1.7" fill="#22306B"\/>/, '<path d="M-10,-5 q3,3 6,0 M4,-5 q3,3 6,0" stroke="#22306B" stroke-width="1.6" fill="none" stroke-linecap="round"/>')
      + `<g filter="url(#cc-wob2)">${pen(rect(-17, 6, 22, 13, 5), '#fff', '#8D939D', 0.9)}<path d="M-13,9 h14 M-13,13 h14" stroke="#C6A2F2" stroke-width="1.2"/><path d="M-6,-21 q10,-12 20,-2 l3,-6" fill="none" stroke="#2433B8" stroke-width="3" stroke-linecap="round"/><circle cx="17" cy="-30" r="3" fill="#fff" stroke="#2433B8" stroke-width="1"/><text x="20" y="-14" font-size="8" fill="#2433B8" font-family="Marker Felt, Chalkboard SE, sans-serif">z</text></g>`;
  } else {
    // Teddy: brown, a moustache, and covered in mud and leeches.
    inner = jellyInner('#A66A3C', '#7A4A2A', m, '')
      + `<g filter="url(#cc-wob2)"><polyline points="-17,-2 14,-14 -12,-9 17,-6 -8,-17 12,-1" fill="none" stroke="#6B3A1E" stroke-width="1.4" opacity="0.7"/>
<ellipse cx="0" cy="-1.5" rx="2.6" ry="2" fill="#8D939D"/><path d="M-1,0.5 q-6,-1 -10,3 q6,2 10,-1 M1,0.5 q6,-1 10,3 q-6,2 -10,-1" fill="#3E2412"/>
<g fill="#3E2412"><circle cx="-15" cy="-10" r="1.6"/><circle cx="15" cy="-13" r="1.3"/><circle cx="-11" cy="16" r="1.5"/><circle cx="9" cy="22" r="1.7"/><circle cx="17" cy="9" r="1.3"/><circle cx="-18" cy="26" r="1.2"/><circle cx="1" cy="-18" r="1.2"/></g>
<path d="M11,-19 q4,-3 6,1 q2,4 6,1" fill="none" stroke="#FF5C8A" stroke-width="2.6" stroke-linecap="round"/><path d="M-20,8 q-4,3 -2,7" fill="none" stroke="#FF5C8A" stroke-width="2.4" stroke-linecap="round"/></g>`;
  }
  return svg('-30 -34 60 72', inner, `class="art boss boss-${id}"`);
}

/* ---------- Small things ---------- */

export const star = () => svg('-24 -24 48 48', `<circle r="24" fill="url(#cc-halo)"/><g filter="url(#cc-wob2)">${pen(poly(STAR), '#FFD91A', '#B97A00', 1.6)}</g>`, 'class="art star"');
export const heart = (fill = '#FFAD96') => svg('-16 -16 32 28', `<g filter="url(#cc-wob2)">${pen(path(HEART), fill, '#4A1FB8', 2)}</g>`, 'class="art heart"');
export const cloud = (streak = '#B88CEB', fill = '#fff') => svg('-34 -26 68 46', `<g filter="url(#cc-wob2)"><path d="${CLOUD}" fill="${fill}" stroke="${INK}" stroke-width="1"/><path d="M-12,2 l10,-8 M-5,9 l15,-13 M4,11 l11,-10" stroke="${streak}" stroke-width="4.5" stroke-linecap="round"/></g>`, 'class="art cloud"');
export const cloudShadow = () => svg('-44 -36 88 66', `<path d="${CLOUD}" fill="#14204A" opacity="0.24" filter="url(#cc-blur)"/>`);
export const berry = () => svg('-9 -13 18 22', berryG(), 'class="art berry"');
export const coin = () => svg('-12 -12 24 24', `<g filter="url(#cc-wob2)">${pen(ell(0, 0, 10, 10), '#FFD91A', '#B97A00', 1.4)}<circle r="6.5" fill="none" stroke="#B97A00" stroke-width="0.9"/><path d="M-2.5,-3.5 h5 M-2.5,3.5 h5 M0,-5.5 v11 M2.5,-2 q-2.5,-2 -5,0 q-1,2 2.5,2 q3.5,0.5 2.5,2.5 q-2.5,2 -5,0" fill="none" stroke="#8A5A00" stroke-width="1.1" stroke-linecap="round"/></g>`, 'class="art coin"');

const ICONS = {
  fast: pen(poly(BOLT), '#FFE833', '#4A1FB8', 1.6),
  pretty: `<path d="${SPK}" transform="scale(2.1)" fill="#FF2E9A" stroke="#4A1FB8" stroke-width="0.7"/><path d="${SPK}" transform="translate(10 -10) scale(0.8)" fill="#FFD91A"/>`,
  comfy: pen(rect(-14, -9, 28, 18, 7), '#C6A2F2', '#4A1FB8', 1.6) + '<path d="M-8,-3 h16 M-8,3 h16" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>',
  seat: `<g transform="translate(0 -3) scale(0.62)">${pen(path(DOME), '#FF9F85', '#4A1FB8', 2)}<path d="${LEGS}" fill="none" stroke="#22C3C9" stroke-width="4.6" stroke-linecap="round"/></g>`,
  'sound-on': `<path d="M-12,-5 h6 l8,-7 v24 l-8,-7 h-6 Z" fill="${INK}"/><path d="M6,-6 q5,6 0,12 M10,-10 q9,10 0,20" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
  'sound-off': `<path d="M-12,-5 h6 l8,-7 v24 l-8,-7 h-6 Z" fill="${INK}"/><path d="M7,-6 l10,12 M17,-6 l-10,12" stroke="#E8341F" stroke-width="2.6" stroke-linecap="round"/>`,
  lock: `<path d="M-6,-3 v-5 a6,6 0 0 1 12,0 v5" fill="none" stroke="#4A4E5C" stroke-width="3"/>${pen(rect(-10, -3, 20, 15, 3), '#8D939D', '#4A4E5C', 1.4)}<circle cy="4" r="2.2" fill="${INK}"/>`,
  back: `<path d="M8,-10 L-8,0 L8,10" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  piggy: pen(ell(0, 2, 14, 10), '#FF8FC4', '#B3136A', 1.4) + pen(ell(13, 2, 4, 3.4), '#FF5CA8', '#B3136A', 1) + `<circle cx="6" cy="-2" r="1.3" fill="${INK}"/><path d="M-4,-9 h7" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M-8,10 v4 M6,10 v4 M-6,-7 l-3,-5 l6,2" stroke="#B3136A" stroke-width="2.4" stroke-linecap="round" fill="#FF8FC4"/>`,
  shop: pen(poly('-13,-6 13,-6 10,13 -10,13'), '#22C3C9', '#0E7F86', 1.4) + `<path d="M-6,-6 v-3 a6,6 0 0 1 12,0 v3" fill="none" stroke="${INK}" stroke-width="2.2"/>` + sparkle(0, 4, 0.7, '#fff', ''),
  workshop: `<g transform="rotate(-40)">${pen(rect(-3, -4, 6, 20, 2), '#8D939D', '#4A4E5C', 1.2)}${pen(path('M-8,-14 a8,8 0 0 0 16,0 l-4,0 l0,5 l-8,0 l0,-5 Z'), '#B9BFC9', '#4A4E5C', 1.2)}</g>`,
  fly: pen(poly('-15,6 15,-12 5,14 0,4'), '#fff', INK, 1.6) + `<path d="M15,-12 L0,4" stroke="${INK}" stroke-width="1.4"/>`,
  ok: `<path d="M-10,1 L-3,9 L11,-9" fill="none" stroke="#138F2E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  goal: pen(poly(STAR), '#fff', '#B97A00', 1.6),
  'goal-on': pen(poly(STAR), '#FFD91A', '#B97A00', 1.6),
  plus: `<path d="M-9,0 h18 M0,-9 v18" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
  pie: pen(ell(0, 0, 14, 14), '#FFD9A0', '#8A5A00', 1.4),
};
export const ICON_NAMES = Object.keys(ICONS);
export const icon = name => svg('-20 -20 40 40', `<g filter="url(#cc-wob2)">${ICONS[name] ?? ''}</g>`, `class="art icon icon-${name}"`);

/* ---------- Places and scenery ---------- */

export function skyPalette(sky) {
  if (sky === 'night') return { ground: '#1D1A52', field: '#2B2A78', grass: '#12806E', grass2: '#39F0D0', water: '#2A2FA8', water2: '#5B6CFF', ink: '#C9D3FF', road: '#3A3C6E', cloud: '#B9A8F2', streak: '#FF8FE0', glow: true };
  if (sky === 'sunset') return { ground: '#FFD7B0', field: '#FFB37A', grass: '#B8402A', grass2: '#F0803C', water: '#FFC2D4', water2: '#FF8FB3', ink: INK, road: '#C9A8A0', cloud: '#FFE9F2', streak: '#9B5DE5', glow: false };
  return { ground: '#D9F3CF', field: '#9FE08C', grass: '#138F2E', grass2: '#3CCB4A', water: '#B9EEF5', water2: '#7FE3EE', ink: INK, road: '#C9CCD6', cloud: '#fff', streak: '#B88CEB', glow: false };
}

const grassClump = (x, y, s, rot, pal) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><polyline points="${SCRIB}" fill="none" stroke="${pal.grass}" stroke-width="3.4" stroke-linejoin="bevel"/><polyline points="${SCRIB}" fill="none" stroke="${pal.grass2}" stroke-width="2" stroke-linejoin="bevel" transform="translate(4 3)"/></g>`;
const fieldPattern = (id, colour, size, w) => `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><path d="M0,0 h${w} l${-size},${size} h${-w} Z M${size},0 h${w} l${-size},${size} h${-w} Z" fill="${colour}" opacity="0.55"/></pattern>`;

// The ground seen from above. It repeats sideways, for the flight.
export function groundStrip(sky, width = 2048, height = 768) {
  const pal = skyPalette(sky);
  const clumps = [[180, 120, 2, -8], [520, 610, 2.4, 6], [900, 200, 1.8, 12], [1250, 560, 2.6, -10], [1620, 150, 2.2, 4], [1880, 640, 1.8, -6], [760, 420, 1.5, 20], [1450, 330, 1.6, -18]];
  const berries = [[200, 150], [560, 640], [600, 600], [1290, 590], [1230, 540], [1660, 170], [930, 230]];
  const hearts = [[380, 330, '#FF8FC4'], [1080, 110, '#FFD91A'], [1760, 430, '#C6A2F2']];
  return `<svg viewBox="0 0 ${width} ${height}"><defs>${fieldPattern('cc-field', pal.field, 32, 20)}${fieldPattern('cc-water', pal.water2, 16, 9)}</defs>
<rect width="${width}" height="${height}" fill="${pal.ground}"/><rect width="${width}" height="${height}" fill="url(#cc-field)"/>
<g filter="url(#cc-wob)">
<path d="M1050,${height + 10} C1010,650 1130,600 1090,520 C1060,450 1150,400 1340,430 C1500,455 1470,560 1560,640 C1620,700 1600,740 1610,${height + 10} Z" fill="${pal.water}"/><path d="M1050,${height + 10} C1010,650 1130,600 1090,520 C1060,450 1150,400 1340,430 C1500,455 1470,560 1560,640 C1620,700 1600,740 1610,${height + 10} Z" fill="url(#cc-water)" stroke="${pal.water2}" stroke-width="3"/>
<ellipse cx="330" cy="560" rx="150" ry="70" fill="${pal.water}"/><ellipse cx="330" cy="560" rx="150" ry="70" fill="url(#cc-water)" stroke="${pal.water2}" stroke-width="3"/>
${clumps.map(c => grassClump(...c, pal)).join('')}${berries.map(([x, y]) => berryG(x, y, 2.6)).join('')}
${hearts.map(([x, y, c]) => `<path d="${HEART}" transform="translate(${x} ${y}) scale(2.2)" fill="${c}" stroke="${pal.glow ? '#fff' : '#4A1FB8'}" stroke-width="1.2" opacity="0.9"/>`).join('')}
</g></svg>`;
}

// A still background for the hangar and other screens: runway, grass, hearts.
export function backdrop(sky = 'day') {
  const pal = skyPalette(sky);
  return `<svg class="art backdrop" viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice"><defs>${fieldPattern(`cc-f-${sky}`, pal.field, 32, 20)}</defs>
<rect width="1024" height="768" fill="${pal.ground}"/><rect width="1024" height="768" fill="url(#cc-f-${sky})"/>
<g filter="url(#cc-wob)">
<g transform="translate(512 470) rotate(-6)"><rect x="-640" y="-74" width="1280" height="148" fill="${pal.road}"/><rect x="-640" y="-74" width="1280" height="148" fill="url(#cc-hatchB)"/><path d="M-640,-74 H640 M-640,74 H640" stroke="${pal.ink}" stroke-width="3"/><path d="M-600,0 H620" stroke="${pal.ink}" stroke-width="5" stroke-dasharray="34 28"/></g>
${grassClump(170, 250, 3, -6, pal)}${grassClump(820, 230, 3.4, -4, pal)}${grassClump(500, 150, 2.4, 4, pal)}${grassClump(230, 690, 3.2, -8, pal)}${grassClump(760, 680, 3.6, -5, pal)}
${berryG(150, 290, 3)}${berryG(860, 270, 3)}${berryG(250, 720, 3)}${berryG(800, 700, 3)}${berryG(720, 720, 3)}
</g>
<rect width="1024" height="768" fill="url(#cc-vig)"/></svg>`;
}

export function placePic(id) {
  const pics = {
    hills: `<rect x="-30" y="-30" width="60" height="60" fill="#BFEFC0"/><path d="M-30,10 Q-10,-20 8,2 Q20,-12 30,6 V30 H-30 Z" fill="#3CCB4A" stroke="#138F2E" stroke-width="1.5"/>${berryG(-12, 10, 1.3)}${berryG(6, 16, 1.3)}${berryG(18, 8, 1.1)}`,
    cloud: `<rect x="-30" y="-30" width="60" height="60" fill="#D9C8FA"/><g transform="translate(0 8) scale(0.9)"><path d="${CLOUD}" fill="#fff" stroke="${INK}" stroke-width="1"/></g><rect x="-12" y="-20" width="7" height="20" fill="#7A22C4"/><rect x="-2" y="-26" width="8" height="26" fill="#A63BD9"/><rect x="9" y="-16" width="6" height="16" fill="#7A22C4"/><path d="M-12,-20 l3.5,-6 l3.5,6 M-2,-26 l4,-6 l4,6 M9,-16 l3,-5 l3,5" fill="#FFD91A"/>`,
    heart: `<rect x="-30" y="-30" width="60" height="60" fill="#FFC2A8"/><ellipse cx="0" cy="6" rx="26" ry="16" fill="#7FE3EE"/><path d="${HEART}" transform="translate(0 6) scale(2)" fill="#FF2E9A" stroke="#4A1FB8" stroke-width="1"/><circle cx="14" cy="-18" r="6" fill="#FFD91A"/>`,
    zigzag: `<rect x="-30" y="-30" width="60" height="60" fill="#FFB37A"/><polyline points="-28,22 -14,-6 -6,14 6,-14 14,12 28,-10" fill="none" stroke="#B8402A" stroke-width="5" stroke-linejoin="bevel"/><polyline points="-28,26 -14,2 -6,20 6,-6 14,18 28,-2" fill="none" stroke="#FFD91A" stroke-width="2.5" stroke-linejoin="bevel"/>`,
    falls: `<rect x="-30" y="-30" width="60" height="60" fill="#241A5E"/><path d="M-10,-30 V14 M0,-30 V18 M10,-30 V14" stroke="#7FE3EE" stroke-width="6" stroke-linecap="round"/><ellipse cx="0" cy="20" rx="24" ry="7" fill="#5B6CFF"/>${sparkle(-18, -10, 0.8, '#FFF6B0', '')}${sparkle(19, -2, 0.7, '#fff', '')}${sparkle(4, 4, 0.5, '#FF8FE0', '')}`,
    lagoon: `<rect x="-30" y="-30" width="60" height="60" fill="#14103E"/><circle cx="12" cy="-12" r="11" fill="#F4E9FF"/><circle cx="17" cy="-15" r="10" fill="#14103E"/><ellipse cx="0" cy="18" rx="26" ry="9" fill="#2A2FA8"/><g transform="translate(-10 4) scale(0.55)"><path d="${DOME}" fill="#39F0D0"/><path d="${LEGS}" fill="none" stroke="#39F0D0" stroke-width="4" stroke-linecap="round"/></g>${sparkle(-20, -18, 0.5, '#FFF6B0', '')}`,
    city: `<rect x="-30" y="-30" width="60" height="60" fill="#1A1446"/><g transform="scale(0.42) translate(0 -6)">${cityInner()}</g>`,
  };
  return svg('-30 -30 60 60', `<g filter="url(#cc-wob2)">${pics[id] ?? ''}</g>`, 'class="art place"');
}

function cityInner() {
  const tower = (x, h, w, c) => `<rect x="${x}" y="${-h}" width="${w}" height="${h}" fill="${c}" stroke="${INK}" stroke-width="1"/><path d="M${x},${-h} l${w / 2},${-w * 0.7} l${w / 2},${w * 0.7} Z" fill="#FFD91A" stroke="${INK}" stroke-width="1"/><rect x="${x + w / 2 - 2}" y="${-h + 6}" width="4" height="5" fill="#FFF6B0"/>`;
  return `<path d="M-46,10 q8,18 0,34 q-8,14 0,26 M-24,12 q8,20 0,38 q-8,14 0,24 M0,14 q8,20 0,40 q-8,16 0,28 M24,12 q8,20 0,38 q-8,14 0,24 M46,10 q8,18 0,34 q-8,14 0,26" fill="none" stroke="#22C3C9" stroke-width="7" stroke-linecap="round"/>
${pen(path('M-66,12 A66,60 0 0 1 66,12 Q0,30 -66,12 Z'), '#FF9F85', '#4A1FB8', 2)}
<path d="M-58,10 Q0,-14 58,10 Q0,22 -58,10 Z" fill="#3CCB4A" stroke="#138F2E" stroke-width="1.5"/>
${tower(-34, 26, 12, '#C6A2F2')}${tower(-14, 40, 14, '#FF2E9A')}${tower(6, 32, 12, '#22C3C9')}${tower(24, 22, 10, '#1877F2')}
${berryG(-44, 8, 1.2)}${berryG(42, 8, 1.2)}${berryG(-4, 12, 1.2)}
<path d="M-50,-22 a52,48 0 0 1 30,-22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
${sparkle(-70, -30, 1)}${sparkle(64, -40, 1.2, '#FFF6B0')}${sparkle(30, -62, 0.8)}${sparkle(-36, -58, 0.7, '#FFF6B0')}`;
}

// The flying jellyfish city: a giant jellyfish with gardens and towers on top.
export const city = () => svg('-90 -80 180 170', `<g filter="url(#cc-wob2)">${cityInner()}</g>`, 'class="art city"');

export const sparkleArt = (fill = '#fff') => svg('-8 -8 16 16', `<path d="${SPK}" fill="${fill}"/>`, 'class="art spark tw"');

// A baby dragon: small, round and friendly. It is lost and wants a ride.
export function dragon(mood = 'happy') {
  const inner = `<g filter="url(#cc-wob2)">
<path d="M-14,10 q-16,4 -12,-8 q2,8 12,2" fill="#22C3C9" stroke="#0E7F86" stroke-width="1.2"/>
${pen(path('M-6,-6 q-18,-18 -22,0 q6,-4 10,2 q4,-4 12,4 Z'), '#C6A2F2', '#6B3FB8', 1.2)}${pen(path('M6,-6 q18,-18 22,0 q-6,-4 -10,2 q-4,-4 -12,4 Z'), '#C6A2F2', '#6B3FB8', 1.2)}
${pen(ell(0, 8, 13, 12), '#22C3C9', '#0E7F86', 1.4)}${pen(ell(0, 11, 7.5, 7), '#FFE833', '#A77B00', 0.9)}
${pen(ell(0, -9, 12, 10.5), '#3AD6C0', '#0E7F86', 1.4)}
<path d="M-7,-18 l-2,-7 l5,5 Z M7,-18 l2,-7 l-5,5 Z" fill="#FF2E9A" stroke="#B3136A" stroke-width="0.8"/>
<circle cx="-4.6" cy="-10" r="3.6" fill="#fff"/><circle cx="4.6" cy="-10" r="3.6" fill="#fff"/><circle cx="-4" cy="-9.6" r="1.9" fill="#22306B"/><circle cx="5.2" cy="-9.6" r="1.9" fill="#22306B"/><circle cx="-3.4" cy="-10.4" r="0.6" fill="#fff"/><circle cx="5.8" cy="-10.4" r="0.6" fill="#fff"/>
<circle cx="-9" cy="-5" r="1.8" fill="#FF8FC4" opacity="0.8"/><circle cx="9" cy="-5" r="1.8" fill="#FF8FC4" opacity="0.8"/>
${mood === 'lost' ? '<ellipse cx="0" cy="-3.4" rx="1.8" ry="1.5" fill="#D12B14"/>' : '<path d="M-3.4,-4 q3.4,3.2 6.8,0" stroke="#D12B14" stroke-width="1.4" fill="none" stroke-linecap="round"/>'}
<path d="M-5,20 v3 M5,20 v3" stroke="#0E7F86" stroke-width="3" stroke-linecap="round"/></g>`;
  return svg('-32 -30 64 58', inner, 'class="art dragon"');
}
