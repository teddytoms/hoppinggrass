// All the pictures in the game, as SVG strings, in the comic-book look of
// design/mockups/sample-page.html: thick smooth black outlines, flat bright
// colours and a little shading (a darker side, a cheek, a shine).
// Every exported drawing returns an <svg> string. The cast is the game's own.

const INK = '#1B1B1F';
const FONT_BIG = "'Bangers', Impact, 'Baloo 2', sans-serif";
const FONT_HAND = "'Patrick Hand', 'Comic Sans MS', 'Baloo 2', cursive";
const G3 = `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">`;
const G6 = `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">`;
const G7 = `<g stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">`;

const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const n1 = v => Math.round(v * 10) / 10;
const svg = (viewBox, label, body) =>
  `<svg viewBox="${viewBox}" role="img" aria-label="${esc(label)}">${body}</svg>`;

// Put one drawing inside a bigger SVG scene at a position and size.
export const place = (drawing, x, y, w, h) =>
  drawing.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

const star = (x, y, s = 1) => {
  const a = 4 * s, b = 9 * s;
  return `<path d="M${x} ${y - b - a}l${a} ${b} ${b} ${a}-${b} ${a}-${a} ${b}-${a}-${b}-${b}-${a} ${b}-${a}z"/>`;
};
const twinkles = points =>
  `<g fill="#FFE066" stroke="${INK}" stroke-width="3" stroke-linejoin="round">${points.map(p => star(...p)).join('')}</g>`;
const heart = (x, y, s = 1) =>
  `<path d="M${x} ${y + 16 * s}l${-16 * s} ${-16 * s}a${9 * s} ${9 * s} 0 0 1 ${16 * s} ${-10 * s}a${9 * s} ${9 * s} 0 0 1 ${16 * s} ${10 * s}z"/>`;

/* ---------- Monsters: always 3 legs and 3 hands ---------- */

const LOOKS = {
  ella: { name: 'Ella', body: '#FF8FB1', shade: '#E86A93', shine: '#FFD0DF', cheek: '#F2608C', look: 1 },
  bella: { name: 'Bella', body: '#7CC8FF', shade: '#4FA3E6', shine: '#D0ECFF', cheek: '#3F8FE0', look: -1 },
  twinkle: { name: 'Twinkle', body: '#B79BFF', shade: '#9274E6', shine: '#E2D6FF', cheek: '#7A4FE0', look: -1 },
  fife: { name: 'Fife', body: '#8EDB9A', shade: '#62BD72', shine: '#D2F5D8', cheek: '#3FA85A', look: -1 },
  ghuy: { name: 'Ghuy', body: '#FFA94D', shade: '#EB8527', shine: '#FFDDB0', cheek: '#E8590C', look: -1 },
  gege: { name: 'Gege', body: '#FC6C85', shade: '#DE4766', shine: '#FFC2CE', cheek: '#D6336C', look: 1 },
  // The player names this one, so the picture only calls it "the moon monster".
  moon: { name: 'The moon monster', body: '#FFF1A6', shade: '#E8D174', shine: '#FFFDF0', cheek: '#FF9F6B', look: 1 },
};
const CRITIC = { name: 'The food critic', body: '#B8C4D9', shade: '#93A3BF', shine: '#E3EAF5', cheek: '#7C8FB5', look: -1 };
const SICK = { body: '#B9E08A', shade: '#96C466', shine: '#DDF3BF', cheek: '#7FAF4E' };
const MOOD_WORDS = { idle: 'smiling', happy: 'very happy', love: 'in love, with heart eyes', yuck: 'saying yuck, tongue out', shocked: 'looking shocked, hands in the air' };

const BODY = 'M50 120C50 44 170 44 170 120V190C170 216 140 216 135 196C130 180 90 180 85 196C80 216 50 216 50 190Z';
const BODY_SHADE = 'M150 74Q166 96 166 120V190Q166 209 152 209Q142 209 138 197Q156 164 150 74Z';
const LEGS = 'M80 200V252M110 190V252M140 200V252';
const FEET = 'M68 256h24M98 256h24M128 256h24';
const ARMS = {
  down: { d: 'M52 132L20 104M168 132L200 160', hands: [[15, 100], [205, 164]] },
  up: { d: 'M52 122L20 82M168 122L200 82', hands: [[16, 77], [204, 77]] },
};
const MOUTH_OPEN = `<path d="M86 124H134Q134 156 110 156Q86 156 86 124Z" fill="#7A2340"/><path d="M97 149Q110 138 123 149Q118 154 110 154Q102 154 97 149Z" fill="#FF7A9A" stroke-width="0"/>`;
const SMILE = '<path d="M94 128Q110 146 126 128" fill="none"/>';
const TEETH = '<path d="M82 126H138Q134 152 110 152Q86 152 82 126Z" fill="#fff"/><path d="M96 126v20M110 126v25M124 126v20" fill="none" stroke-width="3.5"/>';
const TOP_TEETH = '<path d="M90 124H130V134H90Z" fill="#fff" stroke-width="3.5"/><path d="M103 124v10M117 124v10" fill="none" stroke-width="3"/>';

const roundEyes = (look, r = 18, pr = 7) => {
  const px = look * 5;
  return `<circle cx="88" cy="100" r="${r}" fill="#fff"/><circle cx="132" cy="100" r="${r}" fill="#fff"/>
<g class="m-blink" stroke-width="0"><circle cx="${88 + px}" cy="102" r="${pr}" fill="${INK}"/><circle cx="${132 + px}" cy="102" r="${pr}" fill="${INK}"/>
<circle cx="${91 + px}" cy="99" r="2.5" fill="#fff"/><circle cx="${135 + px}" cy="99" r="2.5" fill="#fff"/></g>`;
};
const cheeks = c => `<g fill="${c}" stroke-width="0" opacity=".75"><circle cx="62" cy="128" r="8"/><circle cx="158" cy="128" r="8"/></g>`;

function monsterFace(id, mood, look, c) {
  if (mood === 'shocked') {
    return `${roundEyes(look, 20, 4)}<ellipse cx="110" cy="140" rx="11" ry="13" fill="#7A2340"/>
<path d="M34 42l-14-12M28 62l-18-3M186 42l14-12M192 62l18-3" fill="none"/>`;
  }
  if (mood === 'yuck') {
    return `<path d="M76 90l20 10-20 10M144 90l-20 10 20 10" fill="none"/><path d="M90 136Q100 126 110 134T130 132" fill="none"/>
<path d="M102 134h16v16a8 8 0 0 1-16 0z" fill="#FF5E8A" stroke-width="4"/>`;
  }
  if (mood === 'love') {
    return `<g fill="#EF476F" stroke-width="4">${heart(88, 100)}${heart(132, 100)}<g stroke-width="3">${heart(30, 30, 0.6)}${heart(192, 24, 0.6)}</g></g>
${cheeks(c.cheek)}${MOUTH_OPEN}${id === 'ella' ? TOP_TEETH : ''}`;
  }
  if (mood === 'happy') return roundEyes(look) + cheeks(c.cheek) + MOUTH_OPEN + (id === 'ella' ? TOP_TEETH : '');
  const tongue = id === 'gege' ? '<path d="M104 137h14v9a7 7 0 0 1-14 0z" fill="#FF7A9A" stroke-width="4"/>' : '';
  return roundEyes(look) + cheeks(c.cheek) + (id === 'ella' ? TEETH : SMILE + tongue);
}

// What makes each monster its own: Ella's teeth and spots, Bella's name tag, Twinkle's crown,
// Fife's bow, Ghuy's zigzag tummy, Gege's watermelon seeds, rind, odd socks and tongue,
// the moon monster's craters and the little star that floats by its antenna.
function trademark(id, mood) {
  const quiet = mood === 'yuck' || mood === 'shocked';
  if (id === 'ella') return `<g fill="${mood === 'yuck' ? '#8CBF5A' : '#F2608C'}" stroke-width="0"><circle cx="66" cy="170" r="6"/><circle cx="150" cy="176" r="7"/><circle cx="146" cy="78" r="5"/></g>`;
  if (id === 'bella') return `<rect x="82" y="160" width="56" height="20" rx="5" fill="#fff" stroke-width="3.5"/><text x="110" y="176" text-anchor="middle" font-family="${FONT_HAND}" font-size="17" fill="${INK}" stroke-width="0">Bella</text>`;
  if (id === 'twinkle') return `<path d="M82 70l-6-28 18 13 16-20 16 20 18-13-6 28z" fill="#FFC93C" stroke-width="5"/><circle cx="110" cy="57" r="5" fill="#FF5E8A" stroke-width="3"/><g fill="#FFE066" stroke-width="0">${star(66, 176, 0.7)}${star(152, 168, 0.8)}</g>`;
  if (id === 'fife') return `<g stroke-width="4"><path d="M110 170l-22-12v24zM110 170l22-12v24z" fill="#FF8FB1"/><circle cx="110" cy="170" r="6" fill="#FF5E8A"/></g>`;
  if (id === 'ghuy') return `<path d="M64 172l11.5-10 11.5 10 11.5-10 11.5 10 11.5-10 11.5 10 11.5-10 11.5 10" fill="none" stroke="#FFE066" stroke-width="7"/>`;
  if (id === 'gege') {
    return `<path d="M58 176H162" fill="none" stroke="#3FB56B" stroke-width="9"/>${quiet ? '' : `<g fill="${INK}" stroke-width="0"><ellipse cx="64" cy="152" rx="4" ry="6"/><ellipse cx="156" cy="152" rx="4" ry="6"/><ellipse cx="78" cy="164" rx="4" ry="6"/><ellipse cx="142" cy="164" rx="4" ry="6"/><ellipse cx="100" cy="72" rx="4" ry="6"/><ellipse cx="122" cy="74" rx="4" ry="6"/></g>`}`;
  }
  if (id === 'moon') {
    return `<g fill="${mood === 'yuck' ? '#7FAF4E' : '#D9BC4E'}" stroke-width="3.5"><ellipse cx="70" cy="170" rx="10" ry="7.5"/><ellipse cx="146" cy="176" rx="12" ry="9"/><ellipse cx="106" cy="168" rx="6.5" ry="5"/><ellipse cx="148" cy="76" rx="6.5" ry="5"/><ellipse cx="74" cy="74" rx="5" ry="4"/></g>
<g fill="none" stroke="#fff" stroke-width="2.5" opacity=".8"><path d="M63 168q6-5 13-1M138 173q7-6 15-2"/></g><g fill="#fff" stroke-width="3.5">${star(150, 36, 0.95)}</g>`;
  }
  return '';
}
const SOCKS = `<g fill="none" stroke-linecap="butt"><path d="M80 228V248M110 228V248M140 228V248" stroke-width="15"/><path d="M80 231V245" stroke="#6EC6FF" stroke-width="8"/><path d="M110 231V245" stroke="#FFE066" stroke-width="8"/><path d="M140 231V245" stroke="#B79BFF" stroke-width="8"/></g>`;

// One three-legged, three-handed body. `c` holds its colours; `face` and `extras` are drawn on top.
function creature(c, arms, face, extras = '', under = '') {
  const hands = arms.hands.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join('');
  return `<g class="m-breathe" stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<g class="m-wave"><path d="M110 66V26" fill="none"/><g class="m-glow" fill="#FFE066"><circle cx="110" cy="16" r="9"/></g></g>
<path d="${LEGS}" fill="none"/><path d="${FEET}" fill="none" stroke-width="9"/>${under}
<path d="${arms.d}" fill="none"/><g class="m-glow" fill="#FFE066">${hands}</g>
<path d="${BODY}" fill="${c.body}"/><path d="${BODY_SHADE}" fill="${c.shade}" stroke-width="0"/>
<path d="M62 98Q64 68 88 60" fill="none" stroke="${c.shine}" stroke-width="7"/><path d="${BODY}" fill="none"/>
${face}${extras}</g>`;
}

// look: 1 looks to the right, -1 to the left (each monster has its own usual side).
export function monster(id, mood = 'idle', look) {
  if (typeof id === 'string' && id.startsWith('chef')) return chef('spoon', id);
  if (!LOOKS[id]) id = 'ella';
  if (!MOOD_WORDS[mood]) mood = 'idle';
  const L = LOOKS[id];
  const c = mood === 'yuck' ? SICK : L;
  const arms = mood === 'idle' || mood === 'yuck' ? ARMS.down : ARMS.up;
  return svg('0 0 220 280', `${L.name}, a monster with three legs and three hands, ${MOOD_WORDS[mood]}`,
    creature(c, arms, monsterFace(id, mood, look ?? L.look, c), trademark(id, mood), id === 'gege' ? SOCKS : ''));
}

// The food critic: a very serious monster with glasses, a tie, a notebook and a pencil.
export function critic(mood = 'idle') {
  const happy = mood === 'happy';
  const arms = happy ? ARMS.up : ARMS.down;
  const [hx, hy] = arms.hands[1];
  const eyes = `<circle cx="88" cy="100" r="20" fill="#fff" stroke-width="7"/><circle cx="132" cy="100" r="20" fill="#fff" stroke-width="7"/><path d="M68 98L54 92M152 98L166 92" fill="none"/>
<g class="m-blink" stroke-width="0" fill="${INK}"><circle cx="${happy ? 88 : 84}" cy="102" r="6"/><circle cx="${happy ? 132 : 128}" cy="102" r="6"/></g>`;
  const face = happy
    ? `${eyes}<path d="M70 70Q86 58 102 70M118 70Q134 58 150 70" fill="none"/>${cheeks(CRITIC.cheek)}${MOUTH_OPEN}`
    : `${eyes}<path d="M66 64L102 76M154 64L118 76" fill="none" stroke-width="7"/><path d="M96 140Q110 133 124 140" fill="none"/>`;
  const note = `<g transform="rotate(8 ${hx} ${hy})"><rect x="${hx - 12}" y="${hy - 38}" width="36" height="46" rx="4" fill="#fff" stroke-width="5"/>${happy
    ? `<g fill="#EF476F" stroke-width="3">${heart(hx + 6, hy - 22, 0.6)}</g>`
    : `<path d="M${hx - 4} ${hy - 26}h20M${hx - 4} ${hy - 16}h20M${hx - 4} ${hy - 6}h12" fill="none" stroke-width="3"/>`}</g><circle cx="${hx}" cy="${hy}" r="9" fill="#FFE066"/>`;
  const pencil = `<path d="M110 16L130 -12" fill="none" stroke-width="13"/><path d="M110 16L130 -12" fill="none" stroke="#FFC93C" stroke-width="7"/><path d="M127 -8l6 -9" fill="none" stroke="#FF5E8A" stroke-width="7"/><circle cx="110" cy="16" r="9" fill="#FFE066"/>`;
  const tie = `<path d="M96 160L110 168L124 160" fill="none" stroke="#fff" stroke-width="5"/><path d="M110 166l-7 12 7 7 7-7z" fill="#2F3E73" stroke-width="4"/>`;
  const extras = `${tie}${note}${pencil}${happy ? twinkles([[36, 30, 1.1], [200, 26, 0.9]]) : ''}`;
  return svg('0 -24 244 304', `The food critic, a monster with glasses and a notebook, ${happy ? 'delighted' : 'looking very serious'}`,
    creature(CRITIC, arms, face, extras));
}

/* ---------- M, the mystery guest: a hat, a coat and a very big moustache ---------- */

