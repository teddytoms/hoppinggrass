import { DAYS, DAY_FOOD_CHANCE, SPARKLE_CHANCE } from './data.js';
import { monstersHere } from './state.js';

const pick = (list, rng) => list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
const SPECIAL = Object.keys(DAYS).filter(k => k !== 'ordinary');

// Which monster sits down, and what it asks for.
// Monsters only ever ask for foods the player has the recipe for.
// On a special day most orders are for one of the day's foods.
export function pickOrder(game, rng = Math.random) {
  const monsterId = pick(monstersHere(game), rng);
  const dayFoods = (DAYS[game.day?.kind] ?? DAYS.ordinary).foods.filter(f => game.owned.includes(f));
  const foods = dayFoods.length && rng() < DAY_FOOD_CHANCE ? dayFoods : game.owned;
  return { monsterId, foodId: pick(foods, rng) };
}

// What kind of day comes next: ordinary one time in three, otherwise a special
// day the player can cook for, and not the same special day twice running
// when another one is possible.
export function pickDayKind(game, rng = Math.random) {
  const possible = SPECIAL.filter(k => DAYS[k].foods.some(f => game.owned.includes(f)));
  if (!possible.length || rng() < 1 / 3) return 'ordinary';
  const fresh = possible.filter(k => k !== game.lastSpecial);
  return pick(fresh.length ? fresh : possible, rng);
}

// The mystery sparkle grows in about one garden visit in three.
export function sparkleAppears(rng = Math.random) {
  return rng() < SPARKLE_CHANCE;
}
