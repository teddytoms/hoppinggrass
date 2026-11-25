// Draws one comic page from data (see js/comics.js) as an HTML string:
// bowed panels on the cream dotted page, with captions, speech bubbles and sound words.
// Each panel is one <svg> inside <div class="comic-panel" data-panel="N">, so a screen
// can show the panels one tap at a time. Styles are in css/comic.css.

import { monster, chef, waiter, mystery, critic, food, item, hasItem, vehicle, upgrade, plate, place } from './art.js';

const INK = '#1B1B1F';
const FONT_BIG = "'Bangers', Impact, 'Baloo 2', sans-serif";
const FONT_HAND = "'Patrick Hand', 'Comic Sans MS', 'Baloo 2', cursive";
const PAGE_W = 1024, PAGE_H = 768, EDGE = 18, GAP = 14, TITLE_H = 96;
const SPAN = { wide: 6, half: 3, third: 2 };
// Named here on purpose (not read from js/data.js): the drawings do not lean on the rule modules.
const MONSTERS = ['ella', 'bella', 'twinkle', 'fife', 'ghuy', 'gege', 'moon'];
const FOODS = ['orange-juice', 'pizza', 'mango-lassi', 'pie', 'tea', 'spaghetti', 'coffee', 'boba', 'cupcake', 'salmon', 'moon-toast'];
const UPGRADES = ['umbrella', 'bell', 'chairs', 'musicbox', 'window', 'spices', 'net', 'bubbles', 'lamp', 'flag'];
const VEHICLES = ['balloon', 'train', 'boat', 'rocket'];
const NIGHT = '#2B2A5C';
const FLAT = { pink: '#FFB5C8', purple: '#B79BFF', mint: '#7BE0C3', yellow: '#FFE066', blue: '#8FD3FF', cream: '#FFF6DC', orange: '#FFB37A' };

export const WHO = ['chef', 'victoria', ...MONSTERS, 'm', 'critic'];
export const BACKGROUNDS = [...Object.keys(FLAT), 'burst', 'sky', 'sea', 'night', 'space', 'park', 'garden', 'kitchen', 'cafe', 'train', 'boat', 'moon'];
export const PROPS = ['letter', 'review', 'notebook', 'tbc', 'cart', 'plate', 'plate-gold', 'golden-spoon', ...VEHICLES, ...FOODS, ...UPGRADES];

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n1 = v => Math.round(v * 10) / 10;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Put the chef's name ({name}) and the moon monster's name ({moon}) into a line. Without a name the
// comics just say "Chef" and "Moony". Both names are typed by the player: every caller escapes the result.
function words(text, vars) {
  const name = String(vars?.name ?? '').trim(), moon = String(vars?.moon ?? '').trim();
  let t = String(text ?? '');
  if (!name) t = t.replaceAll('Chef {name}', 'Chef');
  // One pass, so a name that itself contains "{moon}" is left as it was typed.
  return t.replace(/\{(name|moon)\}/g, (_, key) => (key === 'name' ? name || 'Chef' : moon || 'Moony'));
}

function wrap(text, max) {
  const lines = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  }
  return lines.length ? lines : [''];
}

const textLines = (lines, x, y, size, step, extra = '') => lines.map((l, i) =>
  `<text x="${n1(x)}" y="${n1(y + i * step)}" text-anchor="middle" font-family="${FONT_HAND}" font-size="${size}" fill="${INK}"${extra}>${esc(l)}</text>`).join('');

/* ---------- Panel backgrounds ---------- */

const cloud = (x, y, s) => `<path transform="translate(${n1(x)} ${n1(y)}) scale(${s})" d="M0 40a26 26 0 0 1 22-38a34 34 0 0 1 62 2a24 24 0 0 1 26 36z" fill="#fff" stroke="${INK}" stroke-width="${n1(6 / s)}" stroke-linejoin="round"/>`;
const G = `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">`;