const M_COAT = '#8A7AA3', M_COAT_D = '#6E5F87', M_HAT = '#3B2A4A', M_FACE = '#5A4A72';
const M_TACHE = `<g><path d="M110 104Q96 92 80 102Q64 112 52 98Q54 122 78 122Q98 122 110 110Q122 122 142 122Q166 122 168 98Q156 112 140 102Q124 92 110 104Z" fill="${INK}" stroke-width="4"/><path d="M68 113Q78 117 90 111M130 111Q142 117 152 113" fill="none" stroke="#fff" stroke-width="2.5" opacity=".55"/></g>`;
const M_HAT_ART = `<g><path d="M74 60V24Q110 14 146 24V60Z" fill="${M_HAT}"/><path d="M77 49H143" fill="none" stroke="#FF5E5E" stroke-width="9" stroke-linecap="butt"/><path d="M74 60V24Q110 14 146 24V60Z" fill="none"/><path d="M54 62H166" fill="none" stroke-width="11"/><circle cx="134" cy="48" r="7" fill="#FFE066" stroke-width="3.5"/></g>`;
const mFace = (look, grin = false) => `<path d="M66 62Q64 126 110 126Q156 126 154 62Z" fill="${M_FACE}"/>
<circle cx="92" cy="86" r="13" fill="#fff" stroke-width="5"/><circle cx="128" cy="86" r="13" fill="#fff" stroke-width="5"/>
<g stroke-width="0" fill="${INK}"><circle cx="${92 + look * 4}" cy="88" r="5"/><circle cx="${128 + look * 4}" cy="88" r="5"/></g>
${grin ? '<g fill="#FF8FB1" stroke-width="0" opacity=".8"><circle cx="76" cy="104" r="6"/><circle cx="144" cy="104" r="6"/></g><path d="M92 104H128Q126 120 110 120Q94 120 92 104Z" fill="#fff" stroke-width="4"/>' : ''}`;
const sleeve = d => `<path d="${d}" fill="none" stroke-width="22"/><path d="${d}" fill="none" stroke="${M_COAT}" stroke-width="11"/>`;
const mBody = up => `<path d="M84 236V254M110 236V254M136 236V254" fill="none"/><path d="M72 258h24M98 258h24M124 258h24" fill="none" stroke-width="9"/>
${up ? sleeve('M70 140L42 100') + sleeve('M150 140L178 100') : sleeve('M68 140L40 184') + sleeve('M152 140L180 184')}
<g fill="#fff">${up ? '<circle cx="38" cy="94" r="10"/><circle cx="182" cy="94" r="10"/>' : '<circle cx="37" cy="190" r="10"/><circle cx="183" cy="190" r="10"/>'}</g>
<path d="M72 118Q110 106 148 118L176 242H44Z" fill="${M_COAT}"/><path d="M134 116L148 118L176 242H150Q158 176 134 116Z" fill="${M_COAT_D}" stroke-width="0"/>
<path d="M72 118Q110 106 148 118L176 242H44Z" fill="none"/><path d="M110 140V240" fill="none" stroke-width="4"/>
<g fill="#FFC93C" stroke-width="3.5"><circle cx="124" cy="160" r="5"/><circle cx="124" cy="194" r="5"/></g>`;
const M_COLLAR = `<path d="M74 122L92 108L110 134L128 108L146 122L110 150Z" fill="#A596BD"/>`;
const M_WORDS = {
  idle: 'standing very still', peek: 'peeking out from behind a bush', reveal: 'with the hat and moustache flying off, laughing',
  window: 'peeking in at a window', paper: 'hiding behind an upside-down newspaper',
  rowboat: 'rowing a little boat', notebook: 'with the disguise off, smiling and holding a notebook',
};
const oar = d => `<path d="${d}" fill="none" stroke-width="15"/><path d="${d}" fill="none" stroke="#E0A458" stroke-width="6"/>`;

// moods: 'peek' (behind a bush), 'idle', 'reveal' (the disguise flies off), plus 'window', 'paper' and
// 'rowboat' for the story, and 'notebook' (after the reveal: no hat, no moustache, a notebook and a pencil).
export function mystery(mood = 'idle') {
  if (!M_WORDS[mood]) mood = 'idle';
  let body;
  if (mood === 'peek') {
    body = `<g transform="translate(0 46) rotate(-6 110 120)">${mFace(1)}${M_TACHE}${M_HAT_ART}</g>
<path d="M6 284V224Q6 186 44 188Q56 160 92 170Q112 150 140 168Q176 160 184 192Q214 196 214 226V284Z" fill="#3FA85A"/>
<path d="M150 172Q176 168 182 194Q210 198 210 226V280H178Q196 230 150 172Z" fill="#2E8747" stroke-width="0"/>
<path d="M40 214q10-10 20 0M96 200q10-10 20 0M70 244q10-10 20 0M132 232q10-10 20 0" fill="none" stroke="#7BCB6B" stroke-width="5"/>
<path d="M6 284V224Q6 186 44 188Q56 160 92 170Q112 150 140 168Q176 160 184 192Q214 196 214 226V284Z" fill="none"/>`;
  } else if (mood === 'window') {
    body = `<rect x="34" y="40" width="152" height="170" fill="#33415F"/><g transform="translate(0 52)">${mFace(-1)}<path d="M60 150Q110 96 160 150V170H60Z" fill="${M_COAT}"/>${M_TACHE}${M_HAT_ART}</g>
<path d="M34 40H186V210H34Z" fill="none" stroke-width="8"/><path d="M34 40L52 58V192L34 210" fill="none" stroke="#fff" stroke-width="3" opacity=".35"/>
<path d="M4 40H34V210H4Z" fill="#3FA85A"/><path d="M186 40H216V210H186Z" fill="#3FA85A"/><path d="M10 70h18M10 100h18M10 130h18M10 160h18M192 70h18M192 100h18M192 130h18M192 160h18" fill="none" stroke-width="3.5"/>
<path d="M22 212H198L190 250H30Z" fill="#D9534F"/><path d="M168 214H196L189 248H172Q176 230 168 214Z" fill="#B23B38" stroke-width="0"/>
<g stroke-width="4"><circle cx="56" cy="204" r="11" fill="#FFE066"/><circle cx="92" cy="200" r="11" fill="#FF8FB1"/><circle cx="128" cy="204" r="11" fill="#fff"/><circle cx="162" cy="200" r="11" fill="#FFE066"/></g>`;
  } else if (mood === 'paper') {
    body = `${mBody(false).replace(/<g fill="#fff">.*?<\/g>/s, '')}${mFace(-1)}${M_HAT_ART}
<g transform="rotate(-3 110 170)"><path d="M26 112H194V226H26Z" fill="#fff"/><path d="M110 112V226" fill="none" stroke-width="3.5"/>
<path d="M150 116H190V222H160Q168 170 150 116Z" fill="#E4DBFF" stroke-width="0"/><path d="M26 112H194V226H26Z" fill="none"/>
<text x="68" y="196" text-anchor="middle" transform="rotate(180 68 186)" font-family="${FONT_BIG}" font-size="30" fill="${INK}" stroke-width="0">NEWS</text>
<path d="M38 132h60M38 146h60M122 180h60M122 194h60M122 208h60" fill="none" stroke-width="3" opacity=".5"/>
<rect x="122" y="126" width="60" height="40" fill="#FFC93C" stroke-width="3.5"/></g>
${M_TACHE}<g fill="#fff"><circle cx="26" cy="168" r="11"/><circle cx="194" cy="160" r="11"/></g>`;
  } else if (mood === 'reveal') {
    body = `${mBody(true)}<path d="M66 70Q66 34 110 34Q154 34 154 70Z" fill="${M_FACE}"/>${mFace(1, true)}${M_COLLAR}
<g transform="translate(16 -36) rotate(16 110 40)">${M_HAT_ART}</g><g transform="translate(58 62) rotate(24 110 104)">${M_TACHE}</g>
<path d="M70 28l-10-14M96 18l-4-16M150 132l14 8M146 150l10 14" fill="none" stroke-width="5"/>${twinkles([[30, 40, 1.1], [196, 50, 1], [24, 232, 0.8]])}`;
  } else if (mood === 'rowboat') {
    body = `<g transform="translate(0 22)">${mFace(-1)}<path d="M58 172Q62 112 110 112Q158 112 162 172Z" fill="${M_COAT}"/><path d="M140 120Q158 136 162 172H146Q150 144 140 120Z" fill="${M_COAT_D}" stroke-width="0"/><path d="M58 172Q62 112 110 112Q158 112 162 172Z" fill="none"/>${M_TACHE}${M_HAT_ART}</g>
<path d="M10 190H210Q206 240 176 252H44Q14 240 10 190Z" fill="#A0673A"/><path d="M170 194H206Q202 238 174 249H150Q172 228 170 194Z" fill="#7D4E2A" stroke-width="0"/>
<path d="M20 214H200" fill="none" stroke="#C4873E" stroke-width="5"/><path d="M10 190H210Q206 240 176 252H44Q14 240 10 190Z" fill="none"/>
${oar('M74 186L22 236')}${oar('M146 186L198 236')}<g fill="#E0A458" stroke-width="5"><ellipse cx="17" cy="241" rx="11" ry="17" transform="rotate(46 17 241)"/><ellipse cx="203" cy="241" rx="11" ry="17" transform="rotate(-46 203 241)"/></g>
<g fill="#fff"><circle cx="74" cy="186" r="10"/><circle cx="146" cy="186" r="10"/></g>
<path d="M-10 262q15-14 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V294H-10Z" fill="#4FB3F0"/><path d="M40 276q10-8 20 0M150 278q10-8 20 0" fill="none" stroke="#fff" stroke-width="4"/>
<g fill="#8FD3FF" stroke-width="3.5"><path d="M8 206q7 10 0 14q-7-4 0-14z"/><path d="M214 204q7 10 0 14q-7-4 0-14z"/></g>`;
  } else if (mood === 'notebook') {
    body = `${mBody(true)}<path d="M66 70Q66 34 110 34Q154 34 154 70Z" fill="${M_FACE}"/>${mFace(1, true)}${M_COLLAR}
<g transform="rotate(10 182 70)"><rect x="160" y="34" width="46" height="58" rx="4" fill="#fff" stroke-width="5"/><path d="M160 46H206" fill="none" stroke="#FF5E5E" stroke-width="5" stroke-linecap="butt"/><path d="M169 58h28M169 68h28M169 78h18" fill="none" stroke-width="3"/></g><circle cx="182" cy="94" r="10" fill="#fff"/>
<path d="M38 94L26 60" fill="none" stroke-width="13"/><path d="M38 94L26 60" fill="none" stroke="#FFC93C" stroke-width="7"/><path d="M28 66l-3-8" fill="none" stroke="#FF5E8A" stroke-width="7"/><circle cx="38" cy="94" r="10" fill="#fff"/>
${twinkles([[196, 14, 0.9], [24, 232, 0.8]])}`;
  } else {
    body = `${mBody(false)}${mFace(1)}${M_COLLAR}${M_TACHE}${M_HAT_ART}`;
  }
  return svg('0 -30 220 314', `M, the mystery guest in a hat, a coat and a big moustache, ${M_WORDS[mood]}`,
    `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">${body}</g>`);
}

/* ---------- Victoria the waiter and the chef ---------- */

const KID_MOUTH = {
  idle: '<path d="M44 142Q60 158 78 142" fill="none"/>',
  cheer: '<path d="M43 137H79Q79 158 61 158Q43 158 43 137Z" fill="#7A2340"/><path d="M51 153Q61 145 71 153Q66 157 61 157Q56 157 51 153Z" fill="#FF7A9A" stroke-width="0"/>',
  oops: '<path d="M48 146Q62 153 75 142" fill="none"/>',
};
// mood: 'idle', 'cheer' (a big open smile) or 'oops' (eyes up, a small lopsided smile).
const kidFace = (skin, shade, cheek, mood = 'idle') => {
  const [px, py] = mood === 'oops' ? [-3, -5] : [3, 2];
  return `<circle cx="60" cy="110" r="52" fill="${skin}"/>
<path d="M92 100Q112 124 92 150Q76 162 60 160Q92 148 92 100Z" fill="${shade}" stroke-width="0"/><circle cx="60" cy="110" r="52" fill="none"/>
<circle cx="28" cy="136" r="8" fill="${cheek}" stroke-width="0" opacity=".7"/>
<circle cx="42" cy="118" r="13" fill="#fff"/><circle cx="80" cy="118" r="13" fill="#fff"/>
<circle cx="${42 + px}" cy="${118 + py}" r="5" fill="${INK}" stroke-width="0"/><circle cx="${80 + px}" cy="${118 + py}" r="5" fill="${INK}" stroke-width="0"/>
${KID_MOUTH[mood] ?? KID_MOUTH.idle}`;
};
const KID_LEGS = '<path d="M40 300V250M80 300V250" fill="none"/><path d="M22 302h30M66 302h30" fill="none" stroke-width="9"/>';

export function waiter() {
  const skin = '#FFD3B8';
  return svg('-34 0 276 364', 'Victoria the waiter, with golden hair, a blue dress, a red apron and a notebook',
    `<g transform="translate(52 -50) scale(1.3)" stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<path d="M2 196Q-16 44 60 46Q136 44 118 196Q90 206 60 204Q30 206 2 196Z" fill="#F2B632"/>
<path d="M100 62Q128 100 118 196Q106 200 96 200Q112 130 100 62Z" fill="#D9962A" stroke-width="0"/>
${KID_LEGS}
<path d="M22 172L-12 204M98 172L130 204" fill="none" stroke-width="8"/>
<path d="M22 150H98L120 262H0Z" fill="#4F8FE0"/><path d="M84 153H97L117 259H94Q98 204 84 153Z" fill="#3A72C2" stroke-width="0"/><path d="M22 150H98L120 262H0Z" fill="none"/>
<path d="M38 162H82L90 250H30Z" fill="#E8453C"/><rect x="50" y="210" width="20" height="18" rx="3" fill="#FFC93C" stroke-width="4"/>
${kidFace(skin, '#EBB08F', '#F08A6C')}
<path d="M10 106Q12 54 60 56Q108 54 110 106Q92 78 60 84Q28 78 10 106Z" fill="#F2B632"/>
<path d="M92 66l-16-8v16zM92 66l16-8v16z" fill="#E8453C" stroke-width="4"/>
<path d="M30 100l-6-8M42 96l-2-9M90 96l2-9M102 100l6-8" fill="none" stroke-width="3.5"/>
<g class="floaty"><rect x="-42" y="184" width="34" height="44" rx="4" fill="#fff" transform="rotate(-10 -25 206)"/><path d="M-36 202l20-4M-34 213l20-4" fill="none" stroke-width="3"/></g>
<circle cx="-12" cy="206" r="8" fill="${skin}"/>
<path class="w-pencil" d="M130 204L140 176" fill="none" stroke-width="11"/><path d="M130 204L140 176" fill="none" stroke="#FF5E8A" stroke-width="5"/>
<circle cx="130" cy="204" r="8" fill="${skin}"/></g>`);
}

const CHEFS = {
  'chef-a': { skin: '#C98A5E', shade: '#A96B42', cheek: '#E0577F', hair: '#2B1B14', words: 'with brown skin and two dark bunches of hair' },
  'chef-b': { skin: '#F6C9A0', shade: '#DDA574', cheek: '#F08A6C', hair: '#E8702A', words: 'with light skin and short orange hair' },
};

const CHEF_MOODS = { idle: '', cheer: ', cheering with arms up', oops: ', shrugging with a small smile' };

// holding: 'spoon' in the kitchen, 'basket' on the farm. look: 'chef-a' or 'chef-b'.
// mood: 'idle', 'cheer' (arms up, a big smile) or 'oops' (a shrug and a small smile, never sad).
export function chef(holding = 'spoon', look = 'chef-a', mood = 'idle') {
  if (!(mood in CHEF_MOODS)) mood = 'idle';
  const c = CHEFS[look] ?? CHEFS['chef-a'];
  const a = c === CHEFS['chef-a'];
  const back = a
    ? `<g fill="${c.hair}"><circle cx="4" cy="142" r="17"/><circle cx="116" cy="142" r="17"/></g><path d="M12 128l8 6M108 128l-8 6" fill="none" stroke="#FF5E8A" stroke-width="7"/>`
    : '';
  const front = a
    ? `<path d="M12 96Q36 106 60 98Q84 106 108 96Z" fill="${c.hair}"/>`
    : `<path d="M10 96Q0 120 12 140Q14 114 26 100ZM110 96Q120 120 108 140Q106 114 94 100Z" fill="${c.hair}"/><path d="M26 98q6 8 12 0q6 8 12 0" fill="${c.hair}" stroke-width="4"/>`;
  const basket = holding === 'basket';
  // The left hand is free; the right hand holds the spoon or the basket.
  const [lx, ly] = { idle: [-14, 212], cheer: [-20, 104], oops: [-24, 158] }[mood];
  const left = mood === 'oops' ? `M18 170L-4 190L${lx} ${ly}` : `M18 170L${lx} ${ly}`;
  const [dx, dy] = basket ? [0, 0] : { idle: [0, 0], cheer: [2, -18], oops: [2, 26] }[mood];
  const right = basket ? 'M102 170L134 210' : mood === 'oops' ? 'M102 170L122 190L140 160' : `M102 170L${138 + dx} ${134 + dy}`;
  const arms = left + right;
  const extra = mood === 'cheer'
    ? twinkles([[-16, 70, 0.8], [146, 30, 0.8]]) + '<path d="M-2 86l-3-12M124 92l6-12" fill="none" stroke-width="4.5"/>'
    : mood === 'oops' ? '<path d="M-6 84q9 13 0 18q-9-5 0-18z" fill="#8FD3FF" stroke-width="3.5"/>' : '';
  const held0 = basket
    ? `<path d="M112 214h58l-8 44h-42z" fill="#E0A458"/><path d="M118 214Q141 180 164 214" fill="none"/><path d="M116 230h50M119 244h44" fill="none" stroke-width="3.5"/><circle cx="134" cy="210" r="8" fill="${c.skin}"/>`
    : `<path d="M138 136L152 96" fill="none" stroke-width="13"/><path d="M138 136L152 96" fill="none" stroke="#A0673A" stroke-width="6"/><ellipse cx="156" cy="82" rx="11" ry="15" fill="#E0A458" transform="rotate(20 156 82)"/><circle cx="138" cy="134" r="8" fill="${c.skin}"/>`;
  const held = dx || dy ? `<g transform="translate(${dx} ${dy})">${held0}</g>` : held0;
  return svg('0 -40 270 404', `The chef, a child in a tall chef hat with a star, ${c.words}, holding a ${basket ? 'basket' : 'spoon'}${CHEF_MOODS[mood]}`,
    `<g transform="translate(40 -45) scale(1.3)" stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
${back}${KID_LEGS}<path d="${arms}" fill="none" stroke-width="8"/><circle cx="${lx}" cy="${ly}" r="8" fill="${c.skin}"/>
<path d="M18 150H102L110 252H10Z" fill="#fff"/><path d="M78 153H100L107 249H84Q92 200 78 153Z" fill="#D9D3E6" stroke-width="0"/><path d="M18 150H102L110 252H10Z" fill="none"/>
<g fill="#FFC93C" stroke-width="3"><circle cx="48" cy="192" r="4.5"/><circle cx="48" cy="218" r="4.5"/></g>
${kidFace(c.skin, c.shade, c.cheek, mood)}${front}
<path d="M12 96Q0 60 26 54Q14 4 60 12Q108 4 94 54Q120 60 108 96Z" fill="#fff"/><path d="M12 96H108V76H12Z" fill="#fff"/>
<path d="M84 18Q104 22 92 54Q116 62 106 93H86Q96 60 78 52Q92 34 84 18Z" fill="#D9D3E6" stroke-width="0"/>
<path d="M12 96Q0 60 26 54Q14 4 60 12Q108 4 94 54Q120 60 108 96Z" fill="none"/><path d="M12 76H108" fill="none"/>
<g fill="#FFC93C" stroke-width="3.5">${star(52, 46, 1)}</g>${held}${extra}</g>`);
}

