// The shop: spend money on the next recipe (buying one also plants what it
// needs in the garden) or on a decoration (each one brings a new monster).
// A star on anything not yet owned makes it the saving goal.

import { FOODS, FOOD_ORDER, DECOR, DECOR_ORDER, MONSTERS } from '../data.js';
import { canBuy, buy, nextRecipe, newGame, canBuyDecor, buyDecor, goalOf, setGoal } from '../state.js';
import { food, item, decor, monster } from '../art.js';
import { sfx } from '../audio.js';
import { piggyBank } from './restaurant.js';

export function render(stage, ctx, go, update) {
  let justBought = null;

  // The star button: tap it to save up for this thing.
  const star = (id, goal) => {
    const on = goal?.id === id;
    return `<button class="s-star${on ? ' on' : ''}" data-goal="${id}" aria-label="${on ? 'You are saving for this' : 'Save up for this'}" aria-pressed="${on}"><span class="pic">${item(on ? 'star' : 'star-empty')}</span></button>`;
  };
  // What shows under something that is for sale: a buy button, or how far there is to go.
  const buying = (id, price, can, isGoal, money) => {
    if (can) return `<button class="btn mint s-buy hint" data-buy="${id}">Buy $${price}</button>`;
    const pct = Math.round(money / price * 100);
    return `<button class="btn s-buy" disabled>Buy $${price}</button>${isGoal
      ? `<div class="s-saving"><span class="bar"><i style="width:${pct}%"></i></span>$${money} of $${price}</div>`
      : `<div class="s-more">$${price - money} more</div>`}`;
  };

  function recipeCard(id, next, goal) {
    const f = FOODS[id], game = ctx.game;
    const state = game.owned.includes(id) ? 'owned' : id === next ? 'next' : 'later';
    let bottom;
    if (state === 'owned') bottom = `<div class="s-have"><span class="pic">${item('tick')}</span>You have it</div>`;
    else if (state === 'next') bottom = buying(id, f.recipePrice, canBuy(game, id), goal?.id === id, game.money);
    else bottom = `<div class="s-locked"><span class="pic">${item('lock')}</span>$${f.recipePrice}</div>`;
    return `<div class="s-card card ${state}${goal?.id === id ? ' goal-card' : ''}${id === justBought ? ' flip' : ''}">${id === justBought ? `<span class="pic s-burst">${item('twinkle')}</span>` : ''}
${state === 'next' ? star(id, goal) : ''}<span class="pic s-food">${food(id)}</span><h2 class="baloo">${f.name}</h2>${bottom}</div>`;
  }

  function decorCard(id, goal) {
    const d = DECOR[id], game = ctx.game, has = game.decor.includes(id);
    const who = MONSTERS[d.brings].name;
    // Before buying, the new monster is a mystery shadow.
    const guest = `<span class="s-plus baloo">+</span><span class="pic s-guest${has ? '' : ' mystery'}">${monster(d.brings, has ? 'happy' : 'idle')}${has ? '' : '<b class="baloo">?</b>'}</span>`;
    const bottom = has
      ? `<div class="s-have"><span class="pic">${item('tick')}</span>You have it</div>`
      : buying(id, d.price, canBuyDecor(game, id), goal?.id === id, game.money);
    return `<div class="s-card s-decor card ${has ? 'owned' : 'next'}${goal?.id === id ? ' goal-card' : ''}${id === justBought ? ' flip' : ''}">${id === justBought ? `<span class="pic s-burst">${item('twinkle')}</span>` : ''}
${has ? '' : star(id, goal)}<div class="s-pics"><span class="pic s-thing">${decor(id)}</span>${guest}</div>
<h2 class="baloo">${d.name}</h2><div class="s-brings">${has ? `${who} comes to eat now!` : 'Brings a new monster!'}</div>${bottom}</div>`;
  }

  // The shelf has room for four recipe cards: the one just before the next
  // recipe to buy, the next one, and what comes after.
  const shelf = next => {
    const last = FOOD_ORDER.length - 4;
    const from = next ? Math.max(0, Math.min(FOOD_ORDER.indexOf(next) - 1, last)) : last;
    return FOOD_ORDER.slice(from, from + 4);
  };

  function draw() {
    const game = ctx.game, next = nextRecipe(game), goal = goalOf(game);
    let news = '';
    if (justBought in DECOR) {
      const who = DECOR[justBought].brings;
      news = `<div class="s-news baloo popin"><span class="pic">${monster(who, 'happy')}</span><span>${MONSTERS[who].name} is coming to eat!</span></div>`;
    } else if (justBought) {
      const planted = FOODS[justBought].ingredients.map(i => `<span class="pic">${item(i.id)}</span>`).join('');
      news = `<div class="s-news baloo popin">${planted}<span>New in your garden!</span></div>`;
    }
    stage.innerHTML = `<div class="s-wrap">
<div class="s-top"><button class="btn white" data-back>Back</button><h1 class="baloo">Shop</h1>${piggyBank(game)}</div>
<h2 class="s-shelf baloo">Recipes <small>${game.owned.length} of ${FOOD_ORDER.length}</small></h2>
<div class="s-cards">${shelf(next).map(id => recipeCard(id, next, goal)).join('')}</div>
<h2 class="s-shelf baloo">Decorations</h2>
<div class="s-cards three">${DECOR_ORDER.map(id => decorCard(id, goal)).join('')}</div>
${news}
<button class="s-reset" data-reset>Start over</button>
</div>`;
  }

  function askStartOver() {
    stage.insertAdjacentHTML('beforeend', `<div class="s-ask"><div class="s-ask-box card">
<h2 class="baloo">Are you sure?</h2><p>Starting over takes away all your money, recipes, decorations and stickers.</p>
<div class="s-ask-buttons"><button class="btn mint" data-no>No, keep playing</button><button class="btn white" data-yes>Yes, start over</button></div>
</div></div>`);
  }

  // The mute button is added to this screen by main.js after render, so redraw
  // only the shop's own part and leave everything else alone.
  function redraw() {
    const mute = stage.querySelector('.mute');
    draw();
    if (mute) stage.append(mute);
  }

  stage.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b) return;
    if ('back' in b.dataset) { go(ctx.back === 'dayend' ? 'dayend' : 'restaurant'); return; }
    if ('reset' in b.dataset) { askStartOver(); return; }
    if ('no' in b.dataset) { stage.querySelector('.s-ask')?.remove(); return; }
    if ('yes' in b.dataset) {
      update({ ...newGame(), muted: ctx.game.muted });
      ctx.order = null; // start again with a fresh monster
      go('restaurant');
      return;
    }
    if (b.dataset.goal) {
      update(setGoal(ctx.game, b.dataset.goal));
      justBought = null;
      sfx('pop');
      redraw();
      return;
    }
    const id = b.dataset.buy;
    const bought = id in DECOR ? canBuyDecor(ctx.game, id) && buyDecor(ctx.game, id)
      : id && canBuy(ctx.game, id) && buy(ctx.game, id);
    if (bought) {
      update(bought);
      justBought = id;
      sfx('coin');
      redraw();
    }
  });

  draw();
}