function background(name, w, h) {
  const gy = h * 0.8;
  const rect = c => `<rect width="${w}" height="${h}" fill="${c}"/>`;
  const floor = c => `<path d="M-10 ${n1(gy)}H${w + 10}V${h + 10}H-10Z" fill="${c}"/>`;
  const dots = `<rect y="${n1(gy)}" width="${w}" height="${n1(h - gy)}" fill="url(#cm-dots)"/>`;
  const hill = c => `<path d="M-10 ${n1(gy)}Q${n1(w * 0.3)} ${n1(gy - 46)} ${n1(w * 0.6)} ${n1(gy - 10)}T${w + 10} ${n1(gy - 24)}V${h + 10}H-10Z" fill="${c}"/>`;
  if (FLAT[name]) return rect(FLAT[name]);
  if (name === 'burst') {
    const rays = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + 0.2;
      return `M${n1(w / 2)} ${n1(h / 2)}L${n1(w / 2 + Math.cos(a) * w)} ${n1(h / 2 + Math.sin(a) * w)}`;
    }).join('');
    return `${rect('#FFB5C8')}<path d="${rays}" stroke="#fff" stroke-width="14" opacity=".7"/>`;
  }
  const stars = pts => pts.map(([x, y]) => `<circle cx="${n1(x * w)}" cy="${n1(y * h)}" r="5" fill="#FFE066"/>`).join('');
  const earth = (x, y, r) => `<g transform="translate(${n1(x)} ${n1(y)}) scale(${n1(r / 30)})"><circle r="30" fill="#4FB3F0"/><path d="M-22 -10Q-14 -24 0 -22Q8 -14 -2 -8Q-6 2 -16 0Q-22 -2 -22 -10ZM4 6Q14 0 20 8Q22 18 12 22Q4 22 4 6Z" fill="#7BCB6B" stroke-width="0"/><path d="M-10 -25Q0 -28 10 -25" fill="none" stroke="#fff" stroke-width="4"/><circle r="30" fill="none"/></g>`;
  if (name === 'night') return rect('#3A3470') + stars([[0.1, 0.2], [0.3, 0.72], [0.52, 0.14], [0.74, 0.8], [0.9, 0.24], [0.2, 0.5], [0.82, 0.55]]);
  if (name === 'space') {
    return `${rect(NIGHT)}${stars([[0.08, 0.16], [0.26, 0.6], [0.44, 0.1], [0.62, 0.84], [0.94, 0.5], [0.16, 0.86], [0.7, 0.3], [0.36, 0.34]])}${G}${earth(w * 0.12, h * 0.74, 34)}
<circle cx="${n1(w * 0.88)}" cy="${n1(h * 0.2)}" r="24" fill="#FFF1A6"/><g fill="#D9BC4E" stroke-width="3"><circle cx="${n1(w * 0.88 - 8)}" cy="${n1(h * 0.2 - 6)}" r="5"/><circle cx="${n1(w * 0.88 + 8)}" cy="${n1(h * 0.2 + 8)}" r="6"/></g></g>`;
  }
  if (name === 'moon') {
    const pit = (x, rx) => `<ellipse cx="${n1(x * w)}" cy="${n1(gy + (h - gy) * 0.55)}" rx="${rx}" ry="${n1(rx * 0.3)}" fill="#A9AEC6" stroke-width="5"/>`;
    return `${rect(NIGHT)}${stars([[0.06, 0.3], [0.2, 0.12], [0.4, 0.44], [0.56, 0.1], [0.7, 0.5], [0.94, 0.42], [0.3, 0.62]])}${G}${earth(w * 0.86, h * 0.2, 30)}${hill('#C5C9DB')}${pit(0.14, 30)}${pit(0.56, 24)}${pit(0.9, 34)}</g>${dots}`;
  }
  if (name === 'boat') {
    const waves = Array.from({ length: Math.ceil(w / 46) + 1 }, () => 'q11.5-12 23 0t23 0').join('');
    const top = gy - Math.min(74, h * 0.24);
    const posts = Array.from({ length: Math.ceil(w / 96) + 1 }, (_, i) => `<rect x="${i * 96 + 14}" y="${n1(top)}" width="14" height="${n1(gy - top)}" fill="#fff" stroke-width="5"/>`).join('');
    return `${rect('#8FD3FF')}${cloud(w * 0.08, h * 0.16, 0.7)}${G}<circle cx="${n1(w * 0.86)}" cy="${n1(h * 0.18)}" r="28" fill="#FFE066"/><path d="M-10 ${n1(h * 0.44)}${waves}V${n1(gy)}H-10Z" fill="#4FB3F0"/>${posts}
<path d="M-10 ${n1(top)}H${w + 10}" fill="none" stroke-width="17"/><path d="M-10 ${n1(top)}H${w + 10}" fill="none" stroke="#FF5E5E" stroke-width="7"/>${floor('#E0A458')}<path d="M-10 ${n1(gy + (h - gy) * 0.5)}H${w + 10}" fill="none" stroke="#C4873E" stroke-width="5"/></g>${dots}`;
  }
  if (name === 'sky') return `${rect('#8FD3FF')}${cloud(w * 0.08, h * 0.62, 0.9)}${cloud(w * 0.7, h * 0.12, 0.8)}${cloud(w * 0.62, h * 0.74, 0.6)}`;
  if (name === 'sea') {
    const waves = Array.from({ length: Math.ceil(w / 60) + 1 }, () => 'q15-14 30 0t30 0').join('');
    return `${rect('#8FD3FF')}${G}<circle cx="${n1(w * 0.84)}" cy="${n1(h * 0.2)}" r="30" fill="#FFE066"/><path d="M-10 ${n1(h * 0.66)}${waves}V${h + 10}H-10Z" fill="#4FB3F0"/></g>${cloud(w * 0.1, h * 0.2, 0.7)}`;
  }
  if (name === 'park' || name === 'garden') {
    const fence = name === 'garden'
      ? `<path d="M-10 ${n1(gy - 40)}H${w + 10}" fill="none"/>${Array.from({ length: Math.ceil(w / 44) }, (_, i) => `<path d="M${i * 44 + 8} ${n1(gy + 2)}v-58l12-12 12 12v58z" fill="#fff" stroke-width="5"/>`).join('')}`
      : '';
    const beds = name === 'garden'
      ? Array.from({ length: Math.floor(w / 110) }, (_, i) => {
        const x = 60 + i * 110, y = gy + (h - gy) * 0.55;
        return `<ellipse cx="${x}" cy="${n1(y)}" rx="38" ry="11" fill="#A0673A" stroke-width="5"/><path d="M${x} ${n1(y - 2)}v-20M${x} ${n1(y - 14)}q-14-14-20-2M${x} ${n1(y - 14)}q14-14 20-2" fill="none" stroke="#2E8747" stroke-width="6"/>`;
      }).join('')
      : '';
    return `${rect('#8FD3FF')}${cloud(w * 0.08, h * 0.26, 0.7)}${G}<circle cx="${n1(w * 0.86)}" cy="${n1(h * 0.2)}" r="30" fill="#FFE066"/>${fence}${name === 'garden' ? floor('#7BCB6B') : hill('#7BCB6B')}${beds}</g>${dots}`;
  }
  if (name === 'kitchen') {
    const jars = [0, 1, 2].map(i => `<rect x="${n1(w * 0.62 + i * 40)}" y="${n1(h * 0.2)}" width="28" height="36" rx="5" fill="${['#FF5E5E', '#7BE0C3', '#B79BFF'][i]}" stroke-width="5"/>`).join('');
    return `${rect('#FFE3A3')}<path d="M0 ${n1(h * 0.5)}H${w}" stroke="#F2C64D" stroke-width="8"/>${G}${jars}<path d="M${n1(w * 0.56)} ${n1(h * 0.2 + 38)}H${n1(w * 0.56 + 150)}" fill="none" stroke-width="8"/>${floor('#7BE0C3')}<path d="M-10 ${n1(gy + 16)}H${w + 10}" fill="none" stroke="#4FB89B" stroke-width="8"/></g>${dots}`;
  }
  if (name === 'cafe') {
    const n = Math.ceil(w / 40);
    const awning = Array.from({ length: n }, (_, i) =>
      `<path d="M${i * 40} -6h40v38a20 16 0 0 1-40 0z" fill="${['#3FA85A', '#fff', '#FF5E5E'][i % 3]}" stroke-width="5"/>`).join('');
    return `${rect('#FFE08A')}${G}${awning}${floor('#F2D9A6')}<path d="M${n1(w * 0.12)} ${n1(gy + 26)}q16-12 32 0M${n1(w * 0.52)} ${n1(gy + 34)}q16-12 32 0M${n1(w * 0.8)} ${n1(gy + 20)}q16-12 32 0" fill="none" stroke="#D9B978" stroke-width="5"/></g>${dots}`;
  }
  if (name === 'train') {
    const x0 = w * 0.14, y0 = h * 0.12, ww = w * 0.72, wh = h * 0.42;
    return `${rect('#FFE9B8')}${G}<rect x="${n1(x0)}" y="${n1(y0)}" width="${n1(ww)}" height="${n1(wh)}" rx="18" fill="#8FD3FF"/>
<path d="M${n1(x0 + 3)} ${n1(y0 + wh * 0.7)}Q${n1(x0 + ww * 0.3)} ${n1(y0 + wh * 0.4)} ${n1(x0 + ww * 0.6)} ${n1(y0 + wh * 0.66)}T${n1(x0 + ww - 3)} ${n1(y0 + wh * 0.56)}V${n1(y0 + wh - 3)}H${n1(x0 + 3)}Z" fill="#7BCB6B" stroke-width="5"/>
<circle cx="${n1(x0 + ww * 0.8)}" cy="${n1(y0 + wh * 0.26)}" r="16" fill="#FFE066" stroke-width="5"/>
<rect x="${n1(x0)}" y="${n1(y0)}" width="${n1(ww)}" height="${n1(wh)}" rx="18" fill="none" stroke-width="8"/>
<path d="M-10 ${n1(h * 0.62)}H${w + 10}V${h + 10}H-10Z" fill="#D9534F"/>${floor('#8E6BD9')}</g>
<path d="M0 ${n1(h * 0.62)}H${w}" stroke="#FFC93C" stroke-width="7"/>${dots}`;
  }
  return rect(FLAT.cream);
}

