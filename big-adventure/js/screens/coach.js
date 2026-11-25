// Teaching, inside the first real order: a small "1 2 3 4 5" strip at the top
// that fills in, and a bouncing arrow with a short label above the thing to tap.
// Nothing here can be tapped or blocks a tap. Styles are in css/adventure.css.
//
//   if (teaching(ctx)) coach(stage, { step: 2, target: '.the-cow', text: 'Tap!' });
//   uncoach(stage);

import { item, food, plate } from '../art.js';

// The five steps: the order, the farm, the kitchen, the price, the happy plate.
const STEPS = [
  { name: 'Order', pic: () => SPEECH },
  { name: 'Farm', pic: () => BASKET },
  { name: 'Cook', pic: () => item('pan') },
  { name: 'Sell', pic: () => item('coin') },
  { name: 'Happy plate', pic: () => plate(false) },
];
// An order bubble with an orange juice in it, in the same thick outline as js/art.js.
const SPEECH = `<svg viewBox="0 0 64 64" role="img" aria-label="An order"><path d="M8 6H56Q61 6 61 11V39Q61 44 56 44H30L14 59L18 44H8Q3 44 3 39V11Q3 6 8 6Z" fill="#fff" stroke="#1B1B1F" stroke-width="4" stroke-linejoin="round"/>${food('orange-juice').replace('<svg ', '<svg x="17" y="9" width="30" height="32" ')}</svg>`;

const BASKET = `<svg viewBox="0 0 64 64" role="img" aria-label="A basket"><g stroke="#1B1B1F" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M14 30Q32 -6 50 30" fill="none"/><circle cx="25" cy="27" r="9" fill="#FF9F1C"/><circle cx="40" cy="26" r="9" fill="#FF5E5E"/><path d="M6 30H58L51 58H13Z" fill="#E0A45A"/><path d="M10 40H54M22 31L25 57M32 31V57M42 31L39 57" fill="none" stroke-width="3"/></g></svg>`;

// True while the player is still on the very first order.
export function teaching(ctx) {
  return !ctx?.game?.taught;
}

function strip(step) {
  const n = Math.max(1, Math.min(STEPS.length, Math.round(Number(step)) || 1));
  const cells = STEPS.map((s, i) => {
    const state = i + 1 < n ? ' is-done' : i + 1 === n ? ' is-now' : '';
    return `<span class="coach-step${state}"><b>${i + 1}</b><span class="pic">${s.pic()}</span></span>`;
  }).join('');
  return `<div class="coach-strip" role="img" aria-label="Step ${n} of ${STEPS.length}: ${STEPS[n - 1].name}">${cells}</div>`;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

// Show (or move) the strip and the arrow.
// step: 1 to 5. target: an element, or a selector inside `stage`; with no
// target (or one that cannot be found) only the strip shows. text: a few words.
export function coach(stage, { step = 1, target = null, text = '' } = {}) {
  if (!stage) return;
  uncoach(stage);
  const box = document.createElement('div');
  box.className = 'coach';
  box.setAttribute('aria-hidden', 'false');
  box.innerHTML = strip(step);
  stage.append(box);

  let el = null;
  try { el = typeof target === 'string' ? stage.querySelector(target) : target; } catch { el = null; }
  if (!el?.getBoundingClientRect || !stage.contains(el)) return;

  // Where the target is, in the stage's own 1024 x 768 pixels (the stage is scaled to fit the screen).
  const s = stage.getBoundingClientRect();
  const t = el.getBoundingClientRect();
  const k = s.width / (stage.offsetWidth || 1024) || 1;
  if (!t.width && !t.height) return;
  const cx = (t.left + t.width / 2 - s.left) / k;
  const top = (t.top - s.top) / k;
  const below = top < 150; // no room above: point up from underneath
  const y = below ? (t.bottom - s.top) / k + 6 : top - 6;
  const pointer = document.createElement('div');
  pointer.className = `coach-point${below ? ' is-below' : ''}`;
  pointer.style.left = `${Math.max(70, Math.min(954, cx))}px`;
  pointer.style.top = `${y}px`;
  pointer.innerHTML = `<div class="coach-bounce">${text ? `<span class="coach-text">${esc(text)}</span>` : ''}<span class="pic coach-arrow">${item('arrow')}</span></div>`;
  box.append(pointer);
}

export function uncoach(stage) {
  stage?.querySelectorAll?.('.coach').forEach(el => el.remove());
}
