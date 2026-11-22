// All the pictures in the game, as SVG drawings copied from the approved
// mock-ups in design/mockups. Every function returns an <svg> string.

const INK = '#3B2A4A';
const G3 = `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">`;

const svg = (viewBox, label, body) =>
  `<svg viewBox="${viewBox}" role="img" aria-label="${label}">${body}</svg>`;

// Put one drawing inside a bigger SVG scene at a position and size.
export const place = (drawing, x, y, w, h) =>
  drawing.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

const star = (x, y, s = 1) => {
  const a = 4 * s, b = 9 * s;
  return `<path d="M${x} ${y - b - a}l${a} ${b} ${b} ${a}-${b} ${a}-${a} ${b}-${a}-${b}-${b}-${a} ${b}-${a}z"/>`;
};
const twinkles = points =>
  `<g fill="#FFE066" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">${points.map(p => star(...p)).join('')}</g>`;

/* ---------- Monsters: always 3 legs and 3 hands ---------- */

const LOOKS = {
  ella: { name: 'Ella', body: '#FF8FB1', lid: '#B58BF0', cheek: '#FF3D77', eyeY: 108, look: 1 },
  bella: { name: 'Bella', body: '#7CC8FF', lid: '#FF8FB1', cheek: '#2F8FE0', eyeY: 104, look: -1 },
  twinkle: { name: 'Twinkle', body: '#B79BFF', lid: '#FFC93C', cheek: '#7A4FE0', eyeY: 104, look: -1 },
  fife: { name: 'Fife', body: '#8EDB9A', lid: '#6EC6FF', cheek: '#2E9E55', eyeY: 104, look: -1 },
  ghuy: { name: 'Ghuy', body: '#FFA94D', lid: '#5ED6B0', cheek: '#E8590C', eyeY: 104, look: -1 },
};
// What makes each new monster its own: Twinkle's crown, Fife's bow, Ghuy's zigzag tummy and wiggle lines.
const EXTRAS = {
  twinkle: `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round"><path d="M80 72l-8-30 20 14 18-22 18 22 20-14-8 30z" fill="#FFC93C"/><circle cx="110" cy="58" r="5" fill="#FF5E8A"/></g>`,
  fife: `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"><path d="M110 176l-22-12v24zM110 176l22-12v24z" fill="#FF8FB1"/><circle cx="110" cy="176" r="6" fill="#FF5E8A"/></g>`,
  ghuy: `<path d="M62 172l12-10 12 10 12-10 12 10 12-10 12 10 12-10 12 10" fill="none" stroke="#FFE066" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><g stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M22 200q-8 10 0 20M198 200q8 10 0 20"/></g>`,
};
const LEGS = 'M80 200V250M80 250l-10 12M80 250v14M80 250l10 12M110 200V250M110 250l-10 12M110 250v14M110 250l10 12M140 200V250M140 250l-10 12M140 250v14M140 250l10 12';
const TOP_HAND = 'M110 70V28M110 28L98 12M110 28V8M110 28l12-16';
const BODY = 'M50 120C50 44 170 44 170 120V190C170 216 140 216 135 196C130 180 90 180 85 196C80 216 50 216 50 190Z';
const ARMS = {
  down: {
    d: 'M52 130L18 100M18 100L4 96M18 100L8 84M18 100l2-18M168 130l34 30M202 160l14-2M202 160l10 12M202 160l-2 16',
    tips: [[4, 96], [8, 84], [20, 82], [216, 158], [212, 172], [200, 176]],
  },
  up: {
    d: 'M52 120L16 78M16 78L2 76M16 78L8 64M16 78l4-16M168 120l36-42M204 78l14-2M204 78l8-14M204 78l-4-16',
    tips: [[2, 76], [8, 64], [20, 62], [218, 76], [212, 64], [200, 62]],
  },
};
const TOP_TIPS = [[98, 12], [110, 8], [122, 12]];
const OTHER_TIPS = [[70, 262], [80, 264], [90, 262], [100, 262], [110, 264],
  [120, 262], [130, 262], [140, 264], [150, 262]];
const MOOD_WORDS = { idle: 'smiling', happy: 'very happy', love: 'in love, with heart eyes', yuck: 'saying yuck, tongue out', shocked: 'looking shocked, hands in the air' };

function eyelidEyes(L) {
  const y = L.eyeY, px = L.look * 6;
  return `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
<path d="M72 ${y - 6}A16 13 0 0 1 104 ${y - 6}Z" fill="${L.lid}"/><path d="M116 ${y - 6}A16 13 0 0 1 148 ${y - 6}Z" fill="${L.lid}"/>
<ellipse cx="88" cy="${y}" rx="16" ry="12" fill="#fff"/><ellipse cx="132" cy="${y}" rx="16" ry="12" fill="#fff"/>
<path d="M76 ${y - 16}l-4-8M88 ${y - 19}v-9M100 ${y - 16}l4-8M120 ${y - 16}l-4-8M132 ${y - 19}v-9M144 ${y - 16}l4-8" fill="none" stroke-width="3"/></g>
<g class="m-blink"><ellipse cx="${88 + px}" cy="${y + 1}" rx="7" ry="8" fill="${INK}"/><ellipse cx="${132 + px}" cy="${y + 1}" rx="7" ry="8" fill="${INK}"/>
<circle cx="${90 + px}" cy="${y - 3}" r="2.5" fill="#fff"/><circle cx="${134 + px}" cy="${y - 3}" r="2.5" fill="#fff"/></g>`;
}