/* ---------- Actors and props ---------- */

function drawing(a, vars) {
  if (MONSTERS.includes(a.who)) return monster(a.who, a.mood ?? 'idle', a.flip ? -1 : 1);
  if (a.who === 'chef') return chef(a.mood === 'basket' ? 'basket' : 'spoon', vars?.look ?? 'chef-a', a.mood === 'cheer' || a.mood === 'oops' ? a.mood : 'idle');
  if (a.who === 'victoria') return waiter();
  if (a.who === 'm') return mystery(a.mood ?? 'idle');
  if (a.who === 'critic') return critic(a.mood ?? 'idle');
  return null;
}
const boxOf = art => (/viewBox="([^"]+)"/.exec(art)?.[1] ?? '0 0 100 100').split(' ').map(Number);

function actors(list, w, h, vars) {
  const placed = [];
  let out = '';
  (list ?? []).forEach((a, i) => {
    const art = drawing(a, vars);
    if (!art) return;
    const [, , vw, vh] = boxOf(art);
    const ah = h * 0.7 * (a.scale ?? 1), aw = ah * vw / vh;
    const cx = (a.x ?? (i + 1) / (list.length + 1)) * w, top = (a.y ?? 0.95) * h - ah;
    const body = place(art, n1(cx - aw / 2), n1(top), n1(aw), n1(ah));
    out += a.flip && !MONSTERS.includes(a.who) ? `<g transform="translate(${n1(2 * cx)} 0) scale(-1 1)">${body}</g>` : body;
    placed.push({ who: a.who, cx, top, w: aw, h: ah });
  });
  return { out, placed };
}

