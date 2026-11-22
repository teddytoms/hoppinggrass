import { MONSTERS, FOODS, DAYS, DAY_BONUS, TIP, KIND_SHARE, MIN_PRICE, MAX_PRICE, START_PRICE } from './data.js';

// Prices are whole dollars between $1 and $99.
export function clampPrice(n) {
  if (!Number.isFinite(n)) return START_PRICE;
  return Math.min(MAX_PRICE, Math.max(MIN_PRICE, Math.round(n)));
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
  return (DAYS[dayKind] ?? DAYS.ordinary).foods.includes(foodId);
}

// The most a monster will pay. On a special day it pays more for the day's foods.
export function topPrice(monsterId, foodId, dayKind = 'ordinary') {
  return MONSTERS[monsterId].maxPrice[foodId] + (isDayFood(foodId, dayKind) ? DAY_BONUS : 0);
}

// How a monster feels about the food at this price.
// "Too much" is checked first, so the player can always fix the price
// before finding out what the sparkle does.
// A kind price (well under the top price, but not below what the food cost)
// earns a small tip on top of what the monster pays.
export function react(monsterId, foodId, price, hasSparkle, dayKind = 'ordinary') {
  const monster = MONSTERS[monsterId];
  const top = topPrice(monsterId, foodId, dayKind);
  if (price > top) return { kind: 'too-much', pays: 0, tip: 0 };
  if (hasSparkle && monster.sparkle !== 'love') return { kind: 'yuck', pays: 0, tip: 0 };
  const kind = price <= Math.floor(top * KIND_SHARE) && price >= FOODS[foodId].cost;
  return { kind: hasSparkle ? 'love' : 'happy', pays: hasSparkle ? price * 2 : price, tip: kind ? TIP : 0 };
}
