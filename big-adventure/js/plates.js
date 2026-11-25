// Happy plates: the bet is 80 of them.

import { MONSTERS } from './data.js';

const wholeOr = (n, fallback) => (Number.isInteger(n) && n >= 0 ? n : fallback);

// How many plates one sale is worth.
// A monster that says "yuck" or "too much" gives none. A happy monster gives 1.
// A golden plate adds 1 more, at most once per sale: the monster's favourite
// food, a sparkle it loves, or `golden` passed in (the golden ingredient, or a
// lunch-rush order served in time). A kind price earns a tip, not a golden plate.
// `count` is how many foods were sold at once (a big order: 3, or 4 with the
// bubble machine; a golden big order is one plate more, not double).
// `bonus` is added at the end (a happy critic: CRITIC_BONUS).
export function platesFor({ kind, tip = 0, monsterId, foodId, golden = false, count = 1, bonus = 0 } = {}) {
  if (kind !== 'happy' && kind !== 'love') return { plates: 0, golden: false };
  const favourite = Object.hasOwn(MONSTERS, monsterId ?? '') && MONSTERS[monsterId].favourite === foodId;
  const isGolden = golden === true || favourite || kind === 'love';
  return { plates: Math.max(1, wholeOr(count, 1)) + (isGolden ? 1 : 0) + wholeOr(bonus, 0), golden: isGolden };
}