const LETTER = `<g transform="rotate(-5 150 115)"><rect x="6" y="6" width="288" height="218" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
<path d="M6 6L150 110L294 6" fill="none" stroke="${INK}" stroke-width="5" opacity=".2"/>
<text x="150" y="60" text-anchor="middle" font-family="${FONT_HAND}" font-size="27" fill="${INK}">I bet you cannot</text>
<text x="150" y="92" text-anchor="middle" font-family="${FONT_HAND}" font-size="27" fill="${INK}">serve</text>
<text x="150" y="142" text-anchor="middle" font-family="${FONT_BIG}" font-size="40" letter-spacing="2" fill="#E0312E">80 HAPPY PLATES</text>
<text x="150" y="178" text-anchor="middle" font-family="${FONT_HAND}" font-size="27" fill="${INK}">around the world!</text>
<text x="270" y="214" text-anchor="end" font-family="${FONT_BIG}" font-size="38" fill="${INK}">- M</text></g>`;

function review(text) {
  const lines = wrap(text, 21).slice(0, 4);
  const stars = [0, 1, 2, 3, 4].map(i => `<path transform="translate(${62 + i * 34} 62) scale(.5)" d="M32 6L39 24L58 26L43 38L48 57L32 46L16 57L21 38L6 26L25 24Z" fill="#FFC93C" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`).join('');
  return `<g transform="rotate(4 150 115)"><rect x="8" y="10" width="284" height="212" fill="#FFF3B0" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
<rect x="120" y="0" width="60" height="22" fill="#FF8FB1" stroke="${INK}" stroke-width="4" opacity=".9"/>
<text x="150" y="58" text-anchor="middle" font-family="${FONT_BIG}" font-size="32" letter-spacing="2" fill="#E0312E">THE CRITIC SAYS</text>${stars}
${textLines(lines, 150, 126 + (4 - lines.length) * 12, 25, 27)}</g>`;
}