/* ---------- Places: full 1024 x 768 backgrounds ---------- */

// Where people stand in every scene: the middle of their feet, in scene pixels.
export const SPOTS = { customer: { x: 250, y: 690 }, chef: { x: 790, y: 690 } };

const DOTS = `<defs><pattern id="ba-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.4" fill="${INK}" opacity=".13"/></pattern><pattern id="ba-dots-w" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.6" fill="#fff" opacity=".45"/></pattern></defs>`;
const cloud = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 40a26 26 0 0 1 22-38a34 34 0 0 1 62 2a24 24 0 0 1 26 36z" fill="#fff"/>`;
const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 0V-70H12V0Z" fill="#A0673A"/><circle cx="0" cy="-124" r="70" fill="#3FA85A"/><path d="M24 -188Q76 -150 50 -76Q30 -58 8 -56Q60 -110 24 -188Z" fill="#2E8747" stroke-width="0"/><path d="M-44 -132Q-42 -168 -12 -176" fill="none" stroke="#7BCB6B" stroke-width="8"/><circle cx="0" cy="-124" r="70" fill="none"/></g>`;
// The food cart, in its own corner of space: about x 226..454, y 168..444.
const CART = `<path d="M250 300V214M430 300V214" fill="none"/><path d="M226 218H454L430 168H250Z" fill="#FF5E5E"/><path d="M286 168l-12 50M332 168v50M378 168l12 50" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="butt"/><path d="M226 218H454L430 168H250Z" fill="none"/>
<rect x="236" y="300" width="208" height="96" rx="6" fill="#FFC93C"/><path d="M400 304H440V392H400Q412 348 400 304Z" fill="#E0A21F" stroke-width="0"/><rect x="236" y="300" width="208" height="96" rx="6" fill="none"/>
<circle cx="276" cy="414" r="30" fill="#fff"/><circle cx="276" cy="414" r="7" fill="${INK}"/><circle cx="404" cy="414" r="30" fill="#fff"/><circle cx="404" cy="414" r="7" fill="${INK}"/>
<path d="M318 256H356L350 300H324Z" fill="#FF9F1C"/><path d="M344 256L352 232" fill="none" stroke-width="5"/>
<path d="M262 330Q300 318 340 330T418 330" fill="none" stroke="#fff" stroke-width="7"/>`;
const flower = (x, y, c) => `<path d="M${x} ${y}v-22" fill="none" stroke-width="5"/><circle cx="${x}" cy="${y - 28}" r="10" fill="${c}" stroke-width="4"/>`;

function park() {
  const flags = [150, 250, 350, 450, 550, 650, 750, 850].map((x, i) => {
    const y = 250 + 90 * (1 - ((x - 512) / 420) ** 2);
    return `<path d="M${x} ${y}l44 4-26 44z" fill="${['#FF5E5E', '#FFE066', '#7BE0C3', '#B79BFF'][i % 4]}" stroke-width="5"/>`;
  }).join('');
  return `<rect width="1024" height="768" fill="#8FD3FF"/>${G7}
<circle cx="890" cy="120" r="58" fill="#FFE066"/>${cloud(110, 70, 1.3)}${cloud(520, 50, 1)}
<path d="M-10 470Q180 390 400 450T800 420T1034 450V778H-10Z" fill="#9BDD7C"/>
${tree(96, 540, 1.35)}${tree(944, 520, 1.2)}
<path d="M96 262Q512 430 944 262" fill="none" stroke-width="5"/>${flags}
<path d="M-10 566Q260 524 520 552T1034 544V778H-10Z" fill="#7BCB6B"/>
<path d="M330 778Q440 640 512 640Q590 640 700 778Z" fill="#F2D9A6" stroke-width="6"/>
${flower(60, 640, '#FF8FB1')}${flower(400, 716, '#FFE066')}${flower(660, 700, '#fff')}${flower(980, 650, '#FF8FB1')}
<g transform="translate(87 104) scale(1.25)">${CART}</g></g>
<rect y="560" width="1024" height="208" fill="url(#ba-dots)"/>`;
}

function cafe() {
  const win = (x, y) => `<rect x="${x}" y="${y}" width="64" height="96" rx="4" fill="#BFE6FF"/><path d="M${x + 32} ${y}v96" fill="none" stroke-width="4"/><rect x="${x - 26}" y="${y}" width="26" height="96" fill="#3FA85A"/><rect x="${x + 64}" y="${y}" width="26" height="96" fill="#3FA85A"/>`;
  const stripes = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i =>
    `<path d="M${330 + i * 40} 300h40l${2.2 * (i - 4) + 2} 72h-${40 + 4.4}z" fill="${['#3FA85A', '#fff', '#FF5E5E'][i % 3]}" stroke-width="0"/>`).join('');
  const cobbles = [[80, 610], [210, 700], [360, 640], [660, 650], [820, 720], [940, 620], [560, 730], [120, 740]].map(([x, y]) =>
    `<path d="M${x} ${y}q24-18 48 0" fill="none" stroke="#D9B978" stroke-width="6"/>`).join('');
  return `<rect width="1024" height="768" fill="#8FD3FF"/>${G7}${cloud(760, 40, 1.1)}
<g transform="rotate(6 950 520)"><rect x="910" y="130" width="84" height="400" fill="#fff"/><path d="M910 200h84M910 270h84M910 340h84M910 410h84M910 480h84" fill="none" stroke-width="5"/><path d="M930 130V96H974V130" fill="#fff"/><path d="M970 134H990V526H976Q984 330 970 134Z" fill="#D9D3E6" stroke-width="0"/></g>
<rect x="-10" y="160" width="300" height="380" fill="#F79A8B"/><path d="M-20 164L140 86L300 164Z" fill="#D9534F"/>${win(60, 230)}${win(190, 230)}${win(60, 390)}${win(190, 390)}
<rect x="700" y="210" width="200" height="330" fill="#FFB37A"/><path d="M690 214H910L890 176H710Z" fill="#D9534F"/>${win(770, 270)}${win(770, 410)}
<rect x="290" y="110" width="420" height="430" fill="#FFE08A"/><path d="M640 114H706V536H660Q676 320 640 114Z" fill="#F2C64D" stroke-width="0"/><rect x="290" y="110" width="420" height="430" fill="none"/>
<path d="M280 114H720L704 78H296Z" fill="#D9534F"/>
<rect x="390" y="150" width="220" height="70" rx="10" fill="#fff"/><text x="500" y="204" text-anchor="middle" font-family="${FONT_BIG}" font-size="56" letter-spacing="4" fill="#D9534F" stroke-width="0">CAFFE</text>
<rect x="330" y="372" width="150" height="150" fill="#BFE6FF"/><path d="M405 372v150M330 447h150" fill="none" stroke-width="5"/>
<path d="M540 540V390a55 55 0 0 1 110 0V540Z" fill="#A0673A"/><circle cx="632" cy="470" r="6" fill="#FFC93C" stroke-width="4"/>
${stripes}<path d="M330 300H690L706 372H314Z" fill="none"/>
<path d="M-10 540H1034V778H-10Z" fill="#F2D9A6"/>${cobbles}
<path d="M934 560h56l-8 44h-40z" fill="#D9534F"/>${flower(950, 560, '#FF8FB1')}${flower(974, 560, '#FFE066')}
<path d="M512 600V690M470 694H554" fill="none" stroke-width="9"/><path d="M420 590Q428 640 444 660H580Q596 640 604 590Z" fill="#FF5E5E"/><path d="M452 596l8 62M492 598l2 62M532 598l-2 62M572 596l-8 62" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="butt"/><path d="M420 590Q428 640 444 660H580Q596 640 604 590Z" fill="none"/><ellipse cx="512" cy="590" rx="96" ry="20" fill="#fff"/></g>
<rect y="540" width="1024" height="228" fill="url(#ba-dots)"/>`;
}

// What you see from the train: fields, palm trees, a far pink palace.
function india(i) {
  const palm = (x, y) => `<path d="M${x} ${y}q-8-50 4-96" fill="none" stroke="#A0673A" stroke-width="9"/><path d="M${x + 4} ${y - 96}q-40-20-56 8M${x + 4} ${y - 96}q40-22 58 4M${x + 4} ${y - 96}q-16-36-46-30M${x + 4} ${y - 96}q18-36 48-28" fill="none" stroke="#2E8747" stroke-width="10"/>`;
  return `<rect width="280" height="250" fill="#8FD3FF"/>${i === 0 ? '<circle cx="210" cy="60" r="34" fill="#FFE066"/>' : cloud(30 + i * 40, 30, 0.8)}
<path d="M-10 170Q60 110 140 160T290 140V260H-10Z" fill="#B9E08A"/>
${i === 1 ? '<g fill="#FF8FB1"><path d="M96 168V120a34 34 0 0 1 68 0V168Z"/><path d="M130 86V66" fill="none"/><rect x="66" y="130" width="30" height="40"/><rect x="164" y="130" width="30" height="40"/><path d="M66 130a15 15 0 0 1 30 0M164 130a15 15 0 0 1 30 0"/></g>' : ''}
<path d="M-10 200Q100 170 290 196V260H-10Z" fill="#7BCB6B"/>${i === 0 ? palm(70, 220) : i === 2 ? palm(190, 226) + palm(80, 214) : palm(240, 224)}`;
}

function train() {
  const windows = [60, 372, 684].map((x, i) =>
    `<clipPath id="ba-win${i}"><rect x="${x}" y="140" width="280" height="250" rx="28"/></clipPath><g clip-path="url(#ba-win${i})"><g transform="translate(${x} 140)">${india(i)}</g>
<path d="M${x} 130Q${x + 46} 260 ${x - 4} 400H${x - 20}V130Z" fill="#FF9F1C"/><path d="M${x + 280} 130Q${x + 234} 260 ${x + 284} 400H${x + 300}V130Z" fill="#FF9F1C"/></g>
<rect x="${x}" y="140" width="280" height="250" rx="28" fill="none" stroke-width="9"/>`).join('');
  const garland = Array.from({ length: 25 }, (_, i) => {
    const x = 32 + i * 40, y = 96 + 16 * Math.abs(Math.sin((i / 24) * Math.PI * 3));
    return `<circle cx="${x}" cy="${y.toFixed(1)}" r="12" fill="${i % 2 ? '#FFC93C' : '#FF9F1C'}" stroke-width="4"/>`;
  }).join('');
  const diamonds = Array.from({ length: 9 }, (_, i) => `<path d="M${60 + i * 116} 640l28 26-28 26-28-26z" fill="#B79BFF" stroke-width="4"/>`).join('');
  return `<rect width="1024" height="768" fill="#FFE9B8"/>${G7}
<rect x="-10" y="-10" width="1044" height="74" fill="#4F8FE0"/><path d="M-10 64H1034" fill="none"/>
${windows}${garland}
<rect x="-10" y="430" width="1044" height="160" fill="#D9534F"/><path d="M-10 430H1034" fill="none" stroke="${INK}" stroke-width="20"/><path d="M-10 430H1034" fill="none" stroke="#FFC93C" stroke-width="9"/>
<path d="M40 470h120v84H40zM864 470h120v84H864z" fill="#B23B38" stroke-width="5"/>
<rect x="-10" y="590" width="1044" height="188" fill="#8E6BD9"/>${diamonds}
<path d="M512 560V690M466 694H558" fill="none" stroke-width="9"/><path d="M424 500H600L612 580H412Z" fill="#fff"/><path d="M572 504H598L609 577H584Q588 540 572 504Z" fill="#D9D3E6" stroke-width="0"/><path d="M424 500H600L612 580H412Z" fill="none"/>
<path d="M498 500V470M498 470q-14-22 0-34q14 12 0 34" fill="#FF8FB1" stroke-width="5"/><path d="M486 500h24l-3-18h-18z" fill="#7BE0C3" stroke-width="5"/></g>
<rect y="590" width="1024" height="178" fill="url(#ba-dots)"/>`;
}

// A round table with a striped cloth, in the middle of the floor.
const roundTable = (cloth, stripe) => `<path d="M512 600V690M470 694H554" fill="none" stroke-width="9"/><path d="M420 590Q428 640 444 660H580Q596 640 604 590Z" fill="${cloth}"/><path d="M452 596l8 62M492 598l2 62M532 598l-2 62M572 596l-8 62" fill="none" stroke="${stripe}" stroke-width="9" stroke-linecap="butt"/><path d="M420 590Q428 640 444 660H580Q596 640 604 590Z" fill="none"/><ellipse cx="512" cy="590" rx="96" ry="20" fill="#fff"/>`;
const waves = (x, y, n, step = 23) => `M${x} ${y}${Array.from({ length: n }, () => `q${step / 2}-${Math.round(step * 0.6)} ${step} 0`).join('')}`;

// The deck of the restaurant boat: the sea behind a railing, bunting from the mast, planks underfoot.
function boatDeck() {
  const flags = [72, 160, 248, 336, 424, 600, 688, 776, 864, 952].map((x, i) => {
    const y = 70 + Math.abs(x - 512) * 0.42;
    return `<path d="M${x - 22} ${n1(y - 4)}h44l-22 40z" fill="${['#FF5E5E', '#FFE066', '#7BE0C3', '#B79BFF', '#fff'][i % 5]}" stroke-width="5"/>`;
  }).join('');
  const posts = Array.from({ length: 9 }, (_, i) => `<rect x="${22 + i * 122}" y="440" width="22" height="124" fill="#fff" stroke-width="6"/>`).join('');
  const marks = [[90, 372], [300, 398], [470, 366], [650, 400], [880, 376], [200, 350], [760, 352]].map(([x, y]) =>
    `<path d="M${x} ${y}q16-12 32 0" fill="none" stroke="#fff" stroke-width="6"/>`).join('');
  const joints = [[150, 566, 628], [380, 628, 696], [690, 566, 628], [900, 628, 696], [560, 696, 778], [240, 696, 778]].map(([x, a, b]) => `M${x} ${a}V${b}`).join('');
  return `<rect width="1024" height="768" fill="#8FD3FF"/>${G7}
<circle cx="150" cy="130" r="56" fill="#FFE066"/>${cloud(300, 150, 1)}${cloud(780, 170, 1.2)}
<path d="M260 270q14-16 28 0q14-16 28 0M690 110q12-14 24 0q12-14 24 0" fill="none" stroke-width="6"/>
<path d="M796 330Q850 262 930 330Z" fill="#9BDD7C"/><path d="M866 300q-6-34 4-62M870 238q-28-14-40 6M870 238q28-16 42 2M870 238q-10-26-32-22M870 238q12-26 34-20" fill="none" stroke-width="6"/>
<path d="${waves(-10, 330, 46)}V600H-10Z" fill="#4FB3F0"/>${marks}
<path d="M512 452V60" fill="none" stroke-width="20"/><path d="M512 452V60" fill="none" stroke="#fff" stroke-width="9"/>
<path d="M-10 290L512 70L1034 290" fill="none" stroke-width="5"/>${flags}<circle cx="512" cy="56" r="16" fill="#FFC93C"/>
${posts}<path d="M-10 500H1034" fill="none" stroke-width="14"/><path d="M-10 500H1034" fill="none" stroke="#fff" stroke-width="6"/>
<path d="M-10 440H1034" fill="none" stroke-width="22"/><path d="M-10 440H1034" fill="none" stroke="#FF5E5E" stroke-width="10"/>
<circle cx="512" cy="500" r="50" fill="#fff"/><path d="M512 450a50 50 0 0 1 50 50h-28a22 22 0 0 0-22-22zM512 550a50 50 0 0 1-50-50h28a22 22 0 0 0 22 22z" fill="#FF5E5E" stroke-width="5"/><circle cx="512" cy="500" r="50" fill="none"/><circle cx="512" cy="500" r="22" fill="#4FB3F0"/>
<rect x="-10" y="564" width="1044" height="214" fill="#E0A458"/><path d="M-10 628H1034M-10 696H1034${joints}" fill="none" stroke="#C4873E" stroke-width="6"/><path d="M-10 564H1034" fill="none"/>
${roundTable('#4F8FE0', '#fff')}</g>
<rect y="564" width="1024" height="204" fill="url(#ba-dots)"/>`;
}

