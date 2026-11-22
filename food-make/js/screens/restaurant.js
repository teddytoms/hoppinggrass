// The restaurant: a monster orders, Victoria writes it down, and the player taps "Make".
// It also shows what kind of day it is, the decorations (tap one to move it),
// and what the piggy bank is saving for.

import { FOODS, MENU, MONSTERS, DAYS, DAY_LENGTH, DECOR, START_PRICE } from '../data.js';
import { pickOrder } from '../orders.js';
import { nextOrderSeq, monstersHere, moveDecor, goalOf } from '../state.js';
import { monster, waiter, food, item, place, decor, vase, lightString } from '../art.js';
import { sfx } from '../audio.js';

const INK = '#3B2A4A';

// Some monsters are drawn smaller: Fife is tiny.
export const MONSTER_SIZE = { fife: 0.72 };

// The picture of what is being saved for (a recipe or a decoration).
export const goalPic = goal => (goal.kind === 'decor' ? decor(goal.id) : food(goal.id));

// The piggy bank. With `withGoal` it also shows the saving goal and how close it is.
export function piggyBank(game, withGoal = false) {
  const goal = withGoal ? goalOf(game) : null;
  let row = '';
  if (goal) {
    const ready = game.money >= goal.price;
    const pct = Math.min(100, Math.round(game.money / goal.price * 100));
    row = `<div class="goal${ready ? ' ready' : ''}" aria-label="Saving for ${goal.name}"><span class="pic star">${item('star')}</span><span class="pic">${goalPic(goal)}</span>
${ready ? '<span class="goal-words">You can buy it!</span>' : `<span class="bar"><i style="width:${pct}%"></i></span><span class="goal-words">$${game.money} of $${goal.price}</span>`}</div>`;
  }
  return `<div class="piggy card${goal ? ' has-goal' : ''}"><div class="piggy-top"><span class="pic">${item('piggy')}</span>
<div><span class="amount">$${game.money}</span><span class="best">Best ever: $${game.best}</span></div></div>${row}</div>`;
}