// M's notebook, held up to the reader: a big number (the text) and some tally marks.
function notebook(text) {
  const tally = [0, 1, 2].map(i => `<path d="M${78 + i * 56} 166v34M${90 + i * 56} 166v34M${102 + i * 56} 166v34M${114 + i * 56} 166v34M${70 + i * 56} 196l52-26" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`).join('');
  const rings = [0, 1, 2, 3, 4, 5].map(i => `<path d="M${62 + i * 35} 6v26" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`).join('');
  return `<g transform="rotate(-4 150 115)"><rect x="34" y="18" width="232" height="204" rx="8" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
<path d="M34 62H266" stroke="#FF5E5E" stroke-width="5"/>${rings}
<text x="150" y="146" text-anchor="middle" font-family="${FONT_BIG}" font-size="88" letter-spacing="4" fill="#E0312E">${esc(String(text).slice(0, 4))}</text>${tally}</g>`;
}

const BIG = ['letter', 'review', 'notebook', 'tbc', 'cart', ...VEHICLES];

function prop(p, w, h, vars) {
  const cx = (p.x ?? 0.5) * w, cy = (p.y ?? 0.5) * h, s = p.scale ?? 1;
  if (p.id === 'letter' || p.id === 'review' || p.id === 'notebook') {
    const pw = Math.min(w * 0.7, h * 0.95, 320) * s, k = pw / 300;
    const paper = p.id === 'letter' ? LETTER : p.id === 'review' ? review(words(p.text ?? '', vars)) : notebook(words(p.text ?? '', vars));
    return `<g transform="translate(${n1(cx - pw / 2)} ${n1(cy - 115 * k)}) scale(${n1(k * 100) / 100})">${paper}</g>`;
  }
  if (p.id === 'tbc') {
    const size = Math.min(60, w / 6.4) * s;
    const line = (t, y) => `<text x="${n1(cx)}" y="${n1(y)}" text-anchor="middle" transform="rotate(-4 ${n1(cx)} ${n1(cy)})" font-family="${FONT_BIG}" font-size="${n1(size)}" letter-spacing="3" fill="#FFE066" stroke="${INK}" stroke-width="8" stroke-linejoin="round" paint-order="stroke">${t}</text>`;
    return line('TO BE', cy - size * 0.15) + line('CONTINUED...', cy + size * 0.95);
  }
  let art, size = h * 0.3 * s;
  if (VEHICLES.includes(p.id)) { art = vehicle(p.id); size = h * 0.74 * s; }
  else if (p.id === 'cart') { art = item('cart'); size = h * 0.66 * s; }
  else if (p.id === 'plate' || p.id === 'plate-gold') art = plate(p.id === 'plate-gold');
  else if (FOODS.includes(p.id)) art = food(p.id);
  else if (UPGRADES.includes(p.id)) art = upgrade(p.id);
  else if (hasItem(p.id)) art = item(p.id);
  else return '';
  const [, , vw, vh] = boxOf(art), k = size / Math.max(vw, vh);
  return place(art, n1(cx - vw * k / 2), n1(cy - vh * k / 2), n1(vw * k), n1(vh * k));
}

function props(list, w, h, vars) {
  const all = (Array.isArray(list) ? list : list ? [list] : []).map(p => (typeof p === 'string' ? { id: p } : p));
  return {
    under: all.filter(p => BIG.includes(p.id)).map(p => prop(p, w, h, vars)).join(''),
    over: all.filter(p => !BIG.includes(p.id)).map(p => prop(p, w, h, vars)).join(''),
  };
}

/* ---------- Words: caption boxes, speech bubbles, sound words ---------- */

