// Closing time: a comic panel that adds up the day. A good day ends with the
// monsters who came today dancing.

import { pickDayKind } from '../orders.js';
import { dayKept, endDay } from '../state.js';
import { costOf } from '../economy.js';
import { monsterName } from '../chapters.js';
import { monster, plate, item, food } from '../art.js';
import { sfx } from '../audio.js';

const MAX_PLATES = 10;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

export function render(stage, ctx, go, update) {
  const game = ctx.game, day = game.day;
  const kept = dayKept(game);
  const good = kept > 0;
  // What today's food cost to make. `sell` adds it up as it goes (with costOf, so
  // the fishing net counts); a day with no sum is added up here the same way.
  const sold = Object.entries(day.sold ?? {});
  const cost = Number.isFinite(day.cost) ? day.cost : sold.reduce((sum, [f, n]) => sum + costOf(f, game) * n, 0);
  // The picture beside "Food cost": the food sold most today.
  const top = sold.sort((a, b) => b[1] - a[1])[0]?.[0];
  const costPic = top && costOf(top, game) > 0 ? food(top) : item('orange');
  const shown = Math.min(day.plates, MAX_PLATES);
  const plates = Array.from({ length: shown }, () => `<span class="pic dy-plate">${plate()}</span>`).join('')
    + (day.plates > shown ? `<span class="dy-more">+${day.plates - shown}</span>` : '');
  const dancers = good ? day.who.map((id, i) =>
    // The moon monster's name is typed by the player, so it is escaped.
    `<span class="dy-friend"><span class="pic dy-dancer" style="animation-delay:${i * 0.12}s">${monster(id, 'happy')}</span><span class="dy-name">${esc(monsterName(id, game))}</span></span>`).join('') : '';

  stage.classList.add('dy-screen');
  stage.insertAdjacentHTML('beforeend', `<div class="dy-panel cm-panel">
<div class="dy-top"><span class="cm-caption">Closing time...</span></div>
<h1 class="dy-title cm-title">Day ${day.n} is done!</h1>
<div class="dy-sums">
  <div class="dy-line"><span class="pic">${item('coin')}</span><span>Monsters paid</span><b>$${day.paid}</b></div>
  <div class="dy-line"><span class="pic">${costPic}</span><span>Food cost</span><b>&minus; $${cost}</b></div>
  ${day.tips > 0 ? `<div class="dy-line"><span class="pic">${item('star')}</span><span>Tips</span><b>+ $${day.tips}</b></div>` : ''}
  <div class="dy-line dy-kept"><span class="pic">${item('piggy')}</span><span>You kept</span><b>$${kept}</b></div>
</div>
<div class="dy-plates"><span class="dy-plates-text">Happy plates today: ${day.plates}</span><span class="dy-plate-row">${plates}</span></div>
<div class="dy-party"${good ? ' aria-label="The monsters are dancing"' : ''}>${dancers}</div>
<button class="dy-new" data-new>New day</button>
</div>`);
  if (good) sfx('party');

  let done = false;
  stage.querySelector('[data-new]').addEventListener('click', () => {
    if (done) return;
    done = true; // one tap only, even on a double tap
    update(endDay(ctx.game, pickDayKind(ctx.game)));
    go('place');
  });
}
