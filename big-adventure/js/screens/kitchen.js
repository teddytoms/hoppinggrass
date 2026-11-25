// The kitchen: make the food step by step by dragging and tapping.
// A wrong move simply does not work: the thing glides back.
// The child's own chef stands beside the counter and cheers when the food is done.

import { FOODS } from '../data.js';
import { startRecipe, tryAction, currentStep } from '../recipe.js';
import { costOf } from '../economy.js';
import { item, food, chef } from '../art.js';
import { sfx } from '../audio.js';
import { releaseKind, canStart } from '../gesture.js';
import { teaching, coach, uncoach } from './coach.js';

// Kitchen things that are not picked in the garden but wait in the basket tray.
const EXTRAS = { 'orange-juice': ['ice', 'orange-slice'], tea: ['kettle'], boba: ['ice', 'straw'], cupcake: ['frosting'] };
// Tapping these makes the thing shake (a blender, a grinder, a sizzling pan).
const SHAKES = { Blend: 'blender', Grind: 'grinder', Cook: 'pan', Toast: 'moon-toast' };

const pickArt = (list, step) => list[Math.min(step, list.length - 1)];

// What is on the counter at each step. Positions are inside the 644 x 560 work area.
// The thing marked main is the food being made (the sparkle twinkles on it).
const SCENES = {
  'orange-juice': s => [
    { id: 'juicer', art: s === 1 ? 'juicer-full' : 'juicer-empty', x: 50, y: 250, w: 240, h: 207 },
    { id: 'glass', art: pickArt(['glass-empty', 'glass-empty', 'glass-juice', 'glass-juice-ice', 'glass-juice-done'], s), x: 410, y: 222, w: 168, h: 235, main: true },
  ],
  pizza: s => [
    { id: 'board', art: 'board', x: 30, y: 300, w: 290, h: 209, main: s === 0 },
    s >= 1 && s <= 3 && { id: 'base', art: pickArt(['', 'base-plain', 'base-tomato', 'base-cheese'], s), x: 70, y: 316, w: 172, h: 172, main: true },
    { id: 'oven', art: s >= 4 ? 'oven-on' : 'oven', x: 400, y: 196, w: 220, h: 244 },
    s >= 4 && { id: 'pizza', art: 'pizza-whole', x: 70, y: 316, w: 172, h: 172, main: true },
  ],
  'mango-lassi': s => [
    { id: 'blender', art: pickArt(['blender-empty', 'blender-empty', 'blender-mango', 'blender-milk', 'blender-empty'], s), x: 90, y: 180, w: 176, h: 277, main: s < 4 },
    { id: 'glass', art: s >= 4 ? 'glass-lassi' : 'glass-empty', x: 410, y: 222, w: 168, h: 235, main: s >= 4 },
  ],
  pie: s => [
    { id: 'board', art: 'board', x: 14, y: 330, w: 220, h: 158 },
    s === 1 && { id: 'crust', art: 'crust-rolled', x: 40, y: 338, w: 140, h: 140 },
    s < 4 && { id: 'dish', art: pickArt(['dish-empty', 'dish-empty', 'dish-crust', 'dish-berries'], s), x: 236, y: 296, w: 200, h: 156, main: true },
    { id: 'oven', art: s >= 4 ? 'oven-on' : 'oven', x: 446, y: 210, w: 184, h: 204 },
    s >= 4 && { id: 'pie', art: 'pie-whole', x: 236, y: 296, w: 200, h: 156, main: true },
  ],
  tea: s => [
    { id: 'teapot', art: pickArt(['teapot', 'teapot-leaves', 'teapot-full', 'teapot'], s), x: 40, y: 232, w: 260, h: 226, main: s < 3 },
    { id: 'cup', art: s >= 3 ? 'cup-tea' : 'cup-empty', x: 400, y: 290, w: 210, h: 168, main: s >= 3 },
  ],
  spaghetti: s => [
    { id: 'pot', art: s === 1 ? 'pot-pasta' : 'pot', x: 30, y: 250, w: 250, h: 208 },
    { id: 'plate', art: pickArt(['plate-empty', 'plate-empty', 'plate-pasta', 'plate-sauce', 'plate-spaghetti'], s), x: 350, y: 292, w: 260, h: 184, main: true },
  ],
  coffee: s => [
    { id: 'grinder', art: pickArt(['grinder', 'grinder-beans', 'grinder-ground', 'grinder'], s), x: 70, y: 200, w: 200, h: 257 },
    { id: 'mug', art: pickArt(['mug-empty', 'mug-empty', 'mug-empty', 'mug-coffee', 'mug-latte'], s), x: 400, y: 270, w: 210, h: 189, main: true },
  ],
  boba: s => [
    { id: 'cup', art: `bcup-${Math.min(s, 4)}`, x: 222, y: 170, w: 200, h: 292, main: true },
  ],
  cupcake: s => [
    s < 2 && { id: 'case', art: s === 1 ? 'case-batter' : 'case-empty', x: 90, y: 284, w: 180, h: 180, main: true },
    { id: 'oven', art: s >= 2 ? 'oven-on' : 'oven', x: 400, y: 196, w: 220, h: 244 },
    s >= 2 && { id: 'cupcake', art: pickArt(['cupcake-plain', 'cupcake-frosted', 'cupcake-done'], s - 2), x: 90, y: 284, w: 180, h: 180, main: true },
  ],
  salmon: s => [
    { id: 'pan', art: pickArt(['pan', 'pan-fish', 'pan-cooked', 'pan'], s), x: 20, y: 296, w: 300, h: 170 },
    { id: 'plate', art: pickArt(['plate-empty', 'plate-empty', 'plate-empty', 'plate-fish', 'plate-salmon'], s), x: 350, y: 292, w: 260, h: 184, main: true },
  ],
  // Bread in the pan, cheese on top, toast it (the pan becomes the toast to tap), finished on a plate.
  'moon-toast': s => [
    s < 3 && { id: 'pan', art: pickArt(['pan', 'pan-bread', 'pan-toast-raw'], s), x: 150, y: 270, w: 344, h: 195, main: true },
    s === 3 && { id: 'moon-toast', art: 'pan-toasting', x: 150, y: 270, w: 344, h: 195, main: true },
    s >= 4 && { id: 'moon-toast', art: 'toast-done', x: 182, y: 262, w: 280, h: 198, main: true },
  ],
};