function caption(text, w) {
  const lines = wrap(text, Math.max(8, Math.floor((w - 56) / 10.4)));
  const cw = Math.max(...lines.map(l => l.length)) * 10.4 + 30, ch = lines.length * 26 + 14;
  return {
    w: cw, h: ch,
    out: `<rect x="13" y="13" width="${n1(cw)}" height="${ch}" fill="#FFF3B0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>${textLines(lines, 13 + cw / 2, 40, 23, 26)}`,
  };
}

function bubble(say, speaker, w, h, cap, vars) {
  const lines = wrap(words(say.text, vars), w < 360 ? 15 : w < 520 ? 17 : 24);
  const bw = Math.max(Math.max(...lines.map(l => l.length)) * 11.6 + 46, 96), bh = lines.length * 29 + 26;
  let bx, side = 0;
  if (say.x != null) bx = say.x * w - bw / 2;
  else if (speaker) {
    const edgeR = speaker.cx + speaker.w * 0.34, edgeL = speaker.cx - speaker.w * 0.34;
    const right = w - edgeR, left = edgeL;
    if (right >= bw + 14 && right >= left) { bx = edgeR; side = 1; }
    else if (left >= bw + 14) { bx = edgeL - bw; side = -1; }
    else bx = speaker.cx - bw / 2;
  } else bx = (w - bw) / 2;
  bx = clamp(bx, 12, w - bw - 12);
  // Keep clear of the caption box: slide right a little if that is enough, or else drop below it.
  let by = 16;
  if (cap && bx < cap.w + 26) {
    const slid = cap.w + 26;
    if (side === 1 && slid - bx <= 90 && slid + bw <= w - 12) bx = slid;
    else by = cap.h + 24;
  }
  if (say.y != null) by = say.y * h;
  const bottom = by + bh;
  const box = `<rect x="${n1(bx)}" y="${n1(by)}" width="${n1(bw)}" height="${bh}" rx="${Math.min(30, bh / 2)}" fill="#fff" stroke="${INK}" stroke-width="6"/>`;
  const text = textLines(lines, bx + bw / 2, by + 39, 26, 29);
  if (!speaker) return box + text;
  // The tail starts on the bottom edge and points at the speaker's head.
  const tx = speaker.cx + side * speaker.w * 0.1, ty = speaker.top + speaker.h * (side ? 0.2 : 0.04);
  const base = clamp(side ? (side > 0 ? bx + 40 : bx + bw - 40) : tx, bx + 34, bx + bw - 34);
  const px = base + clamp((tx - base) * 0.6, -44, 44), py = bottom + clamp((ty - bottom) * 0.8, 26, 52);
  return `<path d="M${n1(base - 14)} ${n1(bottom - 3)}L${n1(px)} ${n1(py)}L${n1(base + 14)} ${n1(bottom - 3)}" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
${box}<path d="M${n1(base - 10.5)} ${n1(bottom)}H${n1(base + 10.5)}" stroke="#fff" stroke-width="7"/>${text}`;
}

function soundWord(sfx, w, h) {
  const s = typeof sfx === 'string' ? { word: sfx } : sfx;
  const word = String(s.word ?? '');
  const size = s.size ?? clamp((w * 0.52) / Math.max(word.length * 0.5, 1), 34, 66);
  const x = (s.x ?? 0.72) * w, y = (s.y ?? 0.93) * h;
  const half = word.length * size * 0.26 + 14;
  const cx = clamp(x, half, w - half);
  return `<text x="${n1(cx)}" y="${n1(y)}" text-anchor="middle" transform="rotate(-6 ${n1(cx)} ${n1(y)})" font-family="${FONT_BIG}" font-size="${n1(size)}" letter-spacing="3" fill="${esc(s.colour ?? '#FFE066')}" stroke="${INK}" stroke-width="7" stroke-linejoin="round" paint-order="stroke">${esc(word)}</text>`;
}

/* ---------- Panels and the page ---------- */

// The border bows a little, as if ruled by hand, but the line itself is smooth.
const border = (w, h) => `M7 9Q${n1(w / 2)} 1 ${n1(w - 7)} 7Q${n1(w - 1)} ${n1(h / 2)} ${n1(w - 5)} ${n1(h - 8)}Q${n1(w / 2)} ${n1(h - 1)} 8 ${n1(h - 7)}Q1 ${n1(h / 2)} 7 9Z`;

