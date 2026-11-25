// The farm (it used to be the magic garden): tap a source and it comes alive.
// The cow moos and a milk bottle hops into the basket; the tree shakes and an
// orange drops. One tap, one thing. Sometimes a mystery sparkle grows too, and
// on a golden order one source glows gold and its first product is golden.
// The rules (which sources show, what each gives) are in js/farm.js.

import { FOODS } from '../data.js';
import { sparkleAppears } from '../orders.js';
import { SOURCES, sourceOf, pickSources, goldenSource } from '../farm.js';
import { placeOf } from '../chapters.js';
import { item, chef, farm, source, sfx as drawnSfx } from '../art.js';
import { sfx } from '../audio.js';
import { teaching, coach, uncoach } from './coach.js';

const calm = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ---------- Where things stand (pure, tested in tests/garden.test.js) ---------- */

export const STAGE = { w: 1024, h: 768 };
// Every source is drawn this big (art.js draws them all in a 248 x 200 box).
export const SOURCE_SIZE = { w: 220, h: 177 };

// Five places a source can stand: three along the fence, two on the grass in
// front. Each is the top left corner of a SOURCE_SIZE box.
export const SLOTS = {
  'back-left': { x: 36, y: 334 },
  'back-middle': { x: 402, y: 334 },
  'back-right': { x: 768, y: 334 },
  'front-left': { x: 130, y: 556 },
  'front-right': { x: 674, y: 556 },
};
const SLOT_ORDER = Object.keys(SLOTS);

// Every source has a home, so the farm does not jump about between visits.
// Some homes are shared, but never by two sources that one recipe needs.
export const HOME = {
  cow: 'front-left',
  wheat: 'back-middle',
  vines: 'back-right',
  'orange-tree': 'back-left',
  'lemon-tree': 'back-left',
  'mango-tree': 'back-middle',
  'berry-bush': 'back-left',
  'tea-bush': 'back-middle',
  'coffee-bush': 'back-right',
  pond: 'front-right',
  cart: 'front-right',
  crater: 'back-middle',
};

// Parts of the stage a source must keep clear of: { x, y, w, h } boxes.
export const CHEF_BOX = { x: 437, y: 530, w: 150, h: 225 };
export const KEEP_CLEAR = {
  caption: { x: 20, y: 14, w: 330, h: 60 },
  tasks: { x: 24, y: 84, w: 330, h: 196 },
  kitchenButton: { x: 700, y: 20, w: 300, h: 90 },
  sound: { x: 10, y: 676, w: 90, h: 86 },
  chef: CHEF_BOX,
};
// Where picked things fly to: the basket in the chef's hand.
export const BASKET = { x: CHEF_BOX.x + CHEF_BOX.w * 0.84, y: CHEF_BOX.y + CHEF_BOX.h * 0.78 };
const SPARKLE_SPOT = [702, 404];

export const boxOf = slot => ({ ...SLOTS[slot], ...SOURCE_SIZE });
export const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// Which slot each source stands in on this visit: source id -> slot name.
// The sources the order needs take their homes first (they never share one);
// then the others take theirs, or the next free slot. At most five are placed.
export function placeSources(ids, needed = []) {
  const known = [...new Set(ids)].filter(id => Object.hasOwn(HOME, id));
  const order = [...known.filter(id => needed.includes(id)), ...known.filter(id => !needed.includes(id))];
  const taken = new Set();
  const spots = {};
  for (const id of order) {
    const slot = [HOME[id], ...SLOT_ORDER].find(s => !taken.has(s));
    if (!slot) break;
    taken.add(slot);
    spots[id] = slot;
  }
  return spots;
}

// What one tap on a source gives: the ingredient id the order still needs
// from it, or null (a source the order does not need, or one that has given
// everything). `basket` is ingredient id -> how many are picked already.
export function tapGives(sourceId, needs, basket = {}) {
  const need = needs.find(n => sourceOf(n.id) === sourceId);
  return need && (basket[need.id] ?? 0) < need.count ? need.id : null;
}