const EARTH = `<circle cx="0" cy="0" r="80" fill="#4FB3F0"/><g fill="#7BCB6B" stroke-width="0"><path d="M-58 -30Q-40 -62 -6 -58Q14 -44 -4 -26Q-10 -2 -36 -6Q-56 -10 -58 -30Z"/><path d="M8 14Q34 -2 52 18Q56 44 34 58Q10 60 8 14Z"/><path d="M-50 36Q-34 26 -24 42Q-28 62 -40 62Q-56 54 -50 36Z"/></g>
<path d="M34 -72Q94 -30 62 44Q44 70 14 78Q72 18 34 -72Z" fill="#3A8FCC" stroke-width="0" opacity=".55"/><path d="M-30 -66Q0 -74 26 -66M14 0Q34 -8 60 -2" fill="none" stroke="#fff" stroke-width="8"/><circle cx="0" cy="0" r="80" fill="none"/>`;
const NIGHT = '#2B2A5C';
const STARS = [[60, 70], [150, 210], [250, 110], [330, 300], [420, 60], [560, 150], [640, 60], [700, 250], [960, 280], [980, 60], [40, 330], [520, 300], [880, 360], [210, 380]];
const nightSky = () => `<rect width="1024" height="768" fill="${NIGHT}"/><g fill="#FFE066">${STARS.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 4 : 6}"/>`).join('')}</g>`;
const crater = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${n1(rx * 0.3)}" fill="#A9AEC6" stroke-width="5"/><path d="M${x - rx * 0.6} ${n1(y + rx * 0.1)}q${n1(rx * 0.6)} ${n1(rx * 0.2)} ${n1(rx * 1.2)} 0" fill="none" stroke="#D9DCEA" stroke-width="5"/>`;

// The diner on the moon: Earth in the sky, a silver diner with a red roof, craters underfoot.
function moonDiner() {
  return `${nightSky()}${G7}${twinkles([[120, 140, 1.6], [470, 200, 1.2], [930, 420, 1.3]])}
<g transform="translate(850 150)">${EARTH}</g>
<path d="M-10 500Q200 430 420 486T820 462T1034 480V778H-10Z" fill="#D9DCEA"/>
<g transform="translate(40 318) scale(.62)">${ROCKET}</g>
<path d="M512 196V150" fill="none"/><g fill="#FFE066" stroke-width="5">${star(512, 150, 2)}</g>
<path d="M292 340Q512 130 732 340Z" fill="#FF5E5E"/><path d="M604 264Q684 306 728 338H664Q650 298 604 264Z" fill="#C93F3F" stroke-width="0"/><path d="M292 340Q512 130 732 340Z" fill="none"/>
<rect x="312" y="340" width="400" height="200" fill="#E3EAF5"/><path d="M650 344H708V536H664Q676 440 650 344Z" fill="#B8C4D9" stroke-width="0"/><rect x="312" y="340" width="400" height="200" fill="none"/>
<path d="M280 340H744" fill="none" stroke-width="20"/><path d="M280 340H744" fill="none" stroke="#FFC93C" stroke-width="9"/>
<rect x="372" y="262" width="280" height="66" rx="10" fill="#fff"/><text x="512" y="313" text-anchor="middle" font-family="${FONT_BIG}" font-size="50" letter-spacing="3" fill="#D9534F" stroke-width="0">MOON DINER</text>
<g fill="#FFE066"><circle cx="378" cy="436" r="40"/><circle cx="486" cy="436" r="40"/></g><path d="M350 436H406M458 436H514" fill="none" stroke-width="5"/>
<path d="M566 540V424a46 46 0 0 1 92 0V540Z" fill="#4F8FE0"/><circle cx="612" cy="430" r="16" fill="#BFE6FF" stroke-width="5"/><circle cx="642" cy="486" r="6" fill="#FFC93C" stroke-width="4"/>
<path d="M-10 566Q260 530 520 552T1034 544V778H-10Z" fill="#C5C9DB"/>
${crater(90, 640, 46)}${crater(380, 730, 38)}${crater(940, 664, 50)}${crater(668, 716, 30)}
${roundTable('#B79BFF', '#FFE066')}</g>
<rect y="560" width="1024" height="208" fill="url(#ba-dots)"/>`;
}

const SCENES = {
  cart: ['A food cart in a sunny park', park],
  cafe: ['A cafe in a piazza in Italy', cafe],
  train: ['A dining car on a train crossing India', train],
  boat: ['The deck of a restaurant boat at sea', boatDeck],
  moon: ['A diner on the moon, with Earth in the sky', moonDiner],
};
// place: 'cart' (a park), 'cafe' (Italy), 'train' (a dining car in India), 'boat' (a deck at sea) or
// 'moon' (the moon diner). See SPOTS for where people stand.
export function scene(placeId) {
  const [label, draw] = SCENES[placeId] ?? SCENES.cart;
  return svg('0 0 1024 768', label, DOTS + draw());
}

// The farm, behind the things you can tap: sky, two soft hills, a fence line and a path. Nothing else:
// the screen puts the sources (see `source`) on top. farm('moon') is the same idea on the moon.
export function farm(placeId) {
  const onMoon = placeId === 'moon';
  const [far, near, path, rail] = onMoon ? ['#D9DCEA', '#C5C9DB', '#E3E6F2', '#8FD3FF'] : ['#9BDD7C', '#7BCB6B', '#F2D9A6', '#fff'];
  const posts = Array.from({ length: 15 }, (_, i) => `<path d="M${10 + i * 72} 470v-74l14-14 14 14v74z" fill="${rail}" stroke-width="6"/>`).join('');
  const sky = onMoon
    ? `${nightSky()}${G7}${twinkles([[130, 120, 1.5], [540, 90, 1.2]])}<g transform="translate(850 130) scale(.9)">${EARTH}</g>`
    : `<rect width="1024" height="768" fill="#8FD3FF"/>${G7}<circle cx="880" cy="110" r="56" fill="#FFE066"/>${cloud(110, 70, 1.3)}${cloud(500, 120, 1)}`;
  return svg('0 0 1024 768', onMoon ? 'A small farm on the moon: grey hills, a fence and a path, with Earth in the sky' : 'A small farm: two green hills, a fence and a path', `${DOTS}${sky}
<path d="M-10 400Q220 280 480 380T1034 330V778H-10Z" fill="${far}"/>
<path d="M-10 412H1034M-10 446H1034" fill="none" stroke-width="16"/><path d="M-10 412H1034M-10 446H1034" fill="none" stroke="${rail}" stroke-width="6"/>${posts}
<path d="M-10 476Q300 430 560 462T1034 448V778H-10Z" fill="${near}"/>
<path d="M392 778Q470 640 430 560Q404 500 478 458L548 461Q500 510 540 580Q600 680 660 778Z" fill="${path}" stroke-width="6"/></g>
<rect y="560" width="1024" height="208" fill="url(#ba-dots)"/>`);
}

/* ---------- Ways to travel ---------- */

// The rocket without its flame (so it can also stand parked on the moon). About x 10..230, y 10..292.
const ROCKET = `<path d="M54 196Q12 232 12 296L54 264Z" fill="#FF5E5E"/><path d="M186 196Q228 232 228 296L186 264Z" fill="#C93F3F"/>
<path d="M84 262H156L168 290H72Z" fill="#3B3B45"/>
<path d="M120 14Q186 80 186 190V264H54V190Q54 80 120 14Z" fill="#fff"/><path d="M120 14Q157.8 51.8 174 104H66Q82.2 51.8 120 14Z" fill="#FF5E5E"/>
<path d="M150 106H174Q186 150 186 190V262H160Q172 180 150 106Z" fill="#D9D3E6" stroke-width="0"/><path d="M142 40Q164 68 174 104H156Q152 70 142 40Z" fill="#C93F3F" stroke-width="0"/>
<path d="M56 232H184" fill="none" stroke="#FFC93C" stroke-width="16" stroke-linecap="butt"/><path d="M66 104H174" fill="none"/>
<path d="M120 14Q186 80 186 190V264H54V190Q54 80 120 14Z" fill="none"/>
<circle cx="120" cy="162" r="32" fill="#8FD3FF"/><path d="M102 158Q104 146 116 142" fill="none" stroke="#fff" stroke-width="6"/>`;

const VEHICLES = {
  rocket: ['0 0 240 364', 'A rocket', `${G7}<path d="M82 290Q72 330 120 358Q168 330 158 290Z" fill="#FF9F1C"/><path d="M102 290Q98 316 120 334Q142 316 138 290Z" fill="#FFE066" stroke-width="5"/>${ROCKET}</g>`],
  balloon: ['0 0 300 364', 'A hot-air balloon', `${G7}<path d="M40 130a110 110 0 1 1 220 0q-26 80-70 124h-80q-44-44-70-124z" fill="#FF5E5E"/>
<path d="M118 28q-34 110 4 226M182 28q34 110-4 226" fill="none" stroke="#FFE066" stroke-width="18" stroke-linecap="butt"/>
<path d="M214 60Q262 130 200 252H184Q250 150 214 60Z" fill="#C93F3F" stroke-width="0"/><path d="M68 112Q74 62 108 42" fill="none" stroke="#FFB0B0" stroke-width="9"/>
<path d="M40 130a110 110 0 1 1 220 0q-26 80-70 124h-80q-44-44-70-124z" fill="none"/>
<path d="M114 254v44M186 254v44" fill="none" stroke-width="5"/><rect x="104" y="298" width="92" height="56" rx="8" fill="#E0A458"/>
<path d="M172 302H192V350H176Q182 326 172 302Z" fill="#C4873E" stroke-width="0"/><path d="M108 316h84M108 334h84" fill="none" stroke-width="3.5"/></g>`],
  train: ['0 0 360 264', 'A little steam train', `${G7}<circle cx="110" cy="38" r="20" fill="#fff"/><circle cx="68" cy="22" r="14" fill="#fff"/>
<path d="M84 66h40l-6 50H90Z" fill="#3B3B45"/><rect x="40" y="110" width="210" height="92" rx="22" fill="#4F8FE0"/>
<path d="M44 168H246V182a18 18 0 0 1-18 18H62a18 18 0 0 1-18-18Z" fill="#3A72C2" stroke-width="0"/><path d="M44 150H240" fill="none" stroke="#FFC93C" stroke-width="9" stroke-linecap="butt"/>
<rect x="40" y="110" width="210" height="92" rx="22" fill="none"/><path d="M150 110a24 24 0 0 1 48 0z" fill="#FFC93C"/>
<rect x="232" y="62" width="100" height="140" rx="8" fill="#FF5E5E"/><path d="M306 66H328V198H310Q318 130 306 66Z" fill="#C93F3F" stroke-width="0"/><rect x="232" y="62" width="100" height="140" rx="8" fill="none"/>
<rect x="250" y="82" width="58" height="50" rx="6" fill="#BFE6FF"/><path d="M220 60H344" fill="none" stroke-width="13"/>
<circle cx="42" cy="150" r="14" fill="#FFE066"/><path d="M40 202L8 236H62Z" fill="#FFC93C"/>
<circle cx="96" cy="216" r="30" fill="#fff"/><circle cx="174" cy="216" r="30" fill="#fff"/><circle cx="284" cy="212" r="36" fill="#fff"/>
<path d="M96 216H284" fill="none" stroke-width="8"/><circle cx="96" cy="216" r="7" fill="${INK}"/><circle cx="174" cy="216" r="7" fill="${INK}"/><circle cx="284" cy="212" r="8" fill="${INK}"/></g>`],
  boat: ['0 0 360 284', 'A restaurant boat', `${G7}<circle cx="252" cy="26" r="14" fill="#fff"/><rect x="196" y="46" width="44" height="54" fill="#FF5E5E"/><path d="M196 62h44" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="butt"/><rect x="196" y="46" width="44" height="54" fill="none"/>
<path d="M120 100V30" fill="none"/><path d="M120 30l44 14-44 14z" fill="#7BE0C3"/>
<rect x="90" y="100" width="190" height="70" fill="#fff"/><path d="M252 104H278V166H258Q264 134 252 104Z" fill="#D9D3E6" stroke-width="0"/><rect x="90" y="100" width="190" height="70" fill="none"/>
<path d="M78 100H292L280 78H90Z" fill="#FFC93C"/><g fill="#8FD3FF" stroke-width="5"><circle cx="126" cy="136" r="15"/><circle cx="176" cy="136" r="15"/><circle cx="226" cy="136" r="15"/></g>
<path d="M20 168H340L300 240H64Z" fill="#FF5E5E"/><path d="M50 214H314L300 240H64Z" fill="#C93F3F" stroke-width="0"/><path d="M30 186H330" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="butt"/><path d="M20 168H340L300 240H64Z" fill="none"/>
<path d="M-10 246q23-18 46 0t46 0t46 0t46 0t46 0t46 0t46 0t46 0V294H-10Z" fill="#4FB3F0"/></g>`],
};
// kind: 'balloon', 'train', 'boat' or 'rocket'.
export function vehicle(kind) {
  const [viewBox, label, body] = VEHICLES[kind] ?? VEHICLES.balloon;
  return svg(viewBox, label, body);
}

/* ---------- Upgrades, the happy plate and sound words ---------- */