function panel(p, i, box, vars, arrow) {
  const { w, h } = box;
  const id = `cm-clip-${Math.round(w)}x${Math.round(h)}`;
  const cap = p.caption ? caption(words(p.caption, vars), w) : null;
  const cast = actors(p.actors, w, h, vars);
  const pr = props(p.prop, w, h, vars);
  const speaker = p.say ? cast.placed.find(a => a.who === p.say.who) : null;
  const label = [p.caption, p.say?.text, typeof p.sfx === 'string' ? p.sfx : p.sfx?.word].filter(Boolean).map(t => words(t, vars)).join(' ');
  const next = arrow
    ? `<path d="M${n1(w - 62)} ${n1(h - 44)}h22v-12l26 22-26 22v-12h-22z" fill="#FFC93C" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    : '';
  const style = `left:${n1(box.x / PAGE_W * 100)}%;top:${n1(box.y / PAGE_H * 100)}%;width:${n1(w / PAGE_W * 100)}%;height:${n1(h / PAGE_H * 100)}%`;
  return `<div class="comic-panel comic-${SPAN[p.size] ? p.size : 'half'}" data-panel="${i}" style="${style}"><svg viewBox="0 0 ${n1(w)} ${n1(h)}" role="img" aria-label="${esc(label)}">
<clipPath id="${id}"><path d="${border(w, h)}"/></clipPath><g clip-path="url(#${id})">${background(p.bg, n1(w), n1(h))}${pr.under}${cast.out}${pr.over}</g>
<path d="${border(w, h)}" fill="none" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
${cap ? cap.out : ''}${p.say ? bubble(p.say, speaker, w, h, cap, vars) : ''}${p.sfx ? soundWord(p.sfx, w, h) : ''}${next}</svg></div>`;
}

// Panels fill rows of six columns: wide = 6, half = 3, third = 2. The last panel in a row stretches to the edge.
function layout(panels, top) {
  const rows = [];
  let row = [], used = 0;
  for (const p of panels) {
    const span = SPAN[p.size] ?? 3;
    if (used + span > 6) { rows.push(row); row = []; used = 0; }
    row.push(span);
    used += span;
  }
  if (row.length) rows.push(row);
  const rowH = (PAGE_H - top - EDGE - GAP * (rows.length - 1)) / Math.max(rows.length, 1);
  const col = (PAGE_W - 2 * EDGE + GAP) / 6;
  const boxes = [];
  rows.forEach((spans, r) => {
    let c = 0;
    spans.forEach((span, k) => {
      const last = k === spans.length - 1;
      const x = EDGE + c * col;
      boxes.push({ x, y: top + r * (rowH + GAP), w: (last ? PAGE_W - EDGE : x + span * col - GAP) - x, h: rowH });
      c += span;
    });
  });
  return boxes;
}

// page: { title?, arrows?, panels: [{ size, bg, caption?, actors, say?, sfx?, prop? }] }
// vars: { name, look, moon } (the chef's name, 'chef-a' or 'chef-b', and the moon monster's name).
export function renderPage(page, vars = {}) {
  const panels = page?.panels ?? [];
  const title = page?.title ? words(page.title, vars) : '';
  const boxes = layout(panels, title ? TITLE_H : EDGE);
  const size = clamp(1500 / Math.max(title.length, 1), 30, 52);
  const banner = title
    ? `<div class="comic-title"><svg viewBox="0 0 ${PAGE_W} ${TITLE_H}" role="img" aria-label="${esc(title)}"><path d="M24 16Q512 6 1000 14Q1008 46 1002 80Q512 88 20 80Q14 46 24 16Z" fill="#FFC93C" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
<text x="512" y="${n1(48 + size * 0.36)}" text-anchor="middle" font-family="${FONT_BIG}" font-size="${n1(size)}" letter-spacing="2" fill="${INK}">${esc(title)}</text></svg></div>`
    : '';
  return `<div class="comic-page" data-panels="${panels.length}"><svg class="comic-defs" width="0" height="0" aria-hidden="true"><defs><pattern id="cm-dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="${INK}" opacity=".14"/></pattern></defs></svg>
${banner}${panels.map((p, i) => panel(p, i, boxes[i], vars, page.arrows && i < panels.length - 1)).join('')}</div>`;
}