/* ---------- The screen ---------- */

export function render(stage, ctx, go) {
  if (!ctx.order) { go('place'); return; }
  const needs = FOODS[ctx.order.foodId].ingredients;
  ctx.basket = {};
  ctx.hasSparkle = false;
  ctx.golden = false;

  const teach = teaching(ctx);
  const onMoon = placeOf(ctx.game) === 'moon';
  const needed = [...new Set(needs.map(n => sourceOf(n.id)).filter(Boolean))];
  const spots = placeSources(pickSources(needs, ctx.game.owned), needed);
  const gold = ctx.order.surprise?.kind === 'golden' ? goldenSource(needs) : null;
  const sparkle = !teach && sparkleAppears();
  let goldGiven = false;

  const sourcesHtml = Object.entries(spots).map(([id, slot]) => {
    const { x, y } = SLOTS[slot];
    const isGold = id === gold;
    return `<button class="f-src${isGold ? ' is-gold' : ''}" data-src="${id}" aria-label="${SOURCES[id].name}" style="left:${x}px;top:${y}px">
<span class="f-glow"></span><span class="f-pic">${source(id, 'idle')}</span>${
  isGold ? `<span class="pic f-twinkle">${item('twinkle')}</span><span class="pic f-twinkle f-twinkle2">${item('twinkle')}</span>` : ''}</button>`;
  }).join('');
  const sparkleHtml = sparkle
    ? `<button class="g-item g-sparkle floaty" data-sparkle aria-label="A mystery sparkle" style="left:${SPARKLE_SPOT[0]}px;top:${SPARKLE_SPOT[1]}px"><span class="pic">${item('sparkle')}</span></button>
<div class="g-label f-label" data-sparkle-label>Mystery sparkle!</div>` : '';

  stage.innerHTML = `<div class="f-scene fill">${farm(onMoon ? 'moon' : 'farm')}</div>
${sourcesHtml}${sparkleHtml}
<div class="f-chef fill" style="left:${CHEF_BOX.x}px;top:${CHEF_BOX.y}px;width:${CHEF_BOX.w}px;height:${CHEF_BOX.h}px">${chef('basket', ctx.chefLook?.() ?? 'chef-a')}</div>
<div class="pl-frame" aria-hidden="true"></div>
<div class="cm-caption pl-caption">Meanwhile, on the farm...</div>
<div class="g-task" aria-live="polite"></div>
<button class="btn pl-btn g-back" disabled>To the kitchen!</button>`;

  const task = stage.querySelector('.g-task');
  const back = stage.querySelector('.g-back');
  const chefEl = stage.querySelector('.f-chef');
  const have = id => ctx.basket[id] ?? 0;
  const allPicked = () => needs.every(n => have(n.id) >= n.count);

  function refresh() {
    task.innerHTML = needs.map(n => {
      const circles = Array.from({ length: n.count }, (_, i) => i < have(n.id)
        ? `<span class="g-dot full"><span class="pic">${item(n.id)}</span></span>`
        : '<span class="g-dot"></span>').join('');
      return `<div class="g-row"><span class="g-pick">Pick ${n.count} ${n.name}</span><span class="g-dots">${circles}</span></div>`;
    }).join('');
    const done = allPicked();
    back.disabled = !done;
    back.classList.toggle('hint', done);
    let firstGlowing = null;
    for (const b of stage.querySelectorAll('.f-src')) {
      const glowing = tapGives(b.dataset.src, needs, ctx.basket) !== null;
      b.classList.toggle('is-needed', glowing);
      if (glowing) firstGlowing ??= b;
    }
    if (teach) coach(stage, { step: 2, target: done ? back : firstGlowing, text: 'Tap!' });
  }

  function restart(el, name) {
    if (!el) return;
    el.classList.remove(name);
    void el.getBoundingClientRect(); // restart the animation
    el.classList.add(name);
  }

  // Fly a picture whose middle is at (x, y) into the chef's basket in a little
  // arc: a pop up out of the source, over, then down.
  function flyToBasket(el, x, y) {
    const dx = BASKET.x - x, dy = BASKET.y - y;
    if (!el.animate || calm()) { el.remove(); return; }
    el.animate([
      { transform: 'translate(-50%, -50%) scale(.3)', opacity: 1 },
      { transform: 'translate(-50%, calc(-50% - 46px)) scale(1.15)', opacity: 1, offset: 0.22 },
      { transform: `translate(calc(-50% + ${dx * 0.55}px), calc(-50% + ${Math.min(dy, 0) - 70}px)) scale(1.05)`, opacity: 1, offset: 0.6 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.45)`, opacity: 0.4 },
    ], { duration: 700, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(() => { el.remove(); restart(chefEl, 'f-catch'); }, 710);
  }

  // The source comes alive for half a second: its busy drawing, a bounce, its sound.
  const idleTimers = new Map();
  function comeAlive(b) {
    const id = b.dataset.src;
    const pic = b.querySelector('.f-pic');
    pic.innerHTML = source(id, 'busy');
    restart(b, 'f-bounce');
    sfx(SOURCES[id].sound);
    clearTimeout(idleTimers.get(id));
    idleTimers.set(id, setTimeout(() => {
      if (!pic.isConnected) return;
      pic.innerHTML = source(id, 'idle');
      b.classList.remove('f-bounce');
    }, 520));
  }

  stage.addEventListener('click', e => {
    const s = e.target.closest?.('[data-sparkle]');
    if (s && stage.contains(s)) {
      if (s.dataset.picked) return; // already on its way to the basket
      s.dataset.picked = '1';
      ctx.hasSparkle = true;
      sfx('twinkle');
      stage.querySelector('[data-sparkle-label]')?.remove();
      s.classList.remove('floaty');
      s.style.pointerEvents = 'none';
      s.style.margin = '0';
      s.style.transform = 'translate(-50%, -50%)';
      flyToBasket(s, SPARKLE_SPOT[0], SPARKLE_SPOT[1]);
      return;
    }
    const b = e.target.closest?.('.f-src');
    if (!b || !stage.contains(b)) return;
    const id = b.dataset.src;
    comeAlive(b);
    // One tap, one thing; and never more than the order needs, however fast the taps come.
    const ing = tapGives(id, needs, ctx.basket);
    if (!ing) return;
    ctx.basket[ing] = have(ing) + 1;
    const x = parseFloat(b.style.left) + SOURCE_SIZE.w / 2, y = parseFloat(b.style.top) + 40;
    const golden = id === gold && !goldGiven;
    const out = document.createElement('span');
    out.className = `pic f-out${golden ? ' is-gold' : ''}`;
    out.style.left = `${x}px`;
    out.style.top = `${y}px`;
    out.innerHTML = item(ing);
    stage.append(out);
    flyToBasket(out, x, y);
    sfx('pop');
    if (golden) {
      goldGiven = true;
      ctx.golden = true;
      b.classList.remove('is-gold');
      b.querySelectorAll('.f-twinkle').forEach(t => t.remove());
      sfx('golden');
      const word = document.createElement('span');
      word.className = 'pic g-goldword';
      word.style.left = `${Math.max(150, Math.min(STAGE.w - 150, x))}px`;
      word.style.top = `${y - 60}px`;
      word.innerHTML = drawnSfx('GOLDEN!', '#FFE066');
      stage.append(word);
      setTimeout(() => word.remove(), 1400);
    }
    refresh();
  });

  back.addEventListener('click', () => {
    if (back.disabled || !allPicked()) return;
    back.disabled = true; // one tap only
    uncoach(stage);
    go('kitchen');
  });
  refresh();
  if (sparkle) sfx('twinkle');
}
