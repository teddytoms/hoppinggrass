import { MONSTERS, FOODS, DAYS, DAY_BONUS, TIP, KIND_SHARE, MIN_PRICE, MAX_PRICE, START_PRICE,
  UMBRELLA_BONUS, CHAIRS_TIP, MUSIC_BONUS, MYSTERY_PAYS, WINDOW_PAYS, NET_SAVES } from './data.js';

// These rules are handed the whole game so they can see what kind of day it is
// and which upgrades are owned. A missing or odd game counts as an ordinary
// day with no upgrades.
const dayKindOf = game => game?.day?.kind;
const has = (game, upgrade) => Array.isArray(game?.upgrades) && game.upgrades.includes(upgrade);

// Prices are whole dollars between $1 and $99.
export function clampPrice(n) {
  if (!Number.isFinite(n)) return START_PRICE;
  return Math.min(MAX_PRICE, Math.max(MIN_PRICE, Math.round(n)));
}

// What one of this food costs to make. The fishing net makes salmon cheaper.
// Everything that shows or sums a cost uses this (the price screen's "You
// keep", `sell`, the day's sums).
export function costOf(foodId, game) {
  if (!Object.hasOwn(FOODS, foodId ?? '')) return 0;
  return FOODS[foodId].cost - (foodId === 'salmon' && has(game, 'net') ? NET_SAVES : 0);
}

export function profit(price, cost) {
  return price - cost;
}

export function profitLabel(price, cost) {
  const p = profit(price, cost);
  return p >= 0 ? `You keep $${p}` : `You lose $${-p}`;
}

// Is this one of the foods everyone wants today?
export function isDayFood(foodId, dayKind = 'ordinary') {
  return (Object.hasOwn(DAYS, dayKind) ? DAYS[dayKind] : DAYS.ordinary).foods.includes(foodId);
}

// The most a monster will pay. On a special day it pays more for the day's
// foods, and the music box makes every monster pay a little more.
export function topPrice(monsterId, foodId, game) {
  return MONSTERS[monsterId].maxPrice[foodId]
    + (isDayFood(foodId, dayKindOf(game)) ? DAY_BONUS : 0)
    + (has(game, 'musicbox') ? MUSIC_BONUS : 0);
}

// Umbrella: the extra dollars every sale brings on a rainy day. `sell` in
// state.js adds this itself, so screens only need it to show the bonus.
export function rainBonus(game) {
  return dayKindOf(game) === 'rainy' && has(game, 'umbrella') ? UMBRELLA_BONUS : 0;
}

// How a monster feels about the food at this price.
// "Too much" is checked first, so the player can always fix the price
// before finding out what the sparkle does.
// A kind price (well under the top price, but not below what the food cost)
// earns a small tip on top of what the monster pays; comfy chairs make it bigger.
// `surprise` is the order's surprise, if any:
// - the mystery guest pays double (triple with the bigger window);
// - the critic always ends up happy, so a sparkle it dislikes is simply ignored.
export function react(monsterId, foodId, price, hasSparkle, game, surprise = null) {
  const monster = MONSTERS[monsterId];
  const top = topPrice(monsterId, foodId, game);
  if (price > top) return { kind: 'too-much', pays: 0, tip: 0 };
  const loves = hasSparkle && monster.sparkle === 'love';
  if (hasSparkle && !loves && surprise?.kind !== 'critic') return { kind: 'yuck', pays: 0, tip: 0 };
  const kind = price <= Math.floor(top * KIND_SHARE) && price >= costOf(foodId, game);
  // A loved sparkle doubles the price. The mystery guest's double or triple
  // does not stack on top of that: the bigger of the two counts.
  const mystery = surprise?.kind === 'mystery' ? (has(game, 'window') ? WINDOW_PAYS : MYSTERY_PAYS) : 1;
  const times = Math.max(loves ? 2 : 1, mystery);
  return { kind: loves ? 'love' : 'happy', pays: price * times, tip: kind ? (has(game, 'chairs') ? CHAIRS_TIP : TIP) : 0 };
}