const G4U = `<g stroke="${INK}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">`;
const note = (x, y) => `<path d="M${x} ${y}v-14l12-3v14" fill="none" stroke-width="3.5"/><ellipse cx="${x - 4}" cy="${y}" rx="5" ry="3.8" fill="${INK}" stroke-width="2"/><ellipse cx="${x + 8}" cy="${y - 3}" rx="5" ry="3.8" fill="${INK}" stroke-width="2"/>`;
const UPGRADE_ART = {
  umbrella: ['A big striped umbrella', `${G4U}<path d="M48 22V88" fill="none" stroke-width="6"/><path d="M6 50Q48 -8 90 50Q79 40 69 50Q58 40 48 50Q38 40 27 50Q17 40 6 50Z" fill="#FF5E5E"/>
<path d="M48 14Q34 28 27 50Q38 40 48 50Q58 40 69 50Q62 28 48 14Z" fill="#fff" stroke-width="0"/><path d="M72 30Q84 40 90 50Q80 41 70 49Q74 40 72 30Z" fill="#C93F3F" stroke-width="0"/>
<path d="M6 50Q48 -8 90 50Q79 40 69 50Q58 40 48 50Q38 40 27 50Q17 40 6 50Z" fill="none"/><path d="M48 14Q34 28 27 50M48 14Q62 28 69 50" fill="none" stroke-width="3"/><path d="M34 90H62" fill="none" stroke-width="6"/></g>`],
  bell: ['A golden bell', `${G4U}<circle cx="48" cy="16" r="7" fill="#FFC93C"/><path d="M20 68Q26 60 26 44a22 22 0 0 1 44 0Q70 60 76 68Z" fill="#FFC93C"/><path d="M58 26Q68 34 68 46Q68 60 72 66H58Q62 46 58 26Z" fill="#E0A21F" stroke-width="0"/>
<path d="M20 68Q26 60 26 44a22 22 0 0 1 44 0Q70 60 76 68Z" fill="none"/><circle cx="48" cy="78" r="8" fill="#E0A21F"/><path d="M14 70H82" fill="none" stroke-width="7"/>
<path d="M12 30l-9-6M10 46H1M84 30l9-6M86 46h9" fill="none"/></g>`],
  chairs: ['A comfy chair', `${G4U}<path d="M26 82v8M70 82v8" fill="none" stroke-width="7"/><path d="M24 56V28a14 14 0 0 1 14-14h20a14 14 0 0 1 14 14v28Z" fill="#FF8FB1"/>
<path d="M60 16a14 14 0 0 1 10 12v26H60Q66 34 60 16Z" fill="#E86A93" stroke-width="0"/><path d="M24 56V28a14 14 0 0 1 14-14h20a14 14 0 0 1 14 14v28Z" fill="none"/>
<rect x="20" y="54" width="56" height="28" rx="8" fill="#FFB5C8"/><rect x="8" y="42" width="18" height="42" rx="9" fill="#E86A93"/><rect x="70" y="42" width="18" height="42" rx="9" fill="#E86A93"/>
<circle cx="48" cy="34" r="4" fill="#FFE066" stroke-width="3"/></g>`],
  musicbox: ['A music box', `${G4U}<path d="M14 48L24 26H80L72 48Z" fill="#9274E6"/><rect x="14" y="48" width="58" height="36" rx="4" fill="#B79BFF"/><path d="M58 51H69V81H60Q64 66 58 51Z" fill="#9274E6" stroke-width="0"/><rect x="14" y="48" width="58" height="36" rx="4" fill="none"/>
<g fill="#EF476F" stroke-width="3">${heart(42, 56, 0.6)}</g><path d="M72 66h14V54" fill="none" stroke-width="5"/><circle cx="86" cy="50" r="6" fill="#FF5E5E"/>${note(34, 21)}${note(60, 20)}</g>`],
  window: ['A bigger window', `${G4U}<rect x="10" y="10" width="76" height="66" rx="6" fill="#A0673A"/><rect x="18" y="18" width="60" height="50" fill="#8FD3FF"/><circle cx="62" cy="32" r="8" fill="#FFE066" stroke-width="3"/>
<path d="M18 68V56Q34 44 50 56T78 52V68Z" fill="#7BCB6B" stroke-width="3"/><path d="M48 18V68M18 43H78" fill="none"/>
<path d="M18 18H34Q32 40 18 50Z" fill="#FF9F1C" stroke-width="3.5"/><path d="M78 18H62Q64 40 78 50Z" fill="#FF9F1C" stroke-width="3.5"/><path d="M4 80H92" fill="none" stroke-width="8"/></g>`],
  spices: ['A rack of spice jars', `${G4U}${[['#E8453C', 8], ['#FFC93C', 36], ['#5FBF5A', 64]].map(([c, x]) =>
    `<rect x="${x}" y="36" width="24" height="40" rx="5" fill="${c}"/><rect x="${x + 4}" y="48" width="16" height="14" fill="#fff" stroke-width="3"/><rect x="${x - 1}" y="26" width="26" height="11" rx="3" fill="#A0673A"/>`).join('')}
<path d="M2 80H94" fill="none" stroke-width="8"/><path d="M14 14q4 6 0 12M48 10q4 6 0 12M80 14q4 6 0 12" fill="none" stroke-width="3.5"/></g>`],
  net: ['A fishing net with a fish in it', `${G4U}<path d="M34 62L10 90" fill="none" stroke-width="12"/><path d="M34 62L10 90" fill="none" stroke="#E0A458" stroke-width="5"/>
<ellipse cx="56" cy="38" rx="32" ry="28" fill="#DFF4FB"/><path d="M34 20L80 52M46 12L88 40M28 36L66 64M50 12L36 58M68 12L52 64M84 22L70 62" fill="none" stroke-width="2.5" opacity=".55"/>
<path d="M36 40Q50 24 64 38Q70 32 76 30Q74 40 76 50Q70 46 64 42Q50 56 36 40Z" fill="#FF8A73" stroke-width="3.5"/><circle cx="45" cy="38" r="2.5" fill="${INK}" stroke-width="0"/>
<ellipse cx="56" cy="38" rx="32" ry="28" fill="none" stroke-width="6"/></g>`],
  bubbles: ['A bubble machine', `${G4U}<path d="M34 50h28l-6 12H40z" fill="#FFC93C"/><rect x="14" y="60" width="68" height="30" rx="9" fill="#6EC6FF"/><path d="M68 62H74Q80 62 80 70V80Q80 88 74 88H68Q72 76 68 62Z" fill="#4FA3E6" stroke-width="0"/><rect x="14" y="60" width="68" height="30" rx="9" fill="none"/>
<circle cx="32" cy="75" r="7" fill="#FF5E8A" stroke-width="3"/><path d="M48 70h20M48 80h20" fill="none" stroke="#fff" stroke-width="4"/>
<g fill="#DFF4FB" stroke-width="3.5"><circle cx="30" cy="32" r="12"/><circle cx="60" cy="20" r="15"/><circle cx="82" cy="42" r="8"/><circle cx="12" cy="12" r="6"/></g>
<path d="M23 31a8 8 0 0 1 6-7M50 19a10 10 0 0 1 8-9" fill="none" stroke="#fff" stroke-width="3.5"/></g>`],
  lamp: ['A star lamp', `${G4U}<path d="M14 14l-9-6M82 14l9-6M8 40H1M88 40h7" fill="none"/><path d="M48 56V84" fill="none" stroke-width="7"/><path d="M28 90Q28 80 48 80Q68 80 68 90Z" fill="#B79BFF"/>
<path d="M48 6L57 28L81 30L63 46L68 69L48 57L28 69L33 46L15 30L39 28Z" fill="#FFE066"/><path d="M48 6L57 28L81 30L63 46L68 69L56 62Q62 40 48 6Z" fill="#FFC93C" stroke-width="0"/>
<path d="M48 6L57 28L81 30L63 46L68 69L48 57L28 69L33 46L15 30L39 28Z" fill="none"/><path d="M40 34Q42 26 47 22" fill="none" stroke="#fff" stroke-width="4"/></g>`],
  flag: ['A flag with a heart on it', `${G4U}<path d="M6 92Q30 70 62 92Z" fill="#C5C9DB"/><path d="M28 86V12" fill="none" stroke-width="6"/><circle cx="28" cy="9" r="6" fill="#FFC93C"/>
<path d="M28 16Q46 8 60 16T90 16V56Q74 64 60 56T28 56Z" fill="#7BE0C3"/><path d="M76 18Q84 20 90 16V56Q84 60 76 58Q80 38 76 18Z" fill="#4FB89B" stroke-width="0"/><path d="M28 16Q46 8 60 16T90 16V56Q74 64 60 56T28 56Z" fill="none"/>
<g fill="#EF476F" stroke-width="3.5">${heart(56, 36, 0.9)}</g></g>`],
};
// id: umbrella, bell, chairs, musicbox, window, spices, net, bubbles, lamp, flag.
export function upgrade(id) {
  const [label, body] = UPGRADE_ART[id] ?? UPGRADE_ART.bell;
  return svg('0 0 96 96', label, body);
}

// A happy plate for the counter. golden = true is worth two.
export function plate(golden = false) {
  const [rim, well, dark] = golden ? ['#FFC93C', '#FFE066', '#E0A21F'] : ['#fff', '#F1ECF9', '#D9D3E6'];
  return svg('0 0 96 96', golden ? 'A golden happy plate' : 'A happy plate',
    `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><circle cx="48" cy="50" r="40" fill="${rim}"/>
<path d="M70 18a40 40 0 0 1 -6 68a44 44 0 0 0 6-68z" fill="${dark}" stroke-width="0"/><circle cx="48" cy="50" r="40" fill="none"/><circle cx="48" cy="50" r="26" fill="${well}" stroke-width="3.5"/>
<circle cx="39" cy="45" r="4" fill="${INK}" stroke-width="0"/><circle cx="57" cy="45" r="4" fill="${INK}" stroke-width="0"/><path d="M36 55Q48 69 60 55" fill="none" stroke-width="4.5"/>
${golden ? `<g fill="#fff" stroke-width="3">${star(14, 18, 0.9)}${star(84, 82, 0.7)}</g>` : ''}</g>`);
}

// A slanted, outlined sound word such as sfx('YUM!', '#FFE066').
export function sfx(word, colour = '#FFE066') {
  const text = esc(word);
  const w = Math.max(140, String(word).length * 46 + 70);
  return svg(`0 0 ${w} 140`, String(word),
    `<text x="${w / 2}" y="100" text-anchor="middle" transform="rotate(-6 ${w / 2} 70)" font-family="${FONT_BIG}" font-size="88" letter-spacing="4" fill="${esc(colour)}" stroke="${INK}" stroke-width="9" stroke-linejoin="round" paint-order="stroke">${text}</text>`);
}

/* ---------- Foods ---------- */

// A slice of bread in a 64 box: crust, crumb, then whatever sits on top.
const SLICE_OUT = 'M12 26Q5 12 20 12Q32 3 44 12Q59 12 52 26V52Q52 58 46 58H18Q12 58 12 52Z';
const SLICE_IN = 'M18 28Q13 18 23 18Q32 11 41 18Q51 18 46 28V49Q46 52 43 52H21Q18 52 18 49Z';
const slice = (crust, crumb, top = '') => `<path d="${SLICE_OUT}" fill="${crust}"/><path d="${SLICE_IN}" fill="${crumb}" stroke-width="0"/>${top}`;
const MOON_MELT = `<path d="M15 30Q32 20 49 30V42Q47 51 43 43Q39 38 35 45Q31 54 27 44Q23 39 15 45Z" fill="#FFF1A6" stroke-width="2.5"/><g fill="#D9BC4E" stroke-width="1.5"><ellipse cx="25" cy="33" rx="3.5" ry="2.5"/><ellipse cx="38" cy="35" rx="4" ry="3"/><ellipse cx="32" cy="28" rx="2" ry="1.5"/></g>`;
const MOON_TOAST = slice('#C97B2A', '#F2B56B', MOON_MELT) + `<g fill="#FFE066" stroke-width="2">${star(55, 12, 0.6)}</g>`;

const FOOD_ART = {
  'orange-juice': ['Orange juice', `${G3}<path d="M18 18H46L42 56H22Z" fill="#fff"/><path d="M19.5 30H44.5L42 56H22Z" fill="#FF9F1C"/><path d="M36 24L42 6" fill="none"/><circle cx="48" cy="18" r="8" fill="#FFC93C"/><path d="M48 10V26M40 18H56" fill="none" stroke-width="2"/></g>`],
  pizza: ['Pizza', `${G3}<path d="M8 16Q32 4 56 16L32 60Z" fill="#FFD166"/><path d="M8 16Q32 4 56 16" fill="none" stroke="#C97B2A" stroke-width="7"/><path d="M8 16Q32 4 56 16L32 60Z" fill="none"/><circle cx="26" cy="26" r="5" fill="#EF476F"/><circle cx="39" cy="30" r="5" fill="#EF476F"/><circle cx="32" cy="43" r="4" fill="#EF476F"/></g>`],
  'mango-lassi': ['Mango lassi', `${G3}<path d="M18 16H46L42 58H22Z" fill="#FFC857"/><path d="M18 16H46L45 26Q32 32 19 26Z" fill="#fff"/><path d="M38 20L46 4" fill="none"/><path d="M24 10Q30 2 36 10Q30 14 24 10Z" fill="#5ED6B0"/></g>`],
  pie: ['Pie', `${G3}<path d="M6 40L40 14Q58 20 58 40Z" fill="#F2B56B"/><path d="M6 40H58V48H6Z" fill="#C97B2A"/><path d="M40 14Q58 20 58 40" fill="none" stroke="#C97B2A" stroke-width="6"/><path d="M40 14Q58 20 58 40" fill="none"/><path d="M28 34l4-4M38 36l4-4M34 26l4-4" fill="none" stroke="#EF476F" stroke-width="3"/></g>`],
  tea: ['Tea', `${G3}<ellipse cx="30" cy="54" rx="24" ry="5" fill="#E4DBFF"/><path d="M10 28H46Q46 50 28 50Q10 50 10 28Z" fill="#fff"/><path d="M46 32h5a5 5 0 0 1 0 11h-7" fill="none"/><ellipse cx="28" cy="28" rx="18" ry="5" fill="#B5D96A"/><path d="M22 18q-4-5 0-9M32 18q-4-5 0-9" fill="none" stroke="#8A7AA3"/></g>`],
  spaghetti: ['Spaghetti', `${G3}<ellipse cx="32" cy="44" rx="28" ry="12" fill="#fff"/><path d="M12 40Q12 20 32 20Q52 20 52 40Q32 50 12 40Z" fill="#FFD166"/><path d="M18 36Q25 28 32 36T46 34" fill="none" stroke="#E0A62A" stroke-width="2.5"/><path d="M22 26Q32 10 42 26Q32 32 22 26Z" fill="#EF476F"/></g>`],
  coffee: ['Coffee', `${G3}<path d="M12 24H44V46a10 10 0 0 1-10 10H22a10 10 0 0 1-10-10Z" fill="#6EC6FF"/><path d="M44 30h6a7 7 0 0 1 0 14h-6" fill="none"/><ellipse cx="28" cy="24" rx="16" ry="5" fill="#8A5A32"/><path d="M22 14q-4-5 0-9M32 14q-4-5 0-9" fill="none" stroke="#8A7AA3"/></g>`],
  boba: ['Boba', `${G3}<path d="M16 18H48L43 58H21Z" fill="#E8C9A0"/><g fill="${INK}" stroke-width="0"><circle cx="26" cy="51" r="4"/><circle cx="35" cy="52" r="4"/><circle cx="30" cy="44" r="4"/><circle cx="39" cy="45" r="4"/></g><path d="M16 18H48L43 58H21Z" fill="none"/><path d="M36 24L42 3" fill="none" stroke-width="9"/><path d="M36 24L42 3" fill="none" stroke="#FF5E8A" stroke-width="4"/></g>`],
  cupcake: ['Cupcake', `${G3}<path d="M12 28Q8 18 20 16Q20 6 32 8Q44 4 46 16Q58 18 52 28Z" fill="#fff"/><path d="M14 28H50L45 58H19Z" fill="#FF8FB1"/><path d="M24 30l2 26M32 30v26M40 30l-2 26" fill="none" stroke-width="2"/><circle cx="32" cy="8" r="5" fill="#EF476F"/><g stroke-width="0"><circle cx="22" cy="21" r="2" fill="#6EC6FF"/><circle cx="40" cy="19" r="2" fill="#FFC93C"/><circle cx="30" cy="18" r="2" fill="#5ED6B0"/></g></g>`],
  salmon: ['Salmon', `${G3}<ellipse cx="32" cy="40" rx="29" ry="17" fill="#fff"/><path d="M10 40Q22 24 40 28Q52 32 50 42Q36 54 10 40Z" fill="#FF8A73"/><path d="M24 35l4 10M32 33l4 12M40 33l3 10" fill="none" stroke="#FFD0C4" stroke-width="2.5"/><circle cx="50" cy="27" r="8" fill="#FFE066"/></g>`],
  'moon-toast': ['Moon cheese toast', `${G3}${MOON_TOAST}</g>`],
};

export function food(id) {
  const [label, body] = FOOD_ART[id] ?? FOOD_ART['orange-juice'];
  return svg('0 0 64 64', label, body);
}

/* ---------- Ingredients, kitchen things and small pictures ---------- */

const G5 = `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">`;
const SPARKLE = `<path d="M32 6L39 24L58 26L43 38L48 57L32 46L16 57L21 38L6 26L25 24Z" fill="#8B6BE8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><text x="32" y="42" text-anchor="middle" font-family="'Bangers', 'Baloo 2', sans-serif" font-weight="800" font-size="22" fill="#fff">?</text>`;
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

