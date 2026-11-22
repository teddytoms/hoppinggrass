// The end of the day: the restaurant closes and Victoria adds up what was
// sold, what the food cost and what the player kept. A good day ends in a
// dance party. The money is already in the piggy bank; this page only adds up.

import { DAYS, FOOD_ORDER } from '../data.js';
import { pickDayKind } from '../orders.js';
import { dayKept, endDay, monstersHere } from '../state.js';
import { monster, waiter, food, item } from '../art.js';
import { sfx } from '../audio.js';
import { MONSTER_SIZE } from './restaurant.js';

const calm = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function render(stage, ctx, go, update) {
  const game = ctx.game, day = game.day;
  const kept = dayKept(game);
  const party = kept > 0;
  const bestEver = party && kept > game.bestDay;

  const words = !party ? 'Tomorrow is a new day!'
    : day.kind === 'ordinary' ? 'Well done, chef!'
      : `What a ${DAYS[day.kind].name.toLowerCase()}! Well done, chef!`;
  const sold = FOOD_ORDER.filter(f => day.sold[f])
    .map(f => `<span class="d-sold"><span class="pic">${food(f)}</span>&times;${day.sold[f]}</span>`).join('');
  const dancers = party ? `<div class="d-party" aria-label="The monsters are dancing">${(day.who.length ? day.who : monstersHere(game)).map((id, i) => {
    const k = MONSTER_SIZE[id] ?? 1;
    return `<span class="pic d-dancer" style="width:${110 * k}px;height:${140 * k}px;animation-delay:${i * 0.15}s">${monster(id, 'happy')}</span>`;
  }).join('')}</div>` : '';

  stage.innerHTML = `<div class="d-wrap">
<div class="d-left">
  <div class="d-closed baloo">Closed</div>
  <div class="bubble d-bubble">${words}</div>
  <div class="d-victoria pic">${waiter()}</div>
  ${dancers}
</div>
<div class="d-card card">
  <div class="d-title"><h1 class="baloo">Day ${day.n} is done!</h1><span class="pic">${item(DAYS[day.kind].pic)}</span></div>
  <div class="d-row-sold"><span>You sold</span>${sold}</div>
  <div class="d-line"><span class="pic">${item('coin')}</span><span>Monsters paid you</span><b class="baloo">$${day.paid}</b></div>
  <div class="d-line"><span class="pic">${item('orange')}</span><span>The food cost you</span><b class="baloo">&minus; $${day.cost}</b></div>
  ${day.tips > 0 ? `<div class="d-line"><span class="pic">${item('star')}</span><span>Tips for kind prices</span><b class="baloo">+ $${day.tips}</b></div>` : ''}
  <div class="d-kept"><span class="pic">${item('piggy')}</span><span class="baloo">You kept</span><b class="baloo d-amount" aria-live="polite">$${kept}</b></div>
  ${bestEver ? `<div class="d-best popin"><span class="pic">${item('star')}</span>Your best day ever!</div>` : ''}
  <div class="d-buttons"><button class="btn d-shop" data-shop>Shop</button><button class="btn mint d-new hint" data-new>New day</button></div>
</div></div>`;

  // The big number counts up, like coins dropping into the piggy bank.
  const amount = stage.querySelector('.d-amount');
  if (kept > 0 && !calm()) {
    let shown = 0;
    amount.textContent = '$0';
    const tick = setInterval(() => {
      shown = Math.min(kept, shown + Math.max(1, Math.ceil(kept / 16)));
      if (amount.isConnected) amount.textContent = `$${shown}`;
      if (shown >= kept || !amount.isConnected) clearInterval(tick);
    }, 60);
  }
  if (party) sfx('party');

  stage.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b) return;
    if ('shop' in b.dataset) { ctx.back = 'dayend'; go('shop'); return; }
    if ('new' in b.dataset) {
      // endDay does nothing once the day has moved on, so a double tap passes one day only.
      update(endDay(ctx.game, pickDayKind(ctx.game)));
      ctx.order = null;
      go('restaurant');
    }
  });
}