function face(id, mood, L) {
  const y = L.eyeY;
  const cheeks = `<circle cx="64" cy="${y + 22}" r="8" fill="${L.cheek}" opacity=".45"/><circle cx="156" cy="${y + 22}" r="8" fill="${L.cheek}" opacity=".45"/>`;
  const bigSmile = `<path d="M92 ${y + 20}Q110 ${y + 44} 128 ${y + 20}Z" fill="#7A2340" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  if (mood === 'shocked') {
    return `<g stroke="${INK}" stroke-width="4"><circle cx="88" cy="104" r="17" fill="#fff"/><circle cx="132" cy="104" r="17" fill="#fff"/><ellipse cx="110" cy="148" rx="13" ry="15" fill="#7A2340"/></g>
<circle cx="88" cy="104" r="5" fill="${INK}"/><circle cx="132" cy="104" r="5" fill="${INK}"/>
<g stroke="${INK}" stroke-width="4" stroke-linecap="round"><path d="M36 40l-14-12M30 58l-18-2M184 40l14-12M190 58l18-2"/></g>`;
  }
  if (mood === 'yuck') {
    return `<g stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M80 ${y - 8}l18 10-18 10M140 ${y - 8}l-18 10 18 10"/><path d="M92 ${y + 34}Q110 ${y + 24} 128 ${y + 34}"/></g>
<path d="M102 ${y + 32}h16v14a8 8 0 0 1-16 0z" fill="#FF5E8A" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  }
  if (mood === 'love') {
    return `<g fill="#EF476F" stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M88 ${y + 14}l-14-14a8 8 0 0 1 14-8a8 8 0 0 1 14 8z"/><path d="M132 ${y + 14}l-14-14a8 8 0 0 1 14-8a8 8 0 0 1 14 8z"/>
<path d="M30 36l-8-8a5 5 0 0 1 8-5a5 5 0 0 1 8 5z"/><path d="M190 30l-8-8a5 5 0 0 1 8-5a5 5 0 0 1 8 5z"/></g>${cheeks}${bigSmile}`;
  }
  if (mood === 'happy') return eyelidEyes(L) + cheeks + bigSmile;
  const smile = id === 'ella'
    ? `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"><rect x="90" y="${y + 20}" width="40" height="16" rx="8" fill="#fff"/><path d="M100 ${y + 20}V${y + 36}M110 ${y + 20}V${y + 36}M120 ${y + 20}V${y + 36}"/></g>`
    : `<path d="M98 ${y + 22}Q110 ${y + 34} 122 ${y + 22}" stroke="#E0312E" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  return eyelidEyes(L) + cheeks + smile;
}

// look: 1 looks to the right, -1 to the left (each monster has its own usual side).
export function monster(id, mood = 'idle', look) {
  const L = { ...LOOKS[id], look: look ?? LOOKS[id].look };
  const arms = mood === 'idle' || mood === 'yuck' ? ARMS.down : ARMS.up;
  const bodyColour = mood === 'yuck' ? '#B9E08A' : L.body;
  const quiet = mood === 'shocked' || mood === 'yuck';
  const marks = id === 'ella'
    ? `${quiet ? '' : '<ellipse cx="110" cy="156" rx="32" ry="20" fill="#FFD0DF"/>'}<g fill="${mood === 'yuck' ? '#8CBF5A' : '#F2608C'}"><circle cx="64" cy="170" r="6"/><circle cx="156" cy="176" r="7"/><circle cx="150" cy="84" r="5"/><circle cx="68" cy="90" r="4"/></g>`
    : `<g fill="#FFE066"><path d="M62 84l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M156 160l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M152 80l2 4 4 2-4 2-2 4-2-4-4-2 4-2z"/><path d="M64 176l2 4 4 2-4 2-2 4-2-4-4-2 4-2z"/></g>`;
  const dots = list => list.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('');
  const tips = dots([...OTHER_TIPS, ...arms.tips]);
  const tagY = quiet ? 164 : 146;
  const tag = id === 'bella'
    ? `<rect x="82" y="${tagY}" width="56" height="22" rx="5" fill="#fff" stroke="${INK}" stroke-width="3.5"/><text x="110" y="${tagY + 17}" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="15" fill="${INK}">Bella</text>`
    : '';
  return svg('0 0 220 280', `${L.name}, a monster with three legs and three hands, ${MOOD_WORDS[mood] ?? MOOD_WORDS.idle}`,
    `<g class="m-breathe"><g class="m-wave"><path d="${TOP_HAND}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><g class="m-glow" fill="#FFE066" stroke="${INK}" stroke-width="2.5">${dots(TOP_TIPS)}</g></g>