/* The five later foods: tea, spaghetti, coffee, boba, salmon */
const STEAM = (x, y) => `<path d="M${x} ${y}q-10-12 0-24M${x + 28} ${y}q-10-12 0-24" fill="none" stroke="#8A7AA3" stroke-width="5"/>`;
const pot = full => `${G5}<path d="M30 70H210V160a24 24 0 0 1-24 24H54a24 24 0 0 1-24-24Z" fill="#B9A4F5"/><path d="M30 96H6M210 96h24" fill="none" stroke-width="12"/><ellipse cx="120" cy="70" rx="90" ry="20" fill="${full ? '#FFD166' : '#DFF4FB'}"/>${full ? `<path d="M60 70Q80 58 100 70T140 70T180 70" fill="none" stroke="#E0A62A" stroke-width="4"/>${STEAM(104, 40)}` : ''}</g>`;
const PLATE = `<ellipse cx="120" cy="112" rx="112" ry="48" fill="#fff"/><ellipse cx="120" cy="108" rx="78" ry="28" fill="#F1ECF9" stroke-width="3"/>`;
const PASTA_PILE = `<path d="M56 106Q56 50 120 50Q184 50 184 106Q120 134 56 106Z" fill="#FFD166" stroke-width="4"/><path d="M74 100Q90 78 106 100T138 100T170 96M84 82Q100 64 116 82T150 80" fill="none" stroke="#E0A62A" stroke-width="4"/>`;
const SAUCE = `<path d="M84 76Q120 34 156 76Q152 96 120 96Q88 96 84 76Z" fill="#EF476F" stroke-width="4"/>`;
const CHEESE_BITS = `<g fill="#FFF1A8" stroke-width="2.5"><circle cx="104" cy="66" r="7"/><circle cx="124" cy="58" r="7"/><circle cx="138" cy="74" r="7"/><circle cx="116" cy="80" r="6"/></g>`;
const fillet = colour => `<path d="M40 106Q84 56 152 70Q198 80 202 106Q150 138 40 106Z" fill="${colour}" stroke-width="4"/><path d="M84 88l10 30M112 80l10 40M140 80l8 34M166 86l6 24" fill="none" stroke="#FFD0C4" stroke-width="4"/>`;
const LEMON_SLICE = `<g stroke-width="3"><circle cx="186" cy="74" r="24" fill="#FFE066"/><circle cx="186" cy="74" r="16" fill="#FFF6B8"/><path d="M186 58V90M170 74H202" fill="none" stroke-width="2.5"/></g>`;
const dinnerPlate = on => `${G5}${PLATE}${on}</g>`;
const teapot = state => `${G5}<path d="M190 124Q226 112 238 76" fill="none" stroke-width="16"/><path d="M52 100Q12 100 16 136Q20 166 54 160" fill="none" stroke-width="10"/><path d="M50 112Q50 62 120 62Q190 62 190 112V150Q190 196 120 196Q50 196 50 150Z" fill="#FF8FB1"/><path d="M76 64Q120 32 164 64Z" fill="#FF5E8A"/><circle cx="120" cy="40" r="11" fill="#FFC93C" stroke-width="4"/><circle cx="120" cy="130" r="36" fill="${state === 'full' ? '#B5D96A' : '#fff'}" stroke-width="4"/>${state === 'leaves' ? '<g fill="#5FBF5A" stroke-width="3"><path d="M100 144Q98 118 122 112Q126 138 100 144Z"/><path d="M122 150Q124 128 146 126Q146 148 122 150Z"/></g>' : ''}${state === 'full' ? STEAM(214, 62) : ''}</g>`;
const teacup = full => `${G5}<ellipse cx="96" cy="146" rx="84" ry="10" fill="#E4DBFF"/><path d="M150 58h14a18 18 0 0 1 0 38h-20" fill="none" stroke-width="8"/><path d="M26 42H150Q150 134 88 134Q26 134 26 42Z" fill="#fff"/><ellipse cx="88" cy="42" rx="62" ry="14" fill="${full ? '#B5D96A' : '#F1ECF9'}"/>${full ? STEAM(74, 22) : ''}</g>`;
const grinder = state => `${G5}<path d="M30 20H160L130 100H60Z" fill="#fff" fill-opacity=".85"/>${state === 'beans' ? '<g fill="#8A5A32" stroke-width="3"><ellipse cx="80" cy="76" rx="12" ry="16"/><ellipse cx="108" cy="80" rx="12" ry="16"/><ellipse cx="94" cy="54" rx="12" ry="16"/></g><path d="M30 20H160L130 100H60Z" fill="none"/>' : ''}<rect x="40" y="100" width="110" height="136" rx="14" fill="#C97B2A"/><rect x="60" y="170" width="70" height="44" rx="6" fill="${state === 'ground' ? '#5A3A28' : '#F2B56B'}" stroke-width="4"/><circle cx="95" cy="192" r="6" fill="#FFC93C" stroke-width="3"/><path d="M150 132h26v-30" fill="none" stroke-width="8"/><circle cx="176" cy="96" r="11" fill="#FF5E8A" stroke-width="4"/></g>`;
const mug = inside => `${G5}<path d="M150 64h16a22 22 0 0 1 0 52h-16" fill="none" stroke-width="9"/><path d="M30 42H150V140a26 26 0 0 1-26 26H56a26 26 0 0 1-26-26Z" fill="#6EC6FF"/><ellipse cx="90" cy="42" rx="60" ry="14" fill="${{ empty: '#DFF4FB', coffee: '#5A3A28', latte: '#C99A6B' }[inside]}"/>${inside === 'latte' ? '<path d="M90 50l-12-9a7 6 0 0 1 12-4a7 6 0 0 1 12 4z" fill="#fff" stroke-width="0"/>' : ''}${inside === 'empty' ? '' : STEAM(76, 22)}</g>`;
const PAN = `<path d="M200 88H282" fill="none" stroke-width="18"/><path d="M200 88H282" fill="none" stroke="#C97B2A" stroke-width="9"/><path d="M20 72H200V112a30 30 0 0 1-30 30H50a30 30 0 0 1-30-30Z" fill="#5A4470"/><ellipse cx="110" cy="72" rx="90" ry="24" fill="#8B79A8"/>`;
const pan = state => `${G5}${PAN}${state ? `<path d="M46 72Q80 44 128 54Q168 60 172 74Q128 96 46 72Z" fill="${state === 'cooked' ? '#FF8A73' : '#FFC2B5'}" stroke-width="4"/>` : ''}${state === 'cooked' ? `<path d="M84 60l6 22M110 56l6 28M136 58l4 22" fill="none" stroke="#C4553F" stroke-width="4"/>${STEAM(96, 36)}` : ''}</g>`;
// Moon cheese toast in the pan: 'bread', 'raw' (cheese on top) or 'toasting' (melting, with steam).
const toastPan = stage => {
  const hot = stage === 'toasting';
  const bread = `<path d="M60 62Q42 50 80 50Q110 42 140 50Q178 50 160 62V82Q160 90 145 90H75Q60 90 60 82Z" fill="${hot ? '#C97B2A' : '#E0A458'}" stroke-width="4"/><path d="M75 64Q62 55 87 55Q110 49 133 55Q158 55 145 64V81Q145 84 138 84H82Q75 84 75 81Z" fill="${hot ? '#F2B56B' : '#FFF6E0'}" stroke-width="0"/>`;
  const holes = '<g fill="#D9BC4E" stroke-width="2.5"><ellipse cx="98" cy="67" rx="6" ry="3.5"/><ellipse cx="124" cy="71" rx="7" ry="4"/></g>';
  const cheese = stage === 'bread' ? '' : hot
    ? `<path d="M72 62Q110 50 148 62V76Q144 86 136 78Q128 72 120 80Q110 90 100 79Q92 72 84 80Q74 86 72 76Z" fill="#FFF1A6" stroke-width="4"/>${holes}${STEAM(96, 36)}`
    : `<ellipse cx="110" cy="68" rx="32" ry="11" fill="#FFF1A6" stroke-width="4"/>${holes}`;
  return `${G5}${PAN}${bread}${cheese}</g>`;
};
const BCUP = 'M20 40H170L146 266H44Z';
const PEARLS = `<g fill="${INK}" stroke-width="0"><circle cx="66" cy="246" r="13"/><circle cx="96" cy="250" r="13"/><circle cx="126" cy="246" r="13"/><circle cx="80" cy="222" r="13"/><circle cx="112" cy="224" r="13"/><circle cx="96" cy="200" r="13"/></g>`;
const bobaCup = stage => `${G5}<path d="${BCUP}" fill="#fff" fill-opacity=".85"/>${stage >= 2 ? '<path d="M27.6 110H162.4L146 266H44Z" fill="#E8C9A0" stroke-width="0"/>' : ''}${stage >= 1 ? PEARLS : ''}${stage >= 3 ? '<g fill="#DFF4FB" stroke-width="3"><rect x="52" y="118" width="34" height="34" rx="7"/><rect x="96" y="128" width="34" height="34" rx="7" transform="rotate(12 113 145)"/></g>' : ''}<path d="${BCUP}" fill="none"/>${stage >= 4 ? '<path d="M104 236L132 4" fill="none" stroke-width="20"/><path d="M104 236L132 4" fill="none" stroke="#FF5E8A" stroke-width="11"/>' : ''}</g>`;

/* Cupcake */
const CASE = `<path d="M30 76H140L124 158H46Z" fill="#FF8FB1"/><path d="M58 78l6 78M85 78v78M112 78l-6 78" fill="none" stroke-width="3"/>`;
const DOME = `<path d="M24 78Q28 34 85 34Q142 34 146 78Z" fill="#F2B56B"/>`;
const SWIRL = `<path d="M22 78Q14 54 42 50Q38 28 66 30Q74 8 96 18Q118 12 118 34Q142 36 132 54Q156 62 148 78Z" fill="#fff"/><path d="M44 54Q70 44 96 52M68 32Q88 26 106 34" fill="none" stroke="#E4DBFF" stroke-width="3"/>`;
const SPRINKLED = `<g stroke-width="0"><rect x="48" y="58" width="12" height="5" rx="2" fill="#6EC6FF" transform="rotate(20 54 60)"/><rect x="78" y="40" width="12" height="5" rx="2" fill="#FFC93C" transform="rotate(-30 84 42)"/><rect x="104" y="56" width="12" height="5" rx="2" fill="#5ED6B0" transform="rotate(40 110 58)"/><rect x="72" y="62" width="12" height="5" rx="2" fill="#FF5E8A" transform="rotate(-10 78 64)"/><rect x="118" y="66" width="12" height="5" rx="2" fill="#B79BFF"/><rect x="34" y="68" width="12" height="5" rx="2" fill="#FFC93C" transform="rotate(-25 40 70)"/></g><circle cx="88" cy="16" r="11" fill="#EF476F" stroke-width="4"/>`;
const cupcake = top => `${G5}${top}${CASE}</g>`;
// One wobbly soap bubble for the bubble machine.
const bubble = (x, y, r, delay) => `<g class="d-bob" style="animation-delay:${delay}s"><circle cx="${x}" cy="${y}" r="${r}" fill="#DFF4FB" fill-opacity=".7" stroke="${INK}" stroke-width="3"/><path d="M${x - r * 0.45} ${y - r * 0.1}a${r * 0.5} ${r * 0.5} 0 0 1 ${r * 0.4}-${r * 0.45}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`;

// [viewBox, label, drawing]
const ITEM_ART = {
  flour: ['0 0 64 64', 'Bag of flour', `${G3}<path d="M16 18Q12 40 14 58H50Q52 40 48 18Z" fill="#FFF6E0"/><path d="M16 18Q32 6 48 18Q32 24 16 18Z" fill="#F2D9A0"/><path d="M24 40h16M32 32v16" fill="none" stroke="#E0A62A" stroke-width="4"/></g>`],
  sprinkles: ['0 0 64 64', 'Sprinkles', `<g stroke="${INK}" stroke-width="2.5"><rect x="8" y="14" width="22" height="9" rx="4" fill="#6EC6FF" transform="rotate(25 19 18)"/><rect x="34" y="10" width="22" height="9" rx="4" fill="#FFC93C" transform="rotate(-20 45 14)"/><rect x="18" y="32" width="22" height="9" rx="4" fill="#FF5E8A" transform="rotate(-35 29 36)"/><rect x="36" y="38" width="22" height="9" rx="4" fill="#5ED6B0" transform="rotate(15 47 42)"/><rect x="10" y="48" width="22" height="9" rx="4" fill="#B79BFF" transform="rotate(10 21 52)"/></g>`],
  frosting: ['0 0 64 64', 'Frosting', `${G3}<path d="M10 12L54 20L26 52Z" fill="#fff"/><path d="M26 52l-6 8" fill="none" stroke-width="6"/><path d="M26 52l-6 8" fill="none" stroke="#FF8FB1" stroke-width="3"/><path d="M10 12L54 20" fill="none" stroke="#FF8FB1" stroke-width="6"/><path d="M10 12L54 20" fill="none"/></g>`],
  'case-empty': ['0 0 170 170', 'Cupcake case', cupcake('')],
  'case-batter': ['0 0 170 170', 'Cupcake case full of batter', cupcake('<ellipse cx="85" cy="76" rx="55" ry="12" fill="#FFE9A8" stroke-width="4"/>')],
  'cupcake-plain': ['0 0 170 170', 'A baked cupcake', cupcake(DOME)],
  'cupcake-frosted': ['0 0 170 170', 'Cupcake with frosting', cupcake(SWIRL)],
  'cupcake-done': ['0 0 170 170', 'Cupcake with frosting, sprinkles and a cherry', cupcake(SWIRL + SPRINKLED)],
  'tea-leaf': ['0 0 64 64', 'Tea leaf', `${G3}<path d="M10 54Q8 20 52 10Q56 50 10 54Z" fill="#5FBF5A"/><path d="M14 50Q28 34 46 16" fill="none" stroke="#2E9E55"/></g>`],
  pasta: ['0 0 64 64', 'Pasta', `${G3}<path d="M8 40Q8 20 32 20Q56 20 56 40Q56 54 32 54Q8 54 8 40Z" fill="#FFD166"/><path d="M16 38Q24 26 32 38T48 38M20 47Q28 38 36 47T46 45" fill="none" stroke="#E0A62A"/></g>`],
  bean: ['0 0 64 64', 'Coffee bean', `${G3}<ellipse cx="32" cy="32" rx="18" ry="25" fill="#8A5A32" transform="rotate(20 32 32)"/><path d="M40 10Q24 30 26 54" fill="none" stroke="#5A3A28"/></g>`],
  boba: ['0 0 64 64', 'Boba pearls', `${G3}<g fill="#5A3A28"><circle cx="21" cy="42" r="13"/><circle cx="43" cy="42" r="13"/><circle cx="32" cy="22" r="13"/></g><g fill="#fff" stroke-width="0"><circle cx="17" cy="38" r="3"/><circle cx="39" cy="38" r="3"/><circle cx="28" cy="18" r="3"/></g></g>`],
  fish: ['0 0 64 64', 'Fish', `${G3}<path d="M6 32Q26 10 46 30Q54 22 60 20Q57 32 60 46Q54 42 46 36Q26 54 6 32Z" fill="#FF8A73"/><path d="M30 24Q35 32 30 40" fill="none" stroke-width="2"/></g><circle cx="18" cy="29" r="3" fill="${INK}"/><path d="M12 36q5 3 9 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`],
  lemon: ['0 0 64 64', 'Lemon', `${G3}<path d="M6 34Q12 12 32 14Q50 14 58 32Q52 52 32 52Q14 52 6 34Z" fill="#FFE066"/><path d="M44 14Q50 4 58 8Q56 18 44 14Z" fill="#3FB56B"/><path d="M18 30Q22 22 30 22" fill="none" stroke="#FFF6B8"/></g>`],
  kettle: ['0 0 64 64', 'Kettle of hot water', `${G3}<path d="M48 34L60 24" fill="none" stroke-width="6"/><path d="M20 20Q32 2 44 20" fill="none"/><path d="M12 56V32Q12 18 32 18Q52 18 52 32V56Z" fill="#6EC6FF"/><path d="M12 44H52" fill="none" stroke="#fff"/></g>`],
  straw: ['0 0 64 64', 'Straw', `<g stroke-linecap="round"><path d="M22 58L42 6" fill="none" stroke="${INK}" stroke-width="13"/><path d="M22 58L42 6" fill="none" stroke="#FF5E8A" stroke-width="7"/></g>`],
  pot: ['0 0 240 200', 'Pot of water', pot(false)],
  'pot-pasta': ['0 0 240 200', 'Pot of cooked pasta', pot(true)],
  'plate-empty': ['0 0 240 170', 'Empty plate', dinnerPlate('')],
  'plate-pasta': ['0 0 240 170', 'Plate of pasta', dinnerPlate(PASTA_PILE)],
  'plate-sauce': ['0 0 240 170', 'Pasta with tomato sauce', dinnerPlate(PASTA_PILE + SAUCE)],
  'plate-spaghetti': ['0 0 240 170', 'Spaghetti with tomato sauce and cheese', dinnerPlate(PASTA_PILE + SAUCE + CHEESE_BITS)],
  'plate-fish': ['0 0 240 170', 'Cooked salmon on a plate', dinnerPlate(fillet('#FF8A73'))],
  'plate-salmon': ['0 0 240 170', 'Salmon with lemon', dinnerPlate(fillet('#FF8A73') + LEMON_SLICE)],
  teapot: ['0 0 250 217', 'Teapot', teapot('empty')],
  'teapot-leaves': ['0 0 250 217', 'Teapot with tea leaves', teapot('leaves')],
  'teapot-full': ['0 0 250 217', 'Teapot full of hot tea', teapot('full')],
  'cup-empty': ['0 0 200 160', 'Empty teacup', teacup(false)],
  'cup-tea': ['0 0 200 160', 'Cup of tea', teacup(true)],
  grinder: ['0 0 200 257', 'Coffee grinder', grinder('empty')],
  'grinder-beans': ['0 0 200 257', 'Coffee grinder with beans', grinder('beans')],
  'grinder-ground': ['0 0 200 257', 'Coffee grinder with ground coffee', grinder('ground')],
  'mug-empty': ['0 0 200 180', 'Empty mug', mug('empty')],
  'mug-coffee': ['0 0 200 180', 'Mug of coffee', mug('coffee')],
  'mug-latte': ['0 0 200 180', 'Coffee with milk', mug('latte')],
  pan: ['0 0 300 170', 'Frying pan', pan('')],
  'pan-fish': ['0 0 300 170', 'Fish in the pan', pan('raw')],
  'pan-cooked': ['0 0 300 170', 'Cooked fish in the pan', pan('cooked')],
  'bcup-0': ['0 0 190 277', 'Empty cup', bobaCup(0)],
  'bcup-1': ['0 0 190 277', 'Cup with boba pearls', bobaCup(1)],
  'bcup-2': ['0 0 190 277', 'Boba pearls and milk', bobaCup(2)],
  'bcup-3': ['0 0 190 277', 'Boba with ice', bobaCup(3)],
  'bcup-4': ['0 0 190 277', 'Boba with ice and a straw', bobaCup(4)],
  'pan-bread': ['0 0 300 170', 'Bread in the pan', toastPan('bread')],
  'pan-toast-raw': ['0 0 300 170', 'Bread with moon cheese in the pan', toastPan('raw')],
  'pan-toasting': ['0 0 300 170', 'Moon cheese toast, toasting in the pan', toastPan('toasting')],
  'toast-done': ['0 0 240 170', 'Moon cheese toast on a plate', dinnerPlate(`<g transform="translate(59 -6) scale(1.9)" stroke-width="3.2">${slice('#C97B2A', '#F2B56B', MOON_MELT)}</g><g fill="#FFE066" stroke-width="3.5">${star(196, 40, 1.1)}${star(40, 62, 0.8)}</g>`)],
  'moon-cheese': ['0 0 64 64', 'Moon cheese', `${G3}<circle cx="31" cy="34" r="24" fill="#FFF1A6"/><path d="M42 13Q62 30 48 52Q40 58 31 58Q52 40 42 13Z" fill="#E8D174" stroke-width="0"/><circle cx="31" cy="34" r="24" fill="none"/>
<g fill="#D9BC4E" stroke-width="2.5"><ellipse cx="22" cy="28" rx="6" ry="5"/><ellipse cx="38" cy="42" rx="7" ry="5.5"/><ellipse cx="24" cy="46" rx="3.5" ry="3"/><ellipse cx="38" cy="22" rx="3" ry="2.5"/></g><path d="M12 30Q14 20 22 15" fill="none" stroke="#fff" stroke-width="3"/><g fill="#FFE066" stroke-width="2.5">${star(54, 12, 0.7)}</g></g>`],
  bread: ['0 0 64 64', 'Bread', `${G3}${slice('#E0A458', '#FFF6E0')}<path d="${SLICE_OUT}" fill="none"/><path d="M26 30q4-4 8 0M34 40q4-4 8 0" fill="none" stroke="#F2D9A0" stroke-width="3"/></g>`],
  'golden-spoon': ['0 0 96 96', 'The Golden Spoon', `${G4U}<path d="M42 46H54L53 84Q48 92 43 84Z" fill="#FFC93C"/><path d="M50 48H54L53 84Q51 88 48 88Q52 70 50 48Z" fill="#E0A21F" stroke-width="0"/><path d="M42 46H54L53 84Q48 92 43 84Z" fill="none"/>
<ellipse cx="48" cy="28" rx="19" ry="23" fill="#FFC93C"/><path d="M56 7Q69 18 67 32Q64 46 54 50Q62 30 56 7Z" fill="#E0A21F" stroke-width="0"/><ellipse cx="48" cy="28" rx="19" ry="23" fill="none"/><path d="M37 28Q36 17 45 12" fill="none" stroke="#FFF3B0" stroke-width="4.5"/>
<path d="M48 58l-17-10v20zM48 58l17-10v20z" fill="#FF5E5E"/><circle cx="48" cy="58" r="5" fill="#D9534F" stroke-width="3.5"/>
<g fill="#FFE066" stroke-width="3">${star(14, 22, 0.9)}${star(82, 14, 0.7)}${star(84, 78, 0.8)}${star(12, 78, 0.6)}</g></g>`],
  heart: ['0 0 64 64', 'A full heart', `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><g fill="#EF476F">${heart(32, 31, 1.5)}</g><path d="M15 26Q15 17 23 15" fill="none" stroke="#FFB5C8" stroke-width="4.5"/></g>`],
  'heart-empty': ['0 0 64 64', 'An empty heart', `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" fill="#fff">${heart(32, 31, 1.5)}</g>`],
  arrow: ['0 0 64 64', 'An arrow pointing down', `<g stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"><path d="M21 5H43V30H58L32 60L6 30H21Z" fill="#FFC93C"/><path d="M36 7H41V32H53L33 55Q42 40 36 32Z" fill="#E0A21F" stroke-width="0"/><path d="M21 5H43V30H58L32 60L6 30H21Z" fill="none"/></g>`],
  'gift-ella': ['0 0 64 64', 'A daisy, a present from Ella', `${G3}<path d="M32 60V34" fill="none" stroke="#2E9E55" stroke-width="5"/><path d="M32 50Q44 40 50 48Q42 56 32 50Z" fill="#5FBF5A"/>
<g fill="#fff">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="32" cy="10" rx="6" ry="9.5" transform="rotate(${a} 32 24)"/>`).join('')}</g><circle cx="32" cy="24" r="8" fill="#FFC93C"/></g>`],
  'gift-bella': ['0 0 64 64', 'A name badge, a present from Bella', `${G3}<rect x="6" y="16" width="52" height="38" rx="6" fill="#fff"/><path d="M6 30V22a6 6 0 0 1 6-6H52a6 6 0 0 1 6 6V30Z" fill="#4FA3E6"/><text x="32" y="28" text-anchor="middle" font-family="${FONT_BIG}" font-size="11" letter-spacing="1" fill="#fff" stroke-width="0">HELLO</text>
