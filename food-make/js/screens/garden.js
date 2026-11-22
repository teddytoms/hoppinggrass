// The magic garden: tap to pick what the recipe needs. Sometimes a mystery sparkle grows too.

import { FOODS } from '../data.js';
import { sparkleAppears } from '../orders.js';
import { item, chef, place } from '../art.js';
import { sfx } from '../audio.js';

const INK = '#3B2A4A';
const calm = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const BASKET = { x: 372, y: 660 }; // where picked things fly to: the chef's basket

// Where each thing grows: [x, y] of its middle, on the 1024 x 768 stage.
const SPOTS = {
  orange: [[140, 270], [210, 230], [270, 290], [190, 330], [250, 350]],
  dough: [[388, 400]],
  cheese: [[540, 350]],
  tomato: [[556, 440]],
  crust: [[396, 490]],
  berry: [[716, 440], [770, 404], [832, 410], [870, 452], [790, 462]],
  mango: [[900, 300], [960, 260], [975, 330]],
  milk: [[56, 590], [128, 560]],
};
const SPARKLE_SPOT = [650, 285];

const G = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">`;
const PLANTS = {
  orange: `${G}<path d="M196 520V380" stroke="#8A5A32" stroke-width="30"/><path d="M181 520V380M211 520V380" fill="none"/>
<path d="M90 300a70 70 0 0 1 60-104a80 80 0 0 1 130-10a70 70 0 0 1 40 120a66 66 0 0 1-70 84a80 80 0 0 1-110-10a60 60 0 0 1-50-80z" fill="#3FB56B"/></g>`,
  pizza: `${G}<path d="M470 560Q462 470 470 400" fill="none" stroke="#2E9E55" stroke-width="10"/>
<path d="M468 430Q430 420 400 404M470 400Q510 380 532 356M469 470Q520 470 548 446M468 520Q430 520 404 496" fill="none" stroke="#2E9E55" stroke-width="7"/>
<path d="M470 540Q436 530 428 506Q458 504 470 526Z" fill="#5ED6B0"/><path d="M470 500Q506 492 514 468Q484 468 470 488Z" fill="#5ED6B0"/>
<path d="M430 322Q470 298 510 322L470 380Z" fill="#FFD166"/><path d="M430 322Q470 298 510 322" fill="none" stroke="#C97B2A" stroke-width="9"/><path d="M430 322Q470 298 510 322L470 380Z" fill="none"/><circle cx="460" cy="334" r="6" fill="#EF476F" stroke-width="3"/><circle cx="482" cy="342" r="6" fill="#EF476F" stroke-width="3"/></g>`,
  berry: `${G}<path d="M684 500a50 50 0 0 1 4-84a56 56 0 0 1 86-34a60 60 0 0 1 96 6a52 52 0 0 1 34 96a40 40 0 0 1-30 20H710a40 40 0 0 1-26-4z" fill="#2E9E55"/></g>`,
  mango: `${G}<path d="M950 520V350" stroke="#8A5A32" stroke-width="26"/><path d="M937 520V350M963 520V350" fill="none"/>
<path d="M870 320a60 60 0 0 1 30-92a70 70 0 0 1 110 6a56 56 0 0 1 4 100a60 60 0 0 1-90 20a50 50 0 0 1-54-34z" fill="#5ED6B0"/></g>`,
  milk: `${G}<path d="M90 740Q84 660 92 610" fill="none" stroke="#2E9E55" stroke-width="10"/><path d="M92 640Q70 620 58 610M91 620Q110 590 126 578" fill="none" stroke="#2E9E55" stroke-width="7"/>
<path d="M90 700Q50 690 40 660Q76 658 90 684Z" fill="#5ED6B0"/><path d="M90 690Q130 680 142 650Q106 650 90 674Z" fill="#5ED6B0"/>
<g fill="#fff" stroke-width="4"><circle cx="92" cy="596" r="12"/><circle cx="74" cy="606" r="10"/><circle cx="110" cy="606" r="10"/></g><circle cx="92" cy="608" r="8" fill="#FFC93C" stroke-width="3"/></g>`,
};
// Which plant each ingredient grows on.
const PLANT_OF = { orange: 'orange', dough: 'pizza', tomato: 'pizza', cheese: 'pizza', crust: 'pizza', berry: 'berry', mango: 'mango', milk: 'milk' };

function scene(plants, withSparkleStem) {
  return `<svg class="g-scene" viewBox="0 0 1024 768" role="img" aria-label="The magic garden, with the chef holding a basket">
<rect width="1024" height="768" fill="#8FD3FF"/>
<circle cx="900" cy="120" r="56" fill="#FFE066"/>
<g class="g-clouds" fill="#fff"><ellipse cx="300" cy="150" rx="70" ry="26"/><ellipse cx="350" cy="130" rx="50" ry="26"/><ellipse cx="640" cy="200" rx="60" ry="22"/><ellipse cx="680" cy="184" rx="40" ry="22"/></g>
<path d="M0 400Q260 300 520 380T1024 340V768H0Z" fill="#8EDB8A"/>
<path d="M0 470Q300 400 620 450T1024 430V768H0Z" fill="#6CCB7F"/>
<path class="g-grass" d="M0 470l32-60 32 56 32-60 32 58 32-62 32 60 32-58 32 62 32-64 32 62 32-58 32 60 32-62 32 60 32-58 32 58 32-62 32 60 32-58 32 60 32-62 32 58 32-60 32 60 32-62 32 58 32-60 32 62 32-58 32 58 32-60 32 58" fill="none" stroke="#2E9E55" stroke-width="6" stroke-linejoin="round"/>
${G}<ellipse cx="800" cy="590" rx="190" ry="76" fill="#4FB7F0"/>
<path d="M690 580q16-12 32 0M860 620q16-12 32 0" fill="none" stroke="#fff" stroke-width="4"/>
<g class="g-fish"><path d="M742 566Q790 520 850 560Q880 540 892 536Q886 562 892 590Q876 584 850 574Q790 610 742 566Z" fill="#FF8A73"/><circle cx="772" cy="560" r="5" fill="${INK}" stroke-width="0"/><path d="M800 548Q808 564 800 580" fill="none" stroke-width="3"/></g>
<ellipse cx="640" cy="640" rx="30" ry="14" fill="#5ED6B0"/><ellipse cx="960" cy="560" rx="26" ry="12" fill="#5ED6B0"/></g>
${plants.map(p => `<g class="g-plant" data-plant="${p}">${PLANTS[p]}</g>`).join('')}
${withSparkleStem ? `<path d="M650 330V420" stroke="#2E9E55" stroke-width="10" stroke-linecap="round"/>` : ''}
<g class="g-chef">${place(chef('basket'), 190, 408, 216, 323)}</g>
</svg>`;
}