<g stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="${LEGS}"/><path d="${arms.d}"/><path fill="${bodyColour}" d="${BODY}"/></g>
${marks}<g class="m-glow" fill="#FFE066" stroke="${INK}" stroke-width="2.5">${tips}</g>${face(id, mood, L)}${tag}${EXTRAS[id] ?? ''}</g>`);
}

/* ---------- Victoria the waiter and the chef ---------- */

export function waiter() {
  return svg('-34 0 276 364', 'Victoria the waiter, with golden hair, a blue dress, a red apron and a floating notebook',
    `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
<path d="M30 196C8 60 84 16 124 20C182 14 236 72 212 200L194 176H46Z" fill="#E8A93A"/>
<rect x="111" y="188" width="18" height="44" fill="#FFD3B8"/>
<rect x="95" y="334" width="10" height="14" fill="#FFD3B8"/><rect x="135" y="334" width="10" height="14" fill="#FFD3B8"/>
<path d="M72 290L40 338H200L168 290Z" fill="#5B8FD9"/>
<rect x="70" y="226" width="100" height="70" rx="8" fill="#5B8FD9"/>
<rect x="38" y="238" width="34" height="18" rx="7" fill="#9CCBF2"/><rect x="168" y="238" width="34" height="18" rx="7" fill="#9CCBF2"/>
<circle cx="32" cy="247" r="10" fill="#FFD3B8"/><circle cx="208" cy="247" r="10" fill="#FFD3B8"/>
<path d="M104 228H136L152 322H88Z" fill="#D8433B"/>
<rect x="109" y="284" width="22" height="17" rx="3" fill="#A0673A"/>
<ellipse cx="94" cy="350" rx="18" ry="9" fill="#5B8FD9"/><ellipse cx="146" cy="350" rx="18" ry="9" fill="#5B8FD9"/>
<circle cx="82" cy="344" r="7" fill="#9CCBF2"/><circle cx="158" cy="344" r="7" fill="#9CCBF2"/>
<path d="M44 168C40 56 200 56 196 168C196 190 178 198 120 198C62 198 44 190 44 168Z" fill="#FFD3B8"/>
<path d="M48 120C60 44 170 40 194 112C150 78 96 80 48 120Z" fill="#E8A93A"/>
<path d="M70 124A22 16 0 0 1 114 124Z" fill="#7FB2E5"/><path d="M126 124A22 16 0 0 1 170 124Z" fill="#7FB2E5"/>
<ellipse cx="92" cy="132" rx="22" ry="15" fill="#fff"/><ellipse cx="148" cy="132" rx="22" ry="15" fill="#fff"/>
<path d="M76 112l-5-10M90 108v-11M104 112l5-10M132 112l-5-10M146 108v-11M160 112l5-10" fill="none" stroke-width="3"/>
</g>
<ellipse cx="84" cy="133" rx="10" ry="11" fill="${INK}"/><ellipse cx="140" cy="133" rx="10" ry="11" fill="${INK}"/><circle cx="88" cy="128" r="3.5" fill="#fff"/><circle cx="144" cy="128" r="3.5" fill="#fff"/>
<circle cx="66" cy="162" r="10" fill="#FF8A73" opacity=".5"/><circle cx="174" cy="162" r="10" fill="#FF8A73" opacity=".5"/>
<path d="M102 162Q122 182 142 160" fill="none" stroke="#E0312E" stroke-width="6" stroke-linecap="round"/>
<g class="floaty"><g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
<rect x="-12" y="186" width="40" height="50" rx="5" fill="#fff" transform="rotate(-10 8 211)"/><path d="M-2 208l20-4M0 220l20-4" fill="none" stroke-width="3"/>
<path class="w-pencil" d="M-14 172L0 200" fill="none" stroke="#FF5E8A" stroke-width="6"/></g>
<path d="M-18 146l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#FFE066" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></g>`);
}

// holding: 'spoon' in the kitchen, 'basket' in the garden.
export function chef(holding = 'spoon') {
  const held = holding === 'basket'
    ? `<path d="M196 252h64l-8 46h-48z" fill="#E0A458"/><path d="M202 252Q228 214 254 252" fill="none"/><path d="M204 268h48M206 284h44" fill="none" stroke-width="3"/>`
    : `<path d="M214 240L232 190" fill="none" stroke="#A0673A" stroke-width="7"/><ellipse cx="236" cy="178" rx="11" ry="15" fill="#E0A458" transform="rotate(20 236 178)"/>`;
  return svg('0 -40 270 404', 'The chef, a child in a very tall chef hat with a star',
    `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