<text x="32" y="48" text-anchor="middle" font-family="${FONT_HAND}" font-size="17" fill="${INK}" stroke-width="0">Bella</text><circle cx="32" cy="10" r="4.5" fill="#FFC93C"/></g>`],
  'gift-fife': ['0 0 64 64', 'A tiny bow, a present from Fife', `${G3}<path d="M28 36l-8 20h10l2-12 2 12h10l-8-20z" fill="#E86A93"/><path d="M32 32l-25-15v30zM32 32l25-15v30z" fill="#FF8FB1"/><path d="M46 26l9-5v22l-9-5Q50 32 46 26Z" fill="#E86A93" stroke-width="0"/><path d="M32 32l25-15v30z" fill="none"/><circle cx="32" cy="32" r="7.5" fill="#FF5E8A"/></g>`],
  'gift-twinkle': ['0 0 64 64', 'A paper crown, a present from Twinkle', `${G3}<path d="M10 52L6 18l13 12 13-18 13 18 13-12-4 34z" fill="#FFC93C"/><path d="M48 32l10-14-4 34H46Q50 42 48 32Z" fill="#E0A21F" stroke-width="0"/><path d="M10 52L6 18l13 12 13-18 13 18 13-12-4 34z" fill="none"/>
<path d="M11 43H53" fill="none" stroke-width="2.5" stroke-dasharray="4 5"/><circle cx="32" cy="34" r="4.5" fill="#FF5E8A" stroke-width="2.5"/><circle cx="19" cy="38" r="3" fill="#7BE0C3" stroke-width="2.5"/><circle cx="45" cy="38" r="3" fill="#B79BFF" stroke-width="2.5"/></g>`],
  'gift-ghuy': ['0 0 64 64', 'A zigzag scarf, a present from Ghuy', `${G3}<path d="M36 30h16v26l-4-4-4 4-4-4-4 4z" fill="#EB8527"/><path d="M8 16Q32 4 56 16V30Q32 42 8 30Z" fill="#FFA94D"/><path d="M12 24l7-6 7 6 6-6 6 6 7-6 7 6" fill="none" stroke="#FFE066" stroke-width="4.5"/><path d="M39 44l5-4 5 4" fill="none" stroke="#FFE066" stroke-width="4"/><path d="M8 16Q32 4 56 16V30Q32 42 8 30Z" fill="none"/></g>`],
  'gift-gege': ['0 0 64 64', 'A watermelon slice, a present from Gege', `${G3}<path d="M4 20H60Q60 56 32 56Q4 56 4 20Z" fill="#3FB56B"/><path d="M10 21H54Q53 49 32 49Q11 49 10 21Z" fill="#fff" stroke-width="0"/><path d="M13 21H51Q50 46 32 46Q14 46 13 21Z" fill="#FC6C85" stroke-width="0"/><path d="M4 20H60Q60 56 32 56Q4 56 4 20Z" fill="none"/>
<g fill="${INK}" stroke-width="0"><ellipse cx="23" cy="29" rx="2.5" ry="4"/><ellipse cx="32" cy="36" rx="2.5" ry="4"/><ellipse cx="41" cy="29" rx="2.5" ry="4"/></g></g>`],
  'gift-moon': ['0 0 64 64', 'A moon rock, a present from the moon monster', `${G3}<path d="M8 46Q4 30 16 24Q22 10 38 14Q56 16 56 34Q60 50 46 56H20Q10 56 8 46Z" fill="#C5C9DB"/><path d="M44 16Q56 20 56 34Q60 50 46 55H36Q52 40 44 16Z" fill="#A9AEC6" stroke-width="0"/><path d="M8 46Q4 30 16 24Q22 10 38 14Q56 16 56 34Q60 50 46 56H20Q10 56 8 46Z" fill="none"/>
<g fill="#A9AEC6" stroke-width="2.5"><ellipse cx="22" cy="36" rx="6" ry="4.5"/><ellipse cx="36" cy="26" rx="4.5" ry="3.5"/><ellipse cx="34" cy="46" rx="4" ry="3"/></g><g fill="#FFE066" stroke-width="2.5">${star(52, 10, 0.75)}</g></g>`],
  cart: ['216 158 248 296', 'A food cart', G6 + CART + '</g>'],
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
  coin: ['0 0 40 40', 'Coin', `<circle cx="20" cy="20" r="17" fill="#FFC93C" stroke="${INK}" stroke-width="3.5"/><text x="20" y="28" text-anchor="middle" font-family="'Bangers', 'Baloo 2', sans-serif" font-weight="800" font-size="22" fill="${INK}">$</text>`],
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

const G4 = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">`;
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
  bubbles: ['0 0 110 170', 'A bubble machine', `${G4}${bubble(30, 70, 13, 0)}${bubble(74, 46, 17, 0.8)}${bubble(52, 18, 10, 1.6)}${bubble(90, 86, 8, 0.4)}<path d="M38 104h34l-6 16H44z" fill="#FFC93C"/><rect x="14" y="118" width="82" height="46" rx="12" fill="#6EC6FF"/><circle cx="38" cy="141" r="9" fill="#FF5E8A" stroke-width="3"/><path d="M58 134h26M58 148h26" fill="none" stroke="#fff" stroke-width="4"/></g>`],
};
export function decor(id) {
  const [viewBox, label, body] = DECOR_ART[id];
  return svg(viewBox, label, body);
}

/* ---------- The farm: things you tap to get an ingredient ---------- */

const SRC_SHADOW = `<ellipse cx="120" cy="187" rx="98" ry="9" fill="${INK}" stroke-width="0" opacity=".13"/>`;
const shake = (x, y, flip = 1) => `<path d="M${x} ${y}l${-14 * flip}-8M${x - 2 * flip} ${y + 20}h${-16 * flip}M${x} ${y + 40}l${-14 * flip} 8" fill="none" stroke-width="5"/>`;
const falling = (x, y, art) => `<path d="M${x - 12} ${y - 34}v-16M${x} ${y - 38}v-20M${x + 12} ${y - 34}v-16" fill="none" stroke-width="4.5"/>${art(x, y)}`;

function cow(busy) {
  const mouth = busy
    ? `<ellipse cx="64" cy="110" rx="11" ry="9" fill="#7A2340" stroke-width="4"/><path d="M57 114Q64 108 71 114Q68 118 64 118Q60 118 57 114Z" fill="#FF7A9A" stroke-width="0"/>`
    : '<path d="M52 108Q64 119 76 108" fill="none" stroke-width="4.5"/>';
  const head = `<g${busy ? ' transform="rotate(-9 70 120)"' : ''}>
<ellipse cx="24" cy="60" rx="15" ry="9" transform="rotate(-24 24 60)" fill="#fff"/><ellipse cx="25" cy="60" rx="7" ry="4" transform="rotate(-24 25 60)" fill="#FFB5C8" stroke-width="0"/>
<ellipse cx="104" cy="60" rx="15" ry="9" transform="rotate(24 104 60)" fill="${INK}"/>
<path d="M42 42Q32 30 40 20Q50 28 52 38Z" fill="#FFF3B0" stroke-width="5"/><path d="M86 42Q96 30 88 20Q78 28 76 38Z" fill="#FFF3B0" stroke-width="5"/>
<path d="M30 70Q30 36 64 36Q98 36 98 70V92Q98 124 64 124Q30 124 30 92Z" fill="#fff"/>
<path d="M68 39Q95 40 95 70Q95 84 84 88Q66 78 68 39Z" fill="${INK}" stroke-width="0"/>
<path d="M30 70Q30 36 64 36Q98 36 98 70V92Q98 124 64 124Q30 124 30 92Z" fill="none"/>
<path d="M54 38Q58 26 64 34Q70 26 74 38Z" fill="${INK}" stroke-width="4"/>
<ellipse cx="64" cy="104" rx="30" ry="19" fill="#FFB5C8"/><g fill="${INK}" stroke-width="0"><ellipse cx="53" cy="97" rx="3" ry="4"/><ellipse cx="75" cy="97" rx="3" ry="4"/></g>${mouth}
<circle cx="48" cy="68" r="11" fill="#fff" stroke-width="5"/><circle cx="80" cy="68" r="11" fill="#fff" stroke-width="5"/>
<g stroke-width="0"><circle cx="50" cy="70" r="5" fill="${INK}"/><circle cx="82" cy="70" r="5" fill="${INK}"/><circle cx="52" cy="68" r="1.8" fill="#fff"/><circle cx="84" cy="68" r="1.8" fill="#fff"/></g>
<circle cx="36" cy="88" r="6" fill="#FF8FB1" stroke-width="0" opacity=".8"/>
<path d="M42 122Q64 134 86 122" fill="none" stroke-width="13"/><path d="M42 122Q64 134 86 122" fill="none" stroke="#FF5E5E" stroke-width="6"/>
<g${busy ? ' transform="rotate(16 64 130)"' : ''}><path d="M50 150Q56 145 56 138a8 8 0 0 1 16 0Q72 145 78 150Z" fill="#FFC93C" stroke-width="5"/><circle cx="64" cy="154" r="4.5" fill="#E0A21F" stroke-width="4"/></g></g>`;
  return `${G6}${SRC_SHADOW}<path d="M212 84Q234 94 226 124" fill="none"/><path d="M218 122q9-5 13 4q-2 13-11 11q-6-6-2-15z" fill="${INK}" stroke-width="4"/>
<g fill="#D9D3E6"><path d="M106 138V180H122V138ZM180 138V180H196V138Z"/></g>
<g fill="#fff"><path d="M84 138V182H102V138ZM154 138V182H172V138Z"/></g><path d="M82 184h22M152 184h22" fill="none" stroke-width="9"/><path d="M106 181h16M180 181h16" fill="none" stroke-width="7"/>
<path d="M134 144Q134 164 148 164Q162 164 162 144Z" fill="#FFB5C8" stroke-width="5"/>
<path d="M72 92Q72 62 104 62H184Q214 62 214 92V122Q214 150 186 150H100Q72 150 72 122Z" fill="#fff"/>
<path d="M76 126Q80 146 100 147H186Q206 146 210 128Q196 138 180 138H104Q88 138 76 126Z" fill="#D9D3E6" stroke-width="0"/>
<g fill="${INK}" stroke-width="0"><path d="M124 63H168Q174 90 152 96Q124 96 124 63Z"/><path d="M190 108Q208 104 211 122Q211 144 192 147Q176 132 190 108Z"/></g>
<path d="M72 92Q72 62 104 62H184Q214 62 214 92V122Q214 150 186 150H100Q72 150 72 122Z" fill="none"/>
${head}${busy ? `<path d="M14 100l-11-6M10 116H-2M14 132l-11 6" fill="none" stroke-width="5"/>${note(18, 30)}` : ''}</g>`;
}

function wheat(busy) {
  const stalk = (x, h, a) => `<g transform="translate(${x} 180) rotate(${a + (busy ? 8 : 0)})"><path d="M0 0V${-h}" fill="none" stroke="#C99A2E" stroke-width="5"/><path d="M0 ${-h * 0.4}q14-10 18-26" fill="none" stroke="#C99A2E" stroke-width="5"/>
<ellipse cx="0" cy="${-h - 22}" rx="10" ry="26" fill="#FFC93C" stroke-width="5"/><path d="M-7 ${-h - 30}L0 ${-h - 24}L7 ${-h - 30}M-8 ${-h - 16}L0 ${-h - 10}L8 ${-h - 16}M-5 ${-h - 42}L0 ${-h - 37}L5 ${-h - 42}" fill="none" stroke-width="3"/><path d="M0 ${-h - 48}v-12M-5 ${-h - 44}l-5-10M5 ${-h - 44}l5-10" fill="none" stroke-width="3"/></g>`;
  return `${G6}${SRC_SHADOW}${stalk(44, 78, -8)}${stalk(196, 76, 8)}${stalk(82, 100, -4)}${stalk(158, 98, 5)}${stalk(120, 112, 0)}${stalk(64, 60, -10)}${stalk(178, 58, 10)}${stalk(102, 70, -3)}${stalk(140, 68, 4)}
<path d="M22 186Q120 160 218 186Z" fill="#A0673A"/><path d="M60 178q8-6 16 0M110 174q8-6 16 0M160 178q8-6 16 0" fill="none" stroke="#7D4E2A" stroke-width="4"/>${busy ? shake(26, 60) + shake(226, 70, -1) : ''}</g>`;
}