export function render(stage, ctx, go) {
  if (!ctx.order) { go('place'); return; }
  const foodId = ctx.order.foodId;
  const recipe = FOODS[foodId];
  if (ctx.remake) {
    // After a "yuck": make the same food again, this time with no sparkle.
    ctx.remake = false;
    ctx.hasSparkle = false;
  }
  let progress = startRecipe(foodId);
  let sparkleInTray = ctx.hasSparkle;
  let sparkleAdded = false;
  let leaving = false;
  let fresh = null; // what the last move changed, so it can bounce: { step, id, shake }

  const look = ctx.chefLook?.() ?? 'chef-a';
  const teach = teaching(ctx);

  const trayable = [...recipe.ingredients.map(i => i.id), ...(EXTRAS[foodId] ?? [])];

  stage.innerHTML = `<div class="k-wrap${teach ? ' is-teaching' : ''}">
<div class="k-panel card">
  <div class="cm-caption pl-caption">Meanwhile, in the kitchen...</div>
  <div class="k-title"><span class="pic">${food(foodId)}</span><h1 class="baloo">${recipe.name}</h1></div>
  <ol class="k-steps"></ol>
  <div class="k-side"><div class="k-chef fill" aria-hidden="true">${chef('spoon', look, 'idle')}</div><div class="k-cost">Costs $${costOf(foodId, ctx.game)} to make</div></div>
</div>
<div class="k-right">
  <div class="k-work card"><div class="k-counter"></div><div class="k-things"></div><div class="k-label baloo" aria-live="polite"></div></div>
  <div class="k-tray card"><span class="k-tray-name baloo">Your basket</span><div class="k-tiles"></div><span class="k-tip"></span></div>
</div></div>`;

  const stepsEl = stage.querySelector('.k-steps');
  const thingsEl = stage.querySelector('.k-things');
  const tilesEl = stage.querySelector('.k-tiles');
  const labelEl = stage.querySelector('.k-label');
  const tipEl = stage.querySelector('.k-tip');
  const chefEl = stage.querySelector('.k-chef');

  function draw() {
    const step = currentStep(progress);
    const s = progress.stepIndex;

    stepsEl.innerHTML = recipe.steps.map((st, i) => {
      const state = i < s ? 'done' : i === s ? 'now' : 'later';
      const badge = i < s ? `<span class="pic k-num">${item('tick')}</span>` : `<span class="k-num k-circle">${i + 1}</span>`;
      return `<li class="k-step ${state}${fresh?.step === i ? ' just' : ''}">${badge}${st.label}</li>`;
    }).join('');
    labelEl.textContent = step ? step.label : 'Finished!';

    const things = SCENES[foodId](s).filter(Boolean);
    const main = things.find(t => t.main) ?? things.at(-1);
    const onCounter = new Set(things.map(t => t.id));
    thingsEl.innerHTML = things.map(t => {
      const isDrag = step?.drag === t.id;
      const hint = step && (isDrag || (step.tap === t.id));
      const target = step && step.onto === t.id;
      const lively = `${fresh?.id === t.id ? ' bump' : ''}${fresh?.shake === t.id ? ' shake-it' : ''}${t.art === 'oven-on' ? ' cooking' : ''}`;
      return `<div class="k-thing fill${hint ? ' hint' : ''}${target ? ' target' : ''}${lively}" data-id="${t.id}"${isDrag ? ' data-drag' : ''}
 style="left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px">${item(t.art)}${
  sparkleAdded && t === main ? `<span class="pic k-twinkle floaty">${item('twinkle')}</span>` : ''}</div>`;
    }).join('');

    // The basket tray holds whatever the steps still to come will need.
    const stillNeeded = new Set(recipe.steps.slice(s).flatMap(st => [st.drag, st.tap]));
    const tiles = trayable.filter(id => stillNeeded.has(id) && !onCounter.has(id)).map(id => {
      const count = ctx.basket[id] ?? 1;
      const art = id === 'mango' && s >= 1 ? 'mango-peeled' : id;
      const hint = step && (step.drag === id || step.tap === id);
      return `<div class="k-tile fill${hint ? ' hint' : ''}" data-id="${id}" data-drag>${item(art)}${count > 1 ? `<span class="k-count baloo">${count}</span>` : ''}</div>`;
    });
    if (sparkleInTray) tiles.push(`<div class="k-tile k-sparkle fill" data-id="sparkle" data-drag>${item('sparkle')}</div>`);
    tilesEl.innerHTML = tiles.join('');
    tipEl.textContent = sparkleInTray ? 'Add the sparkle if you dare!' : '';

    // Teaching: an arrow on the thing to drag or tap for this step.
    if (teach) {
      if (step) coach(stage, { step: 3, target: stage.querySelector('.k-tile.hint, .k-thing.hint'), text: step.drag ? 'Drag!' : 'Tap!' });
      else uncoach(stage);
    }
  }

  function finish() {
    if (leaving) return;
    leaving = true;
    ctx.hasSparkle = sparkleAdded; // a sparkle left in the basket is not in the food
    chefEl.innerHTML = chef('spoon', look, 'cheer');
    chefEl.classList.add('pl-jump');
    // A short look at the finished food, then on to choosing the price.
    setTimeout(() => go('price'), 900);
  }

  function act(action) {
    if (leaving) return false;
    const before = progress.stepIndex;
    const result = tryAction(progress, action);
    if (!result.ok) return false;
    progress = result.progress;
    sfx(foodId === 'orange-juice' && before === 0 ? 'squish' : 'ding');
    const done = recipe.steps[before];
    fresh = { step: before, id: done.onto ?? done.tap, shake: SHAKES[done.label] ?? null };
    if (done.label === 'Blend') fresh.id = 'glass';
    if (done.label === 'Toast') fresh.id = 'moon-toast';
    draw();
    fresh = null;
    if (progress.done) finish();
    return true;
  }

  function addSparkle() {
    sparkleInTray = false;
    sparkleAdded = true;
    sfx('twinkle');
    draw();
    thingsEl.querySelector('.k-twinkle')?.parentElement.classList.add('bump');
  }

  // The counter thing under a point on the screen (the top one wins).
  function thingAt(x, y, except) {
    const all = [...thingsEl.querySelectorAll('.k-thing')].reverse();
    return all.find(el => {
      if (el === except) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
  }

  let drag = null; // the thing being dragged right now

  function glideBack(el) {
    el.style.transition = 'transform .3s ease-out';
    el.style.transform = '';
    el.classList.remove('dragging');
    setTimeout(() => { el.style.transition = ''; }, 320);
  }

  stage.addEventListener('pointerdown', e => {
    const el = e.target.closest?.('.k-thing, .k-tile');
    if (!el || leaving || !canStart(drag)) return;
    e.preventDefault();
    // A finger that is only resting on something gives way to the new touch.
    if (drag) { glideBack(drag.el); drag = null; }
    drag = { el, id: el.dataset.id, pointer: e.pointerId, x: e.clientX, y: e.clientY, moved: false, far: 0, canMove: 'drag' in el.dataset };
    try { el.setPointerCapture(e.pointerId); } catch { /* the pointer has already gone */ }
  });

  stage.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const dx = (e.clientX - drag.x) / ctx.scale, dy = (e.clientY - drag.y) / ctx.scale;
    drag.far = Math.max(drag.far, Math.hypot(dx, dy));
    if (drag.far > 10) drag.moved = true;
    if (!drag.canMove || !drag.moved) return;
    drag.el.classList.add('dragging');
    drag.el.style.transition = '';
    drag.el.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
  });

  function drop(e, cancelled) {
    if (!drag || e.pointerId !== drag.pointer) return;
    const d = drag;
    drag = null;
    try { d.el.releasePointerCapture(d.pointer); } catch { /* already released */ }
    if (cancelled) { glideBack(d.el); return; }
    const r = d.el.getBoundingClientRect();
    const overSelf = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    const target = d.canMove ? thingAt(e.clientX, e.clientY, d.el) : null;
    const kind = releaseKind({ moved: d.moved, canMove: d.canMove, overSelf, hasTarget: !!target, distance: d.far });
    if (kind === 'tap') {
      if (!act({ tap: d.id })) glideBack(d.el);
    } else if (kind === 'drop') {
      if (d.id === 'sparkle') { addSparkle(); return; }
      if (!act({ drag: d.id, onto: target.dataset.id })) glideBack(d.el);
    } else if (kind === 'back') {
      glideBack(d.el);
    }
  }
  stage.addEventListener('pointerup', e => drop(e, false));
  stage.addEventListener('pointercancel', e => drop(e, true));
  // If the iPad takes the finger away without telling us, never stay stuck.
  stage.addEventListener('lostpointercapture', e => {
    if (drag && e.pointerId === drag.pointer) { glideBack(drag.el); drag = null; }
  });

  draw();
}