<path d="M36 190C20 80 80 40 124 44C176 40 222 84 206 190L190 170H50Z" fill="#5A3A28"/>
<rect x="111" y="188" width="18" height="44" fill="#C98A5E"/>
<rect x="88" y="320" width="26" height="24" fill="#5ED6B0"/><rect x="126" y="320" width="26" height="24" fill="#5ED6B0"/>
<rect x="68" y="226" width="104" height="100" rx="12" fill="#fff"/>
<path d="M96 226L120 252L144 226Z" fill="#5ED6B0"/>
<circle cx="104" cy="272" r="5" fill="#FFC93C"/><circle cx="104" cy="296" r="5" fill="#FFC93C"/><circle cx="136" cy="272" r="5" fill="#FFC93C"/><circle cx="136" cy="296" r="5" fill="#FFC93C"/>
<rect x="36" y="238" width="34" height="18" rx="7" fill="#fff"/><rect x="170" y="238" width="34" height="18" rx="7" fill="#fff"/>
<circle cx="30" cy="247" r="10" fill="#C98A5E"/><circle cx="210" cy="247" r="10" fill="#C98A5E"/>
<ellipse cx="96" cy="350" rx="20" ry="9" fill="#FF5E8A"/><ellipse cx="144" cy="350" rx="20" ry="9" fill="#FF5E8A"/>
<circle cx="82" cy="344" r="7" fill="#FFC93C"/><circle cx="158" cy="344" r="7" fill="#FFC93C"/>
<path d="M44 168C40 56 200 56 196 168C196 190 178 198 120 198C62 198 44 190 44 168Z" fill="#C98A5E"/>
<path d="M66 84C40 60 50 14 84 22C80-14 116-34 134-10C158-36 196-10 180 26C208 30 204 70 176 84Z" fill="#fff"/>
<path d="M62 84H180V104H62Z" fill="#fff"/>
<path d="M70 126A22 16 0 0 1 114 126Z" fill="#5ED6B0"/><path d="M126 126A22 16 0 0 1 170 126Z" fill="#5ED6B0"/>
<ellipse cx="92" cy="134" rx="22" ry="15" fill="#fff"/><ellipse cx="148" cy="134" rx="22" ry="15" fill="#fff"/>
<path d="M76 114l-5-8M90 110v-8M104 114l5-8M132 114l-5-8M146 110v-8M160 114l5-8" fill="none" stroke-width="3"/>
${held}</g>
<path d="M121 22l6 13 13 6-13 6-6 13-6-13-13-6 13-6z" fill="#FFC93C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<ellipse cx="94" cy="135" rx="10" ry="11" fill="${INK}"/><ellipse cx="150" cy="135" rx="10" ry="11" fill="${INK}"/><circle cx="98" cy="130" r="3.5" fill="#fff"/><circle cx="154" cy="130" r="3.5" fill="#fff"/>
<circle cx="66" cy="164" r="10" fill="#E0577F" opacity=".45"/><circle cx="174" cy="164" r="10" fill="#E0577F" opacity=".45"/>
<path d="M102 164Q122 184 142 162" fill="none" stroke="#E0312E" stroke-width="6" stroke-linecap="round"/>`);
}

/* ---------- Foods ---------- */

const FOOD_ART = {
  'orange-juice': ['Orange juice', `${G3}<path d="M18 18H46L42 56H22Z" fill="#fff"/><path d="M19.5 30H44.5L42 56H22Z" fill="#FF9F1C"/><path d="M36 24L42 6" fill="none"/><circle cx="48" cy="18" r="8" fill="#FFC93C"/><path d="M48 10V26M40 18H56" fill="none" stroke-width="2"/></g>`],
  pizza: ['Pizza', `${G3}<path d="M8 16Q32 4 56 16L32 60Z" fill="#FFD166"/><path d="M8 16Q32 4 56 16" fill="none" stroke="#C97B2A" stroke-width="7"/><path d="M8 16Q32 4 56 16L32 60Z" fill="none"/><circle cx="26" cy="26" r="5" fill="#EF476F"/><circle cx="39" cy="30" r="5" fill="#EF476F"/><circle cx="32" cy="43" r="4" fill="#EF476F"/></g>`],
  'mango-lassi': ['Mango lassi', `${G3}<path d="M18 16H46L42 58H22Z" fill="#FFC857"/><path d="M18 16H46L45 26Q32 32 19 26Z" fill="#fff"/><path d="M38 20L46 4" fill="none"/><path d="M24 10Q30 2 36 10Q30 14 24 10Z" fill="#5ED6B0"/></g>`],
  pie: ['Pie', `${G3}<path d="M6 40L40 14Q58 20 58 40Z" fill="#F2B56B"/><path d="M6 40H58V48H6Z" fill="#C97B2A"/><path d="M40 14Q58 20 58 40" fill="none" stroke="#C97B2A" stroke-width="6"/><path d="M40 14Q58 20 58 40" fill="none"/><path d="M28 34l4-4M38 36l4-4M34 26l4-4" fill="none" stroke="#EF476F" stroke-width="3"/></g>`],
};

export function food(id) {
  const [label, body] = FOOD_ART[id];
  return svg('0 0 64 64', label, body);
}

/* ---------- Ingredients, kitchen things and small pictures ---------- */

const G5 = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">`;
const SPARKLE = `<path d="M32 6L39 24L58 26L43 38L48 57L32 46L16 57L21 38L6 26L25 24Z" fill="#8B6BE8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><text x="32" y="42" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="22" fill="#fff">?</text>`;
const MANGO = 'M12 40Q8 20 28 12Q50 6 54 28Q56 50 36 55Q16 56 12 40Z';
const JUG = `<path d="M70 250H250L232 340H88Z" fill="#fff"/>`;
const JUG_TOP = `<path d="M250 262h34l-8 22h-30" fill="#fff"/><path d="M120 250Q160 150 200 250Z" fill="#FFC93C"/><path d="M140 250Q160 190 180 250M160 176V250" fill="none" stroke-width="3"/>`;
const GLASS = 'M10 10H130L110 200H30Z';
const glass = inside => `${G5}<path d="${GLASS}" fill="#fff" fill-opacity=".85"/>${inside}<path d="${GLASS}" fill="none"/></g>`;
const JUICE = `<path d="M17.4 80H122.6L110 200H30Z" fill="#FF9F1C" stroke-width="0"/>`;
const CUBES = `<g fill="#DFF4FB" stroke-width="3"><rect x="40" y="88" width="30" height="30" rx="6"/><rect x="68" y="104" width="30" height="30" rx="6" transform="rotate(12 83 119)"/></g>`;
const SLICE = `<g stroke-width="3"><circle cx="118" cy="26" r="24" fill="#FF9F1C"/><circle cx="118" cy="26" r="17" fill="#FFC93C"/><path d="M118 9V43M101 26H135M106 14L130 38M130 14L106 38" fill="none" stroke-width="2.5"/></g>`;
const BOARD = `${G5}<rect x="6" y="14" width="168" height="116" rx="18" fill="#E0A458"/><rect x="174" y="56" width="22" height="32" rx="8" fill="#E0A458"/><path d="M30 44H150M30 100H150" fill="none" stroke="#C4873E" stroke-width="4"/></g>`;
const DOUGH_DISC = `<circle cx="70" cy="70" r="62" fill="#F6E3B4"/>`;
const oven = on => `${G5}<rect x="10" y="10" width="160" height="180" rx="18" fill="#C9B8FF"/><rect x="28" y="72" width="124" height="96" rx="12" fill="${on ? '#FF8A3D' : '#5A4470'}"/>${on ? '<path d="M60 150Q50 120 72 104Q74 124 90 112Q88 96 100 90Q112 118 122 126Q130 140 122 152Z" fill="#FFE066" stroke-width="3"/>' : '<path d="M48 96L72 84M60 112L96 92" fill="none" stroke="#8B79A8" stroke-width="5"/>'}<path d="M40 56H140" fill="none" stroke-width="8"/><circle cx="44" cy="32" r="8" fill="#FFC93C" stroke-width="3"/><circle cx="72" cy="32" r="8" fill="#FF5E8A" stroke-width="3"/><circle cx="136" cy="32" r="8" fill="${on ? '#5ED6B0' : '#fff'}" stroke-width="3"/></g>`;
const blender = inside => `${G5}<path d="M30 170H110L122 212H18Z" fill="#6EC6FF"/><circle cx="70" cy="192" r="9" fill="#FFC93C" stroke-width="3"/><path d="M24 30H116L104 170H36Z" fill="#fff" fill-opacity=".85"/>${inside}<path d="M24 30H116L104 170H36Z" fill="none"/><rect x="28" y="14" width="84" height="16" rx="6" fill="#FF5E8A"/></g>`;
const CHUNKS = `<g fill="#FFB627" stroke-width="3"><circle cx="56" cy="150" r="13"/><circle cx="84" cy="152" r="12"/><circle cx="70" cy="130" r="12"/></g>`;
const DISH = `<path d="M10 34H170L150 100H30Z" fill="#B9A4F5"/><ellipse cx="90" cy="34" rx="82" ry="20" fill="#E4DBFF"/>`;
const PIE_BERRIES = `<g fill="#D6336C" stroke-width="3"><circle cx="60" cy="32" r="10"/><circle cx="84" cy="38" r="10"/><circle cx="108" cy="30" r="10"/><circle cx="126" cy="38" r="9"/><circle cx="44" cy="38" r="8"/></g>`;

