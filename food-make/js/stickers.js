// The rules for winning each sticker. Everything is worked out from the saved
// game, so a sticker can never be missed by a screen forgetting to ask.

import { STICKERS, FOOD_ORDER, DECOR_ORDER, MONSTERS } from './data.js';
import { dayOver, dayKept } from './state.js';

const sold = (g, food) => g.counts.sold[food] ?? 0;
const flag = (g, name) => g.counts.flags.includes(name);

const RULES = {
  'first-sale': g => Object.values(g.counts.sold).some(n => n > 0),
  'juice-5': g => sold(g, 'orange-juice') >= 5,
  'pizza-5': g => sold(g, 'pizza') >= 5,
  'pie-5': g => sold(g, 'pie') >= 5,
  'lassi-5': g => sold(g, 'mango-lassi') >= 5,
  'bella-secret': g => flag(g, 'bella-love'),
  'ella-secret': g => flag(g, 'ella-yuck'),
  'tips-5': g => g.counts.tips >= 5,
  'hot-seller': g => flag(g, 'hot-drink'),
  'decor-1': g => g.decor.length >= 1,
  'decor-all': g => DECOR_ORDER.every(d => g.decor.includes(d)),
  'meet-all': g => Object.keys(MONSTERS).every(m => g.counts.met.includes(m)),
  'save-100': g => g.money >= 100,
  // These two also count the day that has just finished, so the sticker
  // arrives on the closing page and not a day late.
  'best-day-50': g => g.bestDay >= 50 || (dayOver(g) && dayKept(g) >= 50),
  'all-recipes': g => FOOD_ORDER.every(f => g.owned.includes(f)),
  'days-10': g => g.counts.days + (dayOver(g) ? 1 : 0) >= 10,
};

// Give the player every sticker they have now earned. `fresh` lists the new
// ones, in book order. A sticker, once won, is never taken away.
export function collect(game) {
  const fresh = STICKERS.map(s => s.id).filter(id => !game.stickers.includes(id) && RULES[id](game));
  if (!fresh.length) return { game, fresh };
  const stickers = STICKERS.map(s => s.id).filter(id => game.stickers.includes(id) || fresh.includes(id));
  return { game: { ...game, stickers }, fresh };
}
