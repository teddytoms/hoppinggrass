// The piece shop. Ticket money buys a new piece for ever; it then shows up
// in the workshop. The flying jellyfish city is the big dream at the top.

import { PIECES, CITY_PRICE } from '../data.js';
import { canBuy, buyPiece, nextGoal, piecesLeft } from '../economy.js';
import { pieceIcon, icon, city, coin } from '../art.js';
import { el, button, pic, moneyChip, backButton, givesHtml } from '../ui.js';
import { sfx } from '../audio.js';

export function render(root, ctx, go, update) {
  root.classList.add('pad');

  function buy(id) {
    const next = buyPiece(ctx.game, id);
    if (next === ctx.game) return;
    update(next);
    sfx('coin');
    if (id === 'city') return go('finale');
    draw();
  }

  function draw() {
    const g = ctx.game;
    const goal = nextGoal(g);
    const left = piecesLeft(g);
    const total = Object.values(PIECES).filter(p => p.own > 0).length;
    root.innerHTML = `
<h2 class="title abs" style="left:110px;top:18px">Piece shop</h2>
<div class="hud">${moneyChip(g.money)}</div>
<div class="abs card citycard ${g.cityBuilt ? '' : 'dream'}" style="left:18px;right:18px;top:96px">
  ${pic(city())}
  <div><div class="hand" style="font-size:34px">Flying Jellyfish City</div>
  <div style="font-size:22px">${g.cityBuilt ? 'You built it! It is on your map.' : left ? `The big dream. First own every piece: ${total - left} of ${total}.` : 'You own every piece. Now save up for the dream!'}</div></div>
  <div class="cityact row"></div>
</div>
<p class="abs" style="left:370px;top:38px;font-size:21px">Tap a piece to buy it, or to save up for it.</p>
<div class="abs shelf" style="left:18px;right:18px;top:240px"></div>`;
    root.append(backButton(() => go('hangar')));
    const ca = root.querySelector('.cityact');
    if (g.cityBuilt) ca.innerHTML = pic(icon('ok'));
    else if (canBuy(g, 'city')) ca.append(button({ label: `Build $${CITY_PRICE}`, cls: 'go pulse', tap: () => buy('city') }));
    else ca.innerHTML = `<span class="chip money">${pic(coin())}<span>$${CITY_PRICE}</span></span>`;

    const shelf = root.querySelector('.shelf');
    const list = Object.entries(PIECES).filter(([, p]) => p.own > 0).sort((a, b) => a[1].own - b[1].own);
    for (const [id, p] of list) {
      const owned = g.owned.includes(id), can = canBuy(g, id), isGoal = goal === id;
      // The whole card is the button: buy it if there is enough money,
      // otherwise make it the thing the piggy bank is saving for.
      const card = el(`<button class="card sc ${owned ? 'owned' : ''} ${can ? 'can pulse' : ''}" aria-label="${p.name}: ${owned ? 'yours' : can ? `buy for $${p.own}` : `$${p.own}, tap to save up for it`}">
${pic(pieceIcon(id), 'main')}<b>${p.name}</b>${givesHtml(p)}
<span class="foot">${owned
    ? `<span class="row hand" style="font-size:22px;gap:4px"><span style="width:32px;height:32px">${icon('ok')}</span>Yours</span>`
    : `<span class="chip ${can ? 'money' : ''}">${pic(coin())}<span>$${p.own}</span></span>${can ? '<span class="hand buy">Buy!</span>' : `<span class="goalmark">${icon(isGoal ? 'goal-on' : 'goal')}</span>`}`}</span></button>`);
      if (!owned) card.addEventListener('click', () => {
        if (can) return buy(id);
        update({ ...ctx.game, goal: id });
        sfx('tap');
        draw();
      });
      shelf.append(card);
    }
  }

  draw();
}