// [viewBox, label, drawing]
const ITEM_ART = {
  orange: ['0 0 64 64', 'Orange', `${G3}<circle cx="32" cy="36" r="22" fill="#FF9F1C"/><path d="M32 14Q40 2 50 8Q44 18 32 14Z" fill="#3FB56B"/><path d="M20 30Q22 22 30 20" fill="none" stroke="#FFD08A"/></g>`],
  dough: ['0 0 64 64', 'Dough', `${G3}<path d="M10 40Q6 22 24 20Q34 8 46 20Q60 24 56 42Q52 56 32 56Q12 56 10 40Z" fill="#F6E3B4"/><path d="M22 32Q26 26 32 28M38 44Q44 44 46 38" fill="none" stroke="#D9BF85"/></g>`],
  tomato: ['0 0 64 64', 'Tomato', `${G3}<circle cx="32" cy="38" r="21" fill="#EF476F"/><path d="M20 18Q32 26 44 18Q38 14 32 6Q26 14 20 18Z" fill="#3FB56B"/></g>`],
  cheese: ['0 0 64 64', 'Cheese', `${G3}<path d="M6 50L48 14L58 50Z" fill="#FFD166"/><circle cx="36" cy="40" r="5" fill="#F2B134" stroke-width="2"/><circle cx="48" cy="34" r="3.5" fill="#F2B134" stroke-width="2"/><circle cx="22" cy="44" r="3.5" fill="#F2B134" stroke-width="2"/></g>`],
  crust: ['0 0 64 64', 'Pie crust', `${G3}<path d="M32 10Q38 4 44 12Q52 10 54 20Q62 24 56 32Q62 40 54 44Q52 54 44 52Q38 60 32 54Q26 60 20 52Q12 54 10 44Q2 40 8 32Q2 24 10 20Q12 10 20 12Q26 4 32 10Z" fill="#F2B56B"/><circle cx="32" cy="32" r="13" fill="#F7D08A" stroke-width="2"/></g>`],
  'crust-rolled': ['0 0 140 140', 'Rolled-out crust', `${G5}<circle cx="70" cy="70" r="62" fill="#F2B56B"/><circle cx="70" cy="70" r="46" fill="#F7D08A" stroke-width="3" stroke-dasharray="6 10"/></g>`],
  berry: ['0 0 64 64', 'Berry', `${G3}<path d="M32 60Q8 42 12 26Q18 14 32 20Q46 14 52 26Q56 42 32 60Z" fill="#EF476F"/><path d="M18 20Q32 28 46 20Q40 10 32 6Q24 10 18 20Z" fill="#3FB56B"/><g fill="#FFE066" stroke-width="0"><circle cx="24" cy="34" r="2"/><circle cx="34" cy="32" r="2"/><circle cx="42" cy="38" r="2"/><circle cx="28" cy="44" r="2"/><circle cx="37" cy="46" r="2"/></g></g>`],
  mango: ['0 0 64 64', 'Mango', `${G3}<path d="${MANGO}" fill="#FFB627"/><path d="M14 40Q12 26 24 18Q22 34 30 46Q22 50 14 40Z" fill="#EF6F47" stroke-width="0"/><path d="${MANGO}" fill="none"/><path d="M44 10Q50 2 58 6Q54 14 44 10Z" fill="#3FB56B"/></g>`],
  'mango-peeled': ['0 0 64 64', 'Peeled mango', `${G3}<path d="${MANGO}" fill="#FFD23F"/><path d="M22 30Q26 20 36 18M26 42Q32 46 40 44" fill="none" stroke="#FFF1A8"/></g>`],
  milk: ['0 0 64 64', 'Milk', `${G3}<path d="M24 12H40V22L48 32V58H16V32L24 22Z" fill="#fff"/><rect x="16" y="38" width="32" height="12" fill="#6EC6FF"/><rect x="22" y="4" width="20" height="8" rx="3" fill="#FF5E8A"/></g>`],
  ice: ['0 0 64 64', 'Ice cubes', `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" fill="#BFEAF5"><rect x="8" y="28" width="26" height="26" rx="5"/><rect x="30" y="12" width="26" height="26" rx="5" transform="rotate(12 43 25)"/></g>`],
  'orange-slice': ['0 0 64 64', 'Orange slice', `<g stroke="${INK}" stroke-width="3" stroke-linecap="round"><circle cx="32" cy="32" r="24" fill="#FF9F1C"/><circle cx="32" cy="32" r="18" fill="#FFC93C"/><path d="M32 14V50M14 32H50M19 19L45 45M45 19L19 45" fill="none" stroke-width="2.5"/></g>`],
  sparkle: ['0 0 64 64', 'Mystery sparkle', SPARKLE],
  twinkle: ['0 0 64 64', 'Sparkles', twinkles([[18, 22, 1.3], [46, 16, 0.9], [40, 46, 1.1]])],
  sun: ['0 0 64 64', 'Hot sun', `<g stroke="${INK}" stroke-width="3.5" stroke-linecap="round"><path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M52 12l-6 6M18 46l-6 6"/><circle cx="32" cy="32" r="15" fill="#FFC93C"/></g>`],
  rain: ['0 0 64 64', 'Rain cloud', `${G3}<path d="M16 38a11 11 0 0 1 2-22a15 15 0 0 1 29 2a10 10 0 0 1 1 20z" fill="#C9D6F2"/><path d="M20 46l-3 9M32 46l-3 9M44 46l-3 9" fill="none" stroke="#3F8FE0" stroke-width="4"/></g>`],
  party: ['0 0 64 64', 'Party hat', `${G3}<path d="M32 6L52 54H12Z" fill="#FF5E8A"/><path d="M24.5 24L41 28M19 38L47 44" fill="none" stroke="#FFE066" stroke-width="5"/><path d="M32 6L52 54H12Z" fill="none"/><circle cx="32" cy="7" r="6" fill="#FFC93C"/></g>`],
  star: ['0 0 64 64', 'Star', `<path d="M32 6L39 24L58 26L43 38L48 57L32 46L16 57L21 38L6 26L25 24Z" fill="#FFC93C" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`],
  'star-empty': ['0 0 64 64', 'Empty star', `<path d="M32 6L39 24L58 26L43 38L48 57L32 46L16 57L21 38L6 26L25 24Z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`],
  coin: ['0 0 40 40', 'Coin', `<circle cx="20" cy="20" r="17" fill="#FFC93C" stroke="${INK}" stroke-width="3.5"/><text x="20" y="28" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="22" fill="${INK}">$</text>`],
  lock: ['0 0 32 32', 'Locked', `<path d="M10 14V10a6 6 0 0 1 12 0v4" fill="none" stroke="#E4DBFF" stroke-width="3" stroke-linecap="round"/><rect x="6" y="14" width="20" height="14" rx="4" fill="#E4DBFF"/>`],
  piggy: ['0 0 64 54', 'Piggy bank', `${G3}<path d="M18 40v10M44 40v10" fill="none" stroke-width="6"/><ellipse cx="30" cy="28" rx="24" ry="18" fill="#FF8FB1"/><path d="M14 14l-2-10 12 6" fill="#FF8FB1"/><rect x="48" y="22" width="12" height="14" rx="5" fill="#FF5E8A"/><path d="M24 12h12" fill="none"/></g><circle cx="40" cy="22" r="2.5" fill="${INK}"/>`],
  tick: ['0 0 36 36', 'Done', `<circle cx="18" cy="18" r="16" fill="#3FB56B" stroke="${INK}" stroke-width="3"/><path d="M10 18l6 6 10-12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`],
  'sound-on': ['0 0 48 48', 'Sound is on', `${G3}<path d="M8 18H16L28 8V40L16 30H8Z" fill="#fff"/><path d="M34 16Q40 24 34 32M39 10Q49 24 39 38" fill="none"/></g>`],
  'sound-off': ['0 0 48 48', 'Sound is off', `${G3}<path d="M8 18H16L28 8V40L16 30H8Z" fill="#fff"/><path d="M34 18L44 30M44 18L34 30" fill="none" stroke="#E0312E" stroke-width="4"/></g>`],
  'juicer-empty': ['60 150 232 200', 'Juicer', `${G5}${JUG}${JUG_TOP}</g>`],
  'juicer-full': ['60 150 232 200', 'Juicer full of orange juice', `${G5}${JUG}<path d="M76 280H244L232 340H88Z" fill="#FF9F1C"/>${JUG_TOP}</g>`],
  'glass-empty': ['0 0 150 210', 'Empty glass', glass('')],
  'glass-juice': ['0 0 150 210', 'Glass of orange juice', glass(JUICE)],
  'glass-juice-ice': ['0 0 150 210', 'Orange juice with ice', glass(JUICE + CUBES)],
  'glass-juice-done': ['0 0 150 210', 'Orange juice with ice and an orange slice', glass(JUICE + CUBES) + G5 + SLICE + '</g>'],
  'glass-lassi': ['0 0 150 210', 'Glass of mango lassi', glass(`<path d="M14 50H126L110 200H30Z" fill="#FFC857" stroke-width="0"/><path d="M14 50H126L123 78Q70 96 17 78Z" fill="#fff" stroke-width="3"/>`) + `${G5}<path d="M92 70L112 0" fill="none" stroke="#FF5E8A" stroke-width="8"/></g>`],
  board: ['0 0 200 144', 'Wooden board', BOARD],
  'base-plain': ['0 0 140 140', 'Pizza base', `${G5}${DOUGH_DISC}</g>`],
  'base-tomato': ['0 0 140 140', 'Pizza base with tomato', `${G5}${DOUGH_DISC}<circle cx="70" cy="70" r="48" fill="#EF476F" stroke-width="3"/></g>`],
  'base-cheese': ['0 0 140 140', 'Pizza base with tomato and cheese', `${G5}${DOUGH_DISC}<circle cx="70" cy="70" r="48" fill="#EF476F" stroke-width="3"/><g fill="#FFD166" stroke-width="2.5"><circle cx="56" cy="52" r="14"/><circle cx="88" cy="58" r="15"/><circle cx="60" cy="86" r="15"/><circle cx="90" cy="90" r="12"/><circle cx="72" cy="70" r="12"/></g></g>`],
  'pizza-whole': ['0 0 140 140', 'A whole baked pizza', `${G5}<circle cx="70" cy="70" r="62" fill="#C97B2A"/><circle cx="70" cy="70" r="50" fill="#FFD166" stroke-width="3"/><g fill="#EF476F" stroke-width="3"><circle cx="52" cy="50" r="9"/><circle cx="90" cy="54" r="9"/><circle cx="70" cy="76" r="9"/><circle cx="48" cy="88" r="8"/><circle cx="94" cy="92" r="8"/></g></g>`],
  oven: ['0 0 180 200', 'Oven', oven(false)],
  'oven-on': ['0 0 180 200', 'Hot oven', oven(true)],
  'blender-empty': ['0 0 140 220', 'Blender', blender('')],
  'blender-mango': ['0 0 140 220', 'Blender with mango', blender(CHUNKS)],
  'blender-milk': ['0 0 140 220', 'Blender with mango and milk', blender(`<path d="M28.3 80H111.7L104 170H36Z" fill="#fff" stroke-width="3"/>${CHUNKS}`)],
  'blender-lassi': ['0 0 140 220', 'Blender full of mango lassi', blender(`<path d="M28.3 80H111.7L104 170H36Z" fill="#FFC857" stroke-width="3"/>`)],
  'dish-empty': ['0 -30 180 140', 'Pie dish', `${G5}${DISH}</g>`],
  'dish-crust': ['0 -30 180 140', 'Pie dish with crust', `${G5}${DISH}<ellipse cx="90" cy="34" rx="70" ry="14" fill="#F2B56B" stroke-width="3"/></g>`],
  'dish-berries': ['0 -30 180 140', 'Pie dish with crust and berries', `${G5}${DISH}<ellipse cx="90" cy="34" rx="70" ry="14" fill="#F2B56B" stroke-width="3"/>${PIE_BERRIES}</g>`],
  'pie-whole': ['0 -30 180 140', 'A whole baked pie', `${G5}<path d="M10 34H170L150 100H30Z" fill="#B9A4F5"/><path d="M8 34Q90 -40 172 34Z" fill="#F2B56B"/><path d="M8 34Q90 46 172 34" fill="none" stroke="#C97B2A" stroke-width="9"/><path d="M8 34Q90 46 172 34" fill="none" stroke-width="3" stroke-dasharray="2 12"/><path d="M70 14l8-10M90 12V0M110 14l-8-10" fill="none" stroke="#EF476F" stroke-width="5"/></g>`],
};