export function render(stage, ctx, go) {
  const needs = FOODS[ctx.order.foodId].ingredients;
  ctx.basket = {};
  ctx.hasSparkle = false;

  // Everything the player's recipes use grows here; buying a recipe plants more.
  const growing = [...new Set(ctx.game.owned.flatMap(f => FOODS[f].ingredients.map(i => i.id)))];
  const plants = [...new Set(growing.map(i => PLANT_OF[i]))];
  const sparkle = sparkleAppears();

  const fruit = growing.flatMap(ing => (SPOTS[ing] ?? []).map(([x, y]) =>
    `<button class="g-item" data-ing="${ing}" style="left:${x}px;top:${y}px"><span class="pic">${item(ing)}</span></button>`)).join('');
  const sparkleHtml = sparkle
    ? `<button class="g-item g-sparkle floaty" data-sparkle style="left:${SPARKLE_SPOT[0]}px;top:${SPARKLE_SPOT[1]}px"><span class="pic">${item('sparkle')}</span></button>
<div class="g-label baloo" data-sparkle-label>Mystery sparkle!</div>` : '';

  stage.innerHTML = `${scene(plants, sparkle)}${fruit}${sparkleHtml}
<div class="g-task card" aria-live="polite"></div>
<button class="btn g-back" disabled>Back to kitchen</button>`;

  const task = stage.querySelector('.g-task');
  const back = stage.querySelector('.g-back');
  const have = id => ctx.basket[id] ?? 0;

  function refresh() {
    task.innerHTML = needs.map(n => {
      const circles = Array.from({ length: n.count }, (_, i) => i < have(n.id)
        ? `<span class="g-dot full"><span class="pic">${item(n.id)}</span></span>`
        : '<span class="g-dot"></span>').join('');
      return `<div class="g-row"><span class="baloo">Pick ${n.count} ${n.name}</span><span class="g-dots">${circles}</span></div>`;
    }).join('');
    const done = needs.every(n => have(n.id) >= n.count);
    back.disabled = !done;
    back.classList.toggle('hint', done);
    for (const b of stage.querySelectorAll('.g-item[data-ing]')) {
      const n = needs.find(x => x.id === b.dataset.ing);
      b.classList.toggle('hint', !!n && have(n.id) < n.count && !b.dataset.picked);
    }
  }

  function wobble(el) {
    el.classList.remove('wobble');
    void el.offsetWidth; // restart the animation
    el.classList.add('wobble');
  }

  function flyToBasket(el) {
    el.style.pointerEvents = 'none';
    el.classList.remove('hint', 'floaty', 'wobble');
    const dx = BASKET.x - parseFloat(el.style.left), dy = BASKET.y - parseFloat(el.style.top);
    if (el.animate && !calm()) {
      // Fly in a little arc: up first, then down into the basket.
      el.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${Math.min(dy, 0) - 90}px) scale(1.1)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(.4)`, opacity: 0.3 },
      ], { duration: 520, easing: 'ease-in-out', fill: 'forwards' });
    } else {
      el.style.transform = `translate(${dx}px, ${dy}px) scale(.4)`;
      el.style.opacity = '0.2';
    }
    setTimeout(() => el.remove(), 540);
  }

  function restart(el, name) {
    if (!el) return;
    el.classList.remove(name);
    void el.getBoundingClientRect(); // restart the animation
    el.classList.add(name);
  }

  // The plant rustles and the chef hops a little way towards whatever was tapped.
  function react(b) {
    restart(stage.querySelector(`.g-plant[data-plant="${PLANT_OF[b.dataset.ing]}"]`), 'rustle');
    const chefEl = stage.querySelector('.g-chef');
    if (chefEl) {
      chefEl.style.setProperty('--lean', `${parseFloat(b.style.left) < 300 ? -26 : 26}px`);
      restart(chefEl, 'hop');
    }
  }

  stage.addEventListener('click', e => {
    const b = e.target.closest?.('.g-item');
    if (!b || !stage.contains(b)) return;
    if (b.dataset.picked) return; // already on its way to the basket
    if ('sparkle' in b.dataset) {
      b.dataset.picked = '1';
      ctx.hasSparkle = true;
      sfx('twinkle');
      stage.querySelector('[data-sparkle-label]')?.remove();
      flyToBasket(b);
      return;
    }
    const n = needs.find(x => x.id === b.dataset.ing);
    react(b);
    if (!n || have(n.id) >= n.count) { wobble(b); return; }
    b.dataset.picked = '1';
    ctx.basket[n.id] = have(n.id) + 1;
    sfx('pop');
    flyToBasket(b);
    refresh();
  });

  back.addEventListener('click', () => { if (!back.disabled) go('kitchen'); });
  refresh();
  if (sparkle) sfx('twinkle');
}
