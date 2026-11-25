// The shop: a comic panel where coins buy new recipes and upgrades.
// Things not yet affordable are shown with how much more is needed.
// A gift food (moon cheese toast) is never for sale: once given, it sits in
// the "You have" row with a Gift tag. Upgrades show six at a time, with a
// "More" button when there are more, so everything always fits.

import { FOODS, UPGRADES } from '../data.js';
import { canBuy, buy, canBuyUpgrade, buyUpgrade } from '../state.js';
import { foodsForSale, upgradesForSale } from '../chapters.js';
import { food, upgrade } from '../art.js';
import { sfx } from '../audio.js';
import { coinBox } from './hud.js';

// Two rows of three upgrade cards fit under the recipes.
const UPGRADES_SHOWN = 6;

export function render(stage, ctx, go, update) {
  let word = null; // the sound word to show after a purchase
  let boughtAt = -Infinity; // when the last thing was bought
  let page = 0; // which six upgrades are showing

  // The button under something for sale: tappable, or how much more is needed.
  const buyButton = (kind, id, price, money) => (money >= price
    ? `<button class="sh-btn sh-buy" data-${kind}="${id}">Buy</button>`
    : `<button class="sh-btn sh-buy" disabled>$${price - money} more</button>`);

  const recipeCard = (id, game) => {
    const f = FOODS[id];
    return `<div class="sh-card sh-recipe"><span class="pic sh-pic">${food(id)}</span>
<h3>${f.name}</h3><div class="sh-price">$${f.recipePrice}</div>${buyButton('recipe', id, f.recipePrice, game.money)}</div>`;
  };

  const upgradeCard = (id, game) => {
    const u = UPGRADES[id];
    return `<div class="sh-card sh-upgrade"><span class="pic sh-pic">${upgrade(id)}</span>
<div class="sh-text"><div class="sh-namerow"><h3>${u.name}</h3><span class="sh-price">$${u.price}</span></div><p>${u.line}</p></div>${buyButton('upgrade', id, u.price, game.money)}</div>`;
  };

  function draw() {
    const game = ctx.game;
    const foods = foodsForSale(game), ups = upgradesForSale(game);
    const owned = Object.keys(UPGRADES).filter(id => game.upgrades.includes(id));
    const gifts = game.owned.filter(id => FOODS[id]?.gift);
    const pages = Math.max(1, Math.ceil(ups.length / UPGRADES_SHOWN));
    page = Math.min(page, pages - 1);
    const shown = ups.slice(page * UPGRADES_SHOWN, (page + 1) * UPGRADES_SHOWN);
    const nothing = !foods.length && !ups.length;
    panel.innerHTML = `<div class="sh-top"><span class="cm-caption">At the shop...</span>${coinBox(game)}</div>
<div class="sh-body">
${nothing ? `<div class="sh-empty"><span class="cm-bubble">You have everything here! More in the next place.</span></div>` : ''}
${foods.length ? `<h2 class="sh-head">New recipes</h2><div class="sh-grid sh-recipes${foods.length > 8 ? ' is-many' : ''}" style="grid-template-columns:repeat(${Math.max(8, foods.length)}, 1fr)">${foods.map(id => recipeCard(id, game)).join('')}</div>` : ''}
${ups.length ? `<h2 class="sh-head">Upgrades${pages > 1 ? ` <span class="sh-page">${page + 1} of ${pages}</span>` : ''}</h2><div class="sh-grid sh-upgrades">${shown.map(id => upgradeCard(id, game)).join('')}</div>` : ''}
</div>
<div class="sh-bottom"><div class="sh-have">${owned.length || gifts.length ? `<span class="sh-have-label">You have</span>${
  gifts.map(id => `<span class="pic sh-own sh-gift" title="${FOODS[id].name}: a gift">${food(id)}<b>Gift</b></span>`).join('')}${
  owned.map(id => `<span class="pic sh-own" title="${UPGRADES[id].name}">${upgrade(id)}</span>`).join('')}` : ''}</div>
${pages > 1 ? '<button class="sh-btn sh-more" data-more>More</button>' : ''}
<button class="sh-btn sh-back" data-back>Back</button></div>
${word ? `<span class="cm-sfx sh-word" aria-live="polite">${word}</span>` : ''}`;
    const w = panel.querySelector('.sh-word');
    if (w) setTimeout(() => w.hidden = true, 1400);
  }

  const panel = document.createElement('div');
  panel.className = 'sh-panel cm-panel';
  stage.classList.add('sh-screen');
  stage.append(panel);

  panel.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b || b.disabled) return;
    if ('back' in b.dataset) { go(ctx.back ?? 'place'); return; }
    if ('more' in b.dataset) { page += 1; if (page * UPGRADES_SHOWN >= upgradesForSale(ctx.game).length) page = 0; draw(); return; }
    // After a purchase the cards move up: a second quick tap must not buy the next one.
    if (performance.now() - boughtAt < 700) return;
    const before = ctx.game;
    let after = before, say = null;
    if (b.dataset.recipe && canBuy(before, b.dataset.recipe)) { after = buy(before, b.dataset.recipe); say = 'NEW RECIPE!'; }
    else if (b.dataset.upgrade && canBuyUpgrade(before, b.dataset.upgrade)) { after = buyUpgrade(before, b.dataset.upgrade); say = 'DING!'; }
    if (after === before) return; // refused: nothing is bought twice
    update(after);
    boughtAt = performance.now();
    sfx('coin');
    word = say;
    draw();
    word = null;
  });

  draw();
}