export function item(id) {
  const [viewBox, label, body] = ITEM_ART[id] ?? ITEM_ART.sparkle;
  return svg(viewBox, label, body);
}

export const hasItem = id => id in ITEM_ART;

/* ---------- Decorations ---------- */

const G4 = `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">`;
const bulbs = points => points.map(([x, y], i) =>
  `<circle class="d-bulb" style="animation-delay:${(i % 4) * 0.3}s" cx="${x}" cy="${y}" r="9" fill="${['#FFE066', '#FF8FB1', '#6EC6FF', '#5ED6B0'][i % 4]}" stroke="${INK}" stroke-width="3"/>`).join('');
// One vase of flowers, drawn with its bottom-left near (x, y + 60).
export const vase = (x, y) => `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M22 34V8M22 34L8 12M22 34L36 12" fill="none" stroke="#2E9E55"/><circle cx="22" cy="6" r="8" fill="#FF5E8A"/><circle cx="6" cy="10" r="8" fill="#FFC93C"/><circle cx="38" cy="10" r="8" fill="#B79BFF"/><path d="M10 34H34L30 60H14Z" fill="#8FD3FF"/></g>`;
// A string of fairy lights hanging between two points.
export const lightString = (x0, x1, y) => {
  const n = Math.max(4, Math.round((x1 - x0) / 40)), step = (x1 - x0) / n;
  const pts = Array.from({ length: n + 1 }, (_, i) => [x0 + i * step, y + 10 + (i % 2 ? -6 : 4)]);
  return `<path d="M${x0} ${y}${pts.map(([x, py]) => `L${x} ${py - 8}`).join('')}" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>${bulbs(pts)}`;
};
const DECOR_ART = {
  balloons: ['-4 0 130 196', 'A bunch of balloons', `${G4}<path d="M40 190Q44 130 30 96M40 190Q40 120 60 70M40 190Q50 140 88 104" fill="none" stroke-width="3"/><g class="d-bob"><ellipse cx="26" cy="62" rx="26" ry="32" fill="#FF5E8A"/><ellipse cx="64" cy="38" rx="26" ry="32" fill="#FFC93C"/><ellipse cx="96" cy="74" rx="26" ry="32" fill="#6EC6FF"/></g></g>`],
  disco: ['-12 0 124 134', 'A disco ball', `${G4}<path d="M50 0V34"/><g class="d-spin"><circle cx="50" cy="74" r="40" fill="#DDE6FF"/><rect x="18" y="64" width="14" height="20" fill="#FF8FB1" stroke-width="0"/><rect x="52" y="40" width="12" height="20" fill="#8FD3FF" stroke-width="0"/><rect x="68" y="88" width="14" height="18" fill="#B79BFF" stroke-width="0"/><path d="M12 62H88M12 86H88M34 37V111M66 37V111M50 34V114" stroke-width="2.5" fill="none"/><circle cx="50" cy="74" r="40" fill="none"/></g><g class="d-twinkle" fill="#FFE066" stroke-width="2.5"><path d="M4 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M98 110l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g></g>`],
  lights: ['-6 -6 130 80', 'Fairy lights and flowers', `<path d="M0 8Q30 30 60 12T118 8" fill="none" stroke="${INK}" stroke-width="3"/>${bulbs([[4, 10], [30, 20], [60, 13], [90, 6], [116, 9]])}${vase(38, 12)}`],
};
export function decor(id) {
  const [viewBox, label, body] = DECOR_ART[id];
  return svg(viewBox, label, body);
}