// What you see out of the window depends on the kind of day.
function windowView(kind) {
  const frame = `<rect x="392" y="96" width="240" height="190" rx="18" fill="none"/><path d="M512 96V286"/>`;
  const hill = `<path d="M394 250Q470 190 630 240V268Q630 284 614 284H410Q394 284 394 268Z" fill="#6CCB7F" stroke-width="0"/><path d="M394 262l18-34 18 34 18-34 18 34 18-34 18 34 18-34 18 34 18-34 18 34 18-34 18 34 20-34" fill="none" stroke="#2E9E55" stroke-width="4"/>`;
  const tree = `<rect x="556" y="196" width="10" height="46" fill="#A0673A" stroke-width="3"/><circle cx="561" cy="176" r="34" fill="#3FB56B" stroke-width="4"/><circle cx="548" cy="170" r="7" fill="#FF9F1C" stroke-width="2.5"/><circle cx="572" cy="186" r="7" fill="#FF9F1C" stroke-width="2.5"/><circle cx="566" cy="160" r="7" fill="#FF9F1C" stroke-width="2.5"/>`;
  let sky = '#8FD3FF', extra = `<circle cx="446" cy="140" r="20" fill="#FFE066" stroke-width="0"/>`;
  if (kind === 'hot') {
    sky = '#FFE9A8';
    extra = `<g class="w-sun" stroke-width="4" stroke-linecap="round"><path d="M452 108v10M452 170v10M416 144h10M478 144h10M427 119l7 7M470 162l7 7M477 119l-7 7M434 162l-7 7"/><circle cx="452" cy="144" r="20" fill="#FFC93C"/></g>`;
  } else if (kind === 'rainy') {
    sky = '#B9C8E8';
    extra = `<path d="M420 150a14 14 0 0 1 3-28a19 19 0 0 1 37 3a13 13 0 0 1 1 25z" fill="#E6ECFA" stroke-width="4"/><g class="w-rain" stroke="#3F8FE0" stroke-width="4" stroke-linecap="round"><path d="M426 164l-5 14M446 164l-5 14M466 164l-5 14M536 120l-5 14M580 136l-5 14M600 110l-5 14"/></g>`;
  } else if (kind === 'party') {
    extra = `<g class="w-confetti" stroke-width="0"><rect x="416" y="118" width="10" height="10" fill="#FF5E8A" transform="rotate(20 421 123)"/><rect x="456" y="140" width="10" height="10" fill="#FFC93C" transform="rotate(-15 461 145)"/><rect x="436" y="170" width="10" height="10" fill="#8B6BE8" transform="rotate(40 441 175)"/><rect x="590" y="116" width="10" height="10" fill="#5ED6B0" transform="rotate(10 595 121)"/><rect x="476" y="112" width="10" height="10" fill="#6EC6FF" transform="rotate(-30 481 117)"/><rect x="606" y="150" width="10" height="10" fill="#FF8A3D" transform="rotate(25 611 155)"/></g>`;
  }
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="392" y="96" width="240" height="190" rx="18" fill="${sky}"/>${hill}${tree}${extra}${frame}</g>`;
}

// Fairy lights and flowers are drawn into the room. The string of lights can
// sit above or below the window, and the flowers move with it.
function lightsAndFlowers(game) {
  if (!game.decor.includes('lights')) return { back: '', front: '' };
  const low = (game.spots.lights ?? 0) === 1;
  return {
    back: low ? lightString(60, 340, 330) + lightString(684, 964, 330) : lightString(372, 652, 84),
    front: low ? vase(96, 372) + vase(908, 372) : vase(346, 372) + vase(656, 372),
  };
}

// Where the decorations can go: [left, top] on the 1024 x 768 stage, one pair per spot.
const DECOR_BOX = {
  balloons: { w: 116, h: 176, spots: [[908, 376], [0, 452], [644, 318]] },
  disco: { w: 110, h: 230, spots: [[640, 124], [300, 124], [880, 124]] },
  lights: { w: 300, h: 72, spots: [[362, 184], [50, 430]] },
  bubbles: { w: 104, h: 160, spots: [[0, 320], [650, 330]] },
};

function decorButtons(game) {
  return game.decor.map(id => {
    const box = DECOR_BOX[id], [x, y] = box.spots[game.spots[id] ?? 0] ?? box.spots[0];
    // The lights themselves are drawn in the room; their button is a clear patch over them.
    const pic = id === 'lights' ? '' : `<span class="pic">${decor(id)}</span>`;
    return `<button class="r-decor r-${id}" data-decor="${id}" style="left:${x}px;top:${y}px;width:${box.w}px;height:${box.h}px" aria-label="Move the ${DECOR[id].name.toLowerCase()}">${pic}</button>`;
  }).join('');
}

// A monster at a table. Small monsters stand on the same floor line.
const seat = (id, look, x) => {
  const k = MONSTER_SIZE[id] ?? 1, w = 220 * k, h = 280 * k;
  return place(monster(id, 'idle', look), x + (220 - w) / 2, 150 + (280 - h), w, h);
};

function room(game, orderingId, otherId, isNew) {
  const lights = lightsAndFlowers(game);
  return `<svg class="room${isNew ? ' r-new' : ''}" viewBox="0 0 1024 644" role="img" aria-label="Inside the restaurant: ${MONSTERS[orderingId].name} is ordering from Victoria the waiter, and ${MONSTERS[otherId].name} sits at the other table">
<rect width="1024" height="420" fill="#E4DBFF"/>
<rect y="380" width="1024" height="40" fill="#C9B8FF"/>
<rect y="420" width="1024" height="224" fill="#FFC98B"/>
<g stroke="#F2A65A" stroke-width="4"><path d="M0 480H1024M0 550H1024M0 610H1024M140 420V480M520 420V480M860 420V480M300 480V550M700 480V550M90 550V610M460 550V610M900 550V610"/></g>
<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M0 6Q512 60 1024 6" fill="none"/><path d="M60 14L84 60L108 20Z" fill="#FF5E8A"/><path d="M190 27L214 72L238 31Z" fill="#FFC93C"/><path d="M320 35L344 80L368 37Z" fill="#5ED6B0"/><path d="M660 37L684 80L708 35Z" fill="#6EC6FF"/><path d="M790 31L814 72L838 27Z" fill="#FF8A3D"/><path d="M920 20L944 60L968 14Z" fill="#8B6BE8"/></g>
${windowView(game.day.kind)}
${lights.back}
<text x="478" y="74" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="40" fill="${INK}">Food Make</text>
<g class="r-enter">${seat(orderingId, 1, 140)}</g>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="236" y="440" width="28" height="110" fill="#E0577F"/><ellipse cx="250" cy="556" rx="60" ry="14" fill="#E0577F"/><ellipse cx="250" cy="436" rx="160" ry="36" fill="#FF8FAB"/></g>
<g class="r-sway">${seat(otherId, -1, 680)}</g>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="776" y="440" width="28" height="110" fill="#3FA98A"/><ellipse cx="790" cy="556" rx="60" ry="14" fill="#3FA98A"/><ellipse cx="790" cy="436" rx="160" ry="36" fill="#5ED6B0"/></g>
<g fill="${INK}"><path class="r-note" d="M930 190v-40l22-6v38a9 7 0 1 1-5-6v-22l-12 3v35a9 7 0 1 1-5-2z"/><path class="r-note late" d="M890 130v-30l5-1v29a8 6 0 1 1-5 2z"/></g>
<g fill="#FFE066" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path class="r-note later" d="M912 96l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/></g>
${lights.front}
${place(waiter(), 358, 250, 276, 364)}
</svg>`;
}

export function render(stage, ctx, go, update) {
  const isNew = !ctx.order;
  if (isNew) {
    // A new monster sits down: a fresh order and an empty basket.
    ctx.order = pickOrder(ctx.game);
    const others = monstersHere(ctx.game).filter(id => id !== ctx.order.monsterId);
    ctx.other = others[Math.floor(Math.random() * others.length)];
    update(nextOrderSeq(ctx.game));
    ctx.basket = {};
    ctx.hasSparkle = false;
    ctx.remake = false;
    ctx.price = START_PRICE;
    sfx('hello');
  }
  const { monsterId, foodId } = ctx.order;
  const otherId = ctx.other && ctx.other !== monsterId ? ctx.other : monstersHere(ctx.game).find(id => id !== monsterId);

  const tiles = MENU.map(m => {
    if (!ctx.game.owned.includes(m.id)) {
      return `<div class="menu-tile locked" aria-label="${m.name}, locked"><span class="pic">${item('lock')}</span>${m.name}</div>`;
    }
    return `<div class="menu-tile${m.id === foodId ? ' wanted' : ''}"><span class="pic">${food(m.id)}</span>${m.name}</div>`;
  }).join('');

  let drawn = false;
  function draw() {
    const game = ctx.game, day = DAYS[game.day.kind];
    const dayFoods = day.foods.filter(f => game.owned.includes(f));
    const sign = dayFoods.length
      ? `<div class="r-day card"><span class="pic">${item(day.pic)}</span><span>${day.name}! Monsters pay more for</span>${dayFoods.map(f => `<span class="pic">${food(f)}</span>`).join('')}</div>`
      : '';
    const dots = Array.from({ length: DAY_LENGTH }, (_, i) => `<i class="${i < game.day.served ? 'full' : ''}"></i>`).join('');
    const goal = goalOf(game);
    const canBuyGoal = goal && game.money >= goal.price;
    const first = isNew && !drawn; // the walking-in animation plays once, not on every redraw
    stage.innerHTML = `<div class="menu-bar">${tiles}</div>
${room(game, monsterId, otherId, first)}
${decorButtons(game)}
<button class="btn pink r-make hint" data-go="garden">Make</button>
<button class="btn r-book" data-go="book"><span class="pic">${item('star')}</span>Stickers</button>
<div class="r-right"><button class="btn r-shop${canBuyGoal ? ' hint' : ''}" data-go="shop">Shop</button>${piggyBank(game, true)}</div>
<div class="bubble r-bubble${first ? ' r-pop' : ''}"><span class="pic">${food(foodId)}</span><span>${FOODS[foodId].name}, please!</span></div>
${sign}
${ctx.player ? `<button class="r-who" data-go="who" aria-label="Change who is playing"><span class="pic">${monster(ctx.player.pic, 'happy')}</span></button>` : ''}
<div class="r-dots card" aria-label="Day ${game.day.n}: ${game.day.served} of ${DAY_LENGTH} monsters served"><span>Day ${game.day.n}</span>${dots}</div>`;
    drawn = true;
  }

  // The mute button is added by main.js after render, so a redraw keeps it.
  stage.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b) return;
    if (b.dataset.go) { ctx.back = 'restaurant'; go(b.dataset.go); return; }
    if (b.dataset.decor) {
      update(moveDecor(ctx.game, b.dataset.decor));
      sfx('pop');
      const mute = stage.querySelector('.mute');
      draw();
      if (mute) stage.append(mute);
    }
  });

  draw();
}
