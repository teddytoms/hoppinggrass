// Little boxes every playing screen can show: the plate counter, the coins and a
// monster's three hearts. All return HTML. To refresh one after a change: el.outerHTML = plateCounter(ctx.game).
// Styles are in css/adventure.css.

import { CHAPTERS, PLATES_TO_WIN } from '../data.js';
import { chapterOf, wonBet } from '../chapters.js';
import { hearts, HEART_STEPS } from '../friends.js';
import { plate, item } from '../art.js';

// "12 of 80" with a bar that fills from the last chapter's goal to this chapter's goal.
export function plateCounter(game) {
  const here = chapterOf(game);
  const before = CHAPTERS.find(c => c.id === here.id - 1)?.goal ?? 0;
  const plates = Number.isFinite(game?.plates) ? game.plates : 0;
  const full = plates >= here.goal;
  const pct = full ? 100 : Math.max(0, Math.min(100, Math.round((plates - before) / (here.goal - before) * 100)));
  // Once the bet is won (and the last comic has handed it over) the Golden
  // Spoon sits beside the plates for good.
  const won = wonBet(game) && Array.isArray(game?.comicsSeen) && game.comicsSeen.includes('ending');
  const spoon = won ? `<span class="pic hud-spoon">${item('golden-spoon')}</span>` : '';
  return `<div class="hud-plates${full ? ' is-full' : ''}${won ? ' is-won' : ''}" aria-label="${plates} of ${PLATES_TO_WIN} happy plates. ${won ? 'You won the Golden Spoon!' : `This place needs ${here.goal}.`}">
<span class="pic hud-plate">${plate(full)}</span>
<div class="hud-plates-text"><b>${plates} of ${PLATES_TO_WIN}</b><span class="hud-bar"><i style="width:${pct}%"></i></span></div>${spoon}</div>`;
}

// A coin and the money the player has.
export function coinBox(game) {
  const money = Number.isFinite(game?.money) ? game.money : 0;
  return `<div class="hud-coins" aria-label="${money} dollars"><span class="pic">${item('coin')}</span><b>$${money}</b></div>`;
}

// A monster's three friendship hearts, full ones first.
// To refresh after a sale: el.outerHTML = heartsRow(ctx.game, monsterId).
export function heartsRow(game, monsterId) {
  const total = HEART_STEPS.length;
  const full = hearts(game, monsterId);
  const row = Array.from({ length: total }, (_, i) =>
    `<span class="pic hud-heart${i < full ? ' is-full' : ''}">${item(i < full ? 'heart' : 'heart-empty')}</span>`).join('');
  return `<div class="hud-hearts" aria-label="${full} of ${total} hearts">${row}</div>`;
}