const tomatoAt = (x, y) => `<circle cx="${x}" cy="${y}" r="14" fill="#EF476F" stroke-width="5"/><path d="M${x - 8} ${y - 11}q8 6 16 0q-4-5-8-7q-4 2-8 7z" fill="#3FB56B" stroke-width="3"/><path d="M${x - 8} ${y + 2}q0-6 5-8" fill="none" stroke="#FFB5C8" stroke-width="3"/>`;
function vines(busy) {
  return `${G6}${SRC_SHADOW}<path d="M120 184V12" fill="none" stroke-width="14"/><path d="M120 184V12" fill="none" stroke="#A0673A" stroke-width="6"/>
<g${busy ? ' transform="rotate(5 120 184)"' : ''}><path d="M48 152Q22 114 60 98Q46 54 96 56Q118 22 150 52Q196 46 186 98Q218 118 192 154Q172 184 120 174Q68 186 48 152Z" fill="#3FA85A"/>
<path d="M150 54Q194 48 184 98Q214 118 190 152Q176 174 150 176Q196 124 150 54Z" fill="#2E8747" stroke-width="0"/>
<path d="M60 84q10-10 20 0M98 72q10-10 20 0M54 128q10-10 20 0M92 162q10-10 20 0" fill="none" stroke="#7BCB6B" stroke-width="5"/>
<path d="M48 152Q22 114 60 98Q46 54 96 56Q118 22 150 52Q196 46 186 98Q218 118 192 154Q172 184 120 174Q68 186 48 152Z" fill="none"/>
${tomatoAt(84, 112)}${tomatoAt(150, 92)}${tomatoAt(126, 142)}${busy ? '' : tomatoAt(170, 138)}</g>
${busy ? falling(214, 160, tomatoAt) + shake(30, 70) : ''}</g>`;
}

const FRUITS = {
  'orange-tree': ['An orange tree', '#3FA85A', '#2E8747', (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="#FF9F1C" stroke-width="5"/><path d="M${x - 7} ${y - 2}q1-6 6-7" fill="none" stroke="#FFD08A" stroke-width="3"/>`],
  'lemon-tree': ['A lemon tree', '#5FBF5A', '#3FA85A', (x, y) => `<path d="M${x - 16} ${y + 2}Q${x - 10} ${y - 12} ${x} ${y - 11}Q${x + 10} ${y - 12} ${x + 16} ${y - 1}Q${x + 11} ${y + 12} ${x} ${y + 11}Q${x - 10} ${y + 12} ${x - 16} ${y + 2}Z" fill="#FFE066" stroke-width="5"/><path d="M${x - 8} ${y - 1}q2-5 7-5" fill="none" stroke="#FFF6B8" stroke-width="3"/>`],
  'mango-tree': ['A mango tree', '#2E9E55', '#1F7A3F', (x, y) => `<path d="M${x - 11} ${y + 4}Q${x - 14} ${y - 12} ${x - 2} ${y - 16}Q${x + 13} ${y - 16} ${x + 13} ${y + 2}Q${x + 12} ${y + 16} ${x} ${y + 17}Q${x - 10} ${y + 16} ${x - 11} ${y + 4}Z" fill="#FFB627" stroke-width="5"/><path d="M${x - 9} ${y + 4}Q${x - 10} ${y - 6} ${x - 3} ${y - 11}Q${x - 4} ${y + 2} ${x + 1} ${y + 11}Q${x - 7} ${y + 12} ${x - 9} ${y + 4}Z" fill="#EF6F47" stroke-width="0"/>`],
};
function fruitTree(id, busy) {
  const [, leaf, dark, fruit] = FRUITS[id];
  const spots = [[84, 62], [128, 40], [160, 80], [104, 104], [68, 100]];
  return `${G6}${SRC_SHADOW}<path d="M106 186Q112 150 108 124H132Q128 150 134 186Z" fill="#A0673A"/><path d="M122 126H131Q127 150 133 184H122Q124 150 122 126Z" fill="#7D4E2A" stroke-width="0"/><path d="M106 186Q112 150 108 124H132Q128 150 134 186Z" fill="none"/>
<g${busy ? ' transform="rotate(6 120 150)"' : ''}><circle cx="120" cy="76" r="68" fill="${leaf}"/><path d="M144 14Q196 52 170 124Q150 140 128 142Q178 90 144 14Z" fill="${dark}" stroke-width="0"/>
<path d="M66 70Q68 36 96 26" fill="none" stroke="#B9E08A" stroke-width="7"/><circle cx="120" cy="76" r="68" fill="none"/>
${spots.slice(0, busy ? 4 : 5).map(([x, y]) => fruit(x, y)).join('')}</g>${busy ? falling(210, 150, fruit) + shake(34, 50) + shake(214, 40, -1) : ''}</g>`;
}

const leafAt = (x, y, a, c) => `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0Q-12 -14 0 -30Q12 -14 0 0Z" fill="${c}" stroke-width="4"/>`;
const BUSHES = {
  'berry-bush': ['A berry bush', '#3FA85A', '#2E8747', '#7BCB6B',
    (x, y) => `<path d="M${x} ${y + 15}Q${x - 15} ${y + 3} ${x - 12} ${y - 7}Q${x - 6} ${y - 14} ${x} ${y - 9}Q${x + 6} ${y - 14} ${x + 12} ${y - 7}Q${x + 15} ${y + 3} ${x} ${y + 15}Z" fill="#EF476F" stroke-width="5"/><path d="M${x - 8} ${y - 9}Q${x} ${y - 3} ${x + 8} ${y - 9}Q${x + 4} ${y - 15} ${x} ${y - 16}Q${x - 4} ${y - 15} ${x - 8} ${y - 9}Z" fill="#3FB56B" stroke-width="3"/>`,
    [[70, 126], [118, 108], [166, 124], [96, 152], [146, 156]]],
  'tea-bush': ['A tea bush', '#2E9E55', '#1F7A3F', '#5FBF5A',
    (x, y) => leafAt(x - 5, y + 12, -24, '#B5D96A') + leafAt(x + 5, y + 12, 24, '#B5D96A'),
    [[62, 100], [100, 84], [140, 84], [178, 100], [120, 128]]],
  'coffee-bush': ['A coffee bush', '#2E8747', '#1F6B36', '#5FBF5A',
    (x, y) => `<g fill="#E0312E" stroke-width="4"><circle cx="${x - 8}" cy="${y + 2}" r="8"/><circle cx="${x + 8}" cy="${y + 2}" r="8"/><circle cx="${x}" cy="${y - 9}" r="8"/></g><path d="M${x - 11} ${y}q1-4 4-5M${x + 5} ${y}q1-4 4-5" fill="none" stroke="#FFB5C8" stroke-width="2.5"/>`,
    [[72, 122], [120, 104], [168, 122], [98, 154], [146, 154]]],
};
function bush(id, busy) {
  const [, leaf, dark, light, thing, spots] = BUSHES[id];
  const tea = id === 'tea-bush';
  const shape = tea
    ? 'M26 184Q10 150 32 128Q36 92 78 92H162Q204 92 208 128Q230 150 214 184Z'
    : 'M28 184Q6 146 40 126Q34 86 80 90Q98 58 132 78Q168 60 180 98Q220 102 206 142Q230 168 212 184Z';
  const shade = tea ? 'M170 93Q204 96 208 128Q228 150 213 182H184Q204 140 170 93Z' : 'M170 80Q178 86 180 98Q220 102 206 142Q228 168 211 182H180Q212 136 170 80Z';
  return `${G6}${SRC_SHADOW}<g${busy ? ' transform="rotate(-4 120 184)"' : ''}><path d="${shape}" fill="${leaf}"/><path d="${shade}" fill="${dark}" stroke-width="0"/>
<path d="M44 150q10-10 20 0M76 172q10-10 20 0M150 132q10-10 20 0M124 172q10-10 20 0" fill="none" stroke="${light}" stroke-width="5"/><path d="${shape}" fill="none"/>
${spots.slice(0, busy ? 4 : 5).map(([x, y]) => thing(x, y)).join('')}</g>${busy ? falling(120, 62, thing) + shake(22, 96) + shake(222, 100, -1) : ''}</g>`;
}

const FISH = 'M6 32Q26 10 46 30Q54 22 60 20Q57 32 60 46Q54 42 46 36Q26 54 6 32Z';
function pond(busy) {
  const reed = (x, h) => `<path d="M${x} 150V${150 - h}" fill="none" stroke-width="5"/><rect x="${x - 6}" y="${150 - h - 4}" width="12" height="30" rx="6" fill="#A0673A" stroke-width="4.5"/>`;
  const fish = busy
    ? `<g transform="translate(86 14) rotate(-28 32 32) scale(1.25)"><path d="${FISH}" fill="#FF8A73" stroke-width="4.5"/><path d="M30 24Q35 32 30 40" fill="none" stroke-width="3"/><circle cx="18" cy="29" r="3" fill="${INK}" stroke-width="0"/><path d="M12 36q5 3 9 0" fill="none" stroke-width="2.5"/></g>
<path d="M84 128L70 96L96 110L104 80L122 106L140 78L146 110L172 96L158 128Z" fill="#fff" stroke-width="5"/><g fill="#8FD3FF" stroke-width="4"><path d="M54 82q8 12 0 17q-8-5 0-17z"/><path d="M190 76q8 12 0 17q-8-5 0-17z"/><path d="M176 40q6 9 0 13q-6-4 0-13z"/></g>`
    : `<g transform="translate(92 106) scale(.8)"><path d="${FISH}" fill="#FF8A73" stroke-width="5"/><circle cx="18" cy="29" r="3.5" fill="${INK}" stroke-width="0"/></g><path d="M150 112q-4-10 4-16M160 116q0-8 8-10" fill="none" stroke="#fff" stroke-width="4"/>`;
  return `${G6}<ellipse cx="120" cy="134" rx="112" ry="56" fill="#F2D9A6"/><ellipse cx="120" cy="132" rx="96" ry="44" fill="#4FB3F0"/>
<path d="M150 96Q204 104 208 136Q200 160 160 170Q196 140 150 96Z" fill="#3A8FCC" stroke-width="0" opacity=".6"/><ellipse cx="120" cy="132" rx="96" ry="44" fill="none"/>
<path d="M48 126q12-9 24 0M70 156q12-9 24 0M150 150q12-9 24 0" fill="none" stroke="#fff" stroke-width="5"/>
${reed(30, 62)}${reed(46, 84)}${reed(60, 50)}<ellipse cx="184" cy="150" rx="22" ry="10" fill="#5FBF5A" stroke-width="5"/><circle cx="190" cy="142" r="8" fill="#FF8FB1" stroke-width="4"/>${fish}</g>`;
}

function pantryCart(busy) {
  const jar = (x, y, h, c) => `<rect x="${x}" y="${y}" width="22" height="${h}" rx="5" fill="${c}" stroke-width="5"/><rect x="${x - 2}" y="${y - 8}" width="26" height="10" rx="3" fill="#A0673A" stroke-width="4"/>`;
  return `${G6}${SRC_SHADOW}<path d="M56 100V54M184 100V54" fill="none"/><path d="M198 112h26V94" fill="none"/><circle cx="224" cy="90" r="7" fill="#FF5E5E" stroke-width="5"/>
${jar(62, 70, 30, '#FF8FB1')}${jar(90, 64, 36, '#7BE0C3')}<path d="M118 100Q110 74 130 74H152Q170 74 164 100Z" fill="#E0A458" stroke-width="5"/><path d="M128 82l4 8M140 80l4 8M152 82l4 8" fill="none" stroke="#C4873E" stroke-width="3.5"/>
<rect x="168" y="68" width="14" height="32" fill="#FFE066" stroke-width="5"/>
<path d="M32 58H208L192 22H48Z" fill="#4F8FE0"/><path d="M84 22l-8 36M120 22v36M156 22l8 36" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="butt"/><path d="M32 58H208L192 22H48Z" fill="none"/>
<rect x="42" y="98" width="156" height="66" rx="6" fill="#E0A458"/><path d="M170 101H195V161H170Q178 130 170 101Z" fill="#C4873E" stroke-width="0"/><rect x="42" y="98" width="156" height="66" rx="6" fill="none"/>
<path d="M44 130H196" fill="none" stroke-width="4.5"/><g fill="#FFC93C" stroke-width="4"><circle cx="120" cy="114" r="5"/><circle cx="120" cy="146" r="5"/></g>
<circle cx="76" cy="168" r="20" fill="#fff"/><circle cx="76" cy="168" r="5" fill="${INK}"/><circle cx="164" cy="168" r="20" fill="#fff"/><circle cx="164" cy="168" r="5" fill="${INK}"/>
<path d="M24 58V70" fill="none" stroke-width="4.5"/><g${busy ? ' transform="rotate(24 24 70)"' : ''}><path d="M10 92Q16 86 16 80a8 8 0 0 1 16 0Q32 86 38 92Z" fill="#FFC93C" stroke-width="5"/><circle cx="24" cy="96" r="4.5" fill="#E0A21F" stroke-width="4"/></g>
${busy ? `<path d="M4 70l-2-10M-2 96h-1M44 74l8-8M46 96h10" fill="none" stroke-width="5"/>${note(214, 40)}` : ''}</g>`;
}

function cheeseCrater(busy) {
  const top = busy ? 62 : 80;
  return `${G6}${SRC_SHADOW}<path d="M12 186Q20 126 68 112Q120 96 172 112Q220 126 228 186Z" fill="#C5C9DB"/><path d="M172 112Q220 126 228 186H190Q206 144 172 112Z" fill="#A9AEC6" stroke-width="0"/><path d="M12 186Q20 126 68 112Q120 96 172 112Q220 126 228 186Z" fill="none"/>
<ellipse cx="120" cy="120" rx="64" ry="20" fill="#A9AEC6"/>
<path d="M72 122Q78 ${top} 120 ${top}Q162 ${top} 168 122Q120 138 72 122Z" fill="#FFF1A6"/><path d="M140 ${top + 4}Q162 ${top + 10} 166 121Q156 126 144 128Q156 108 140 ${top + 4}Z" fill="#E8D174" stroke-width="0"/><path d="M72 122Q78 ${top} 120 ${top}Q162 ${top} 168 122Q120 138 72 122Z" fill="none"/>
<g fill="#D9BC4E" stroke-width="3.5"><ellipse cx="100" cy="108" rx="8" ry="6"/><ellipse cx="130" cy="${top + 18}" rx="6" ry="4.5"/><ellipse cx="124" cy="120" rx="5" ry="3.5"/></g><path d="M86 ${top + 22}Q90 ${top + 10} 102 ${top + 6}" fill="none" stroke="#fff" stroke-width="5"/>
<ellipse cx="46" cy="160" rx="14" ry="5" fill="#A9AEC6" stroke-width="4"/><ellipse cx="170" cy="164" rx="18" ry="6" fill="#8F95B2" stroke-width="4"/>
${busy ? `<g fill="#FFF1A6" stroke-width="4"><circle cx="76" cy="62" r="10"/><circle cx="166" cy="52" r="8"/><circle cx="120" cy="34" r="12"/></g>${twinkles([[44, 84, 1.2], [198, 88, 1.1], [150, 18, 0.9]])}` : twinkles([[196, 96, 1]])}</g>`;
}

const SOURCE_ART = {
  cow: ['A friendly black and white cow with a bell', cow],
  wheat: ['A patch of golden wheat', wheat],
  vines: ['Tomato vines', vines],
  'orange-tree': [FRUITS['orange-tree'][0], b => fruitTree('orange-tree', b)],
  'lemon-tree': [FRUITS['lemon-tree'][0], b => fruitTree('lemon-tree', b)],
  'mango-tree': [FRUITS['mango-tree'][0], b => fruitTree('mango-tree', b)],
  'berry-bush': [BUSHES['berry-bush'][0], b => bush('berry-bush', b)],
  'tea-bush': [BUSHES['tea-bush'][0], b => bush('tea-bush', b)],
  'coffee-bush': [BUSHES['coffee-bush'][0], b => bush('coffee-bush', b)],
  pond: ['A pond with a fish', pond],
  cart: ['A pantry cart with jars, bread and a bell', pantryCart],
  crater: ['A moon crater full of cheese', cheeseCrater],
};
const BUSY_WORDS = {
  cow: 'mooing', wheat: 'swishing', vines: 'shaking, a tomato drops', pond: 'splashing, a fish jumps', cart: 'ringing its bell', crater: 'bubbling',
};
export const SOURCE_IDS = Object.keys(SOURCE_ART);
export const hasSource = id => id in SOURCE_ART;

// A farm source, about 6 : 5, readable at 220 px. state: 'idle' or 'busy' (the moment after a tap).
export function source(id, state = 'idle') {
  if (!hasSource(id)) id = 'cart';
  const busy = state === 'busy';
  const [label, draw] = SOURCE_ART[id];
  return svg('-4 0 248 200', busy ? `${label}, ${BUSY_WORDS[id] ?? 'shaking, something drops'}` : label, draw(busy));
}
