// "SUDDENLY!" Which surprise, if any, comes with the next order.
// Weather is not here: hot, rainy and party days stay kinds of day.

import { SURPRISE_EVERY, NO_SURPRISE_BEFORE, CRITIC_NEAR, SPICES_WEIGHT } from './data.js';
import { chapterOf, hasUpgrade } from './chapters.js';

export const SURPRISES = ['rush', 'mystery', 'big', 'golden', 'critic'];

const count = n => (Number.isInteger(n) && n >= 0 ? n : 0);

// Returns one of SURPRISES, or null for an ordinary order.
// - One surprise every three orders (every two with the bell): two ordinary
//   orders, then a surprise.
// - Never in the first two orders of a new game (the very first order is the
//   teaching order: see FIRST_ORDER in orders.js).
// - Never the same one twice running.
// - The critic comes once per chapter, as soon as the plates are within three
//   of the chapter's goal. It does not wait for its turn. (A lunch rush that
//   has begun finishes first; if the player then travels on at once, that
//   chapter's critic is simply not met.)
// - The mystery guest needs two or more recipes to guess between.
// - The spice rack makes the golden ingredient twice as likely.
export function nextSurprise(game, rng = Math.random) {
  if (count(game?.orderSeq) < NO_SURPRISE_BEFORE) return null;
  const chapter = chapterOf(game);
  const criticDone = Array.isArray(game.criticDone) && game.criticDone.includes(chapter.id);
  if (!criticDone && count(game.plates) >= chapter.goal - CRITIC_NEAR) return 'critic';

  const gap = SURPRISE_EVERY - 1 - (hasUpgrade(game, 'bell') ? 1 : 0);
  if (count(game.sinceSurprise) < gap) return null;

  const recipes = Array.isArray(game.owned) ? game.owned.length : 0;
  const weights = { rush: 1, mystery: recipes >= 2 ? 1 : 0, big: 1, golden: hasUpgrade(game, 'spices') ? SPICES_WEIGHT : 1 };
  delete weights[game.lastSurprise];
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let at = rng() * total;
  for (const [kind, weight] of Object.entries(weights)) {
    if (weight > 0 && (at -= weight) < 0) return kind;
  }
  return Object.keys(weights).findLast(k => weights[k] > 0) ?? null; // rng gave exactly 1
}
