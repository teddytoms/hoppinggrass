import { FOODS, DAYS, DAY_FOOD_CHANCE, SPARKLE_CHANCE, RUSH_LENGTH, BIG_ORDER, BUBBLES_ORDER } from './data.js';
import { monstersHere, hasUpgrade } from './chapters.js';
import { nextSurprise } from './surprises.js';

const pick = (list, rng) => list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
const SPECIAL = Object.keys(DAYS).filter(k => k !== 'ordinary');

// The recipes the player can cook. There is always orange juice.
function recipes(game) {
  const owned = Array.isArray(game?.owned) ? game.owned.filter(f => Object.hasOwn(FOODS, f)) : [];
  return owned.length ? owned : ['orange-juice'];
}

// How many foods a big order is: 3, or 4 with the bubble machine.
export function bigOrderSize(game) {
  return hasUpgrade(game, 'bubbles') ? BUBBLES_ORDER : BIG_ORDER;
}

// The very first order of a new game teaches the five steps, so it is always
// the same and always plain: Ella, orange juice, no surprise.
export const FIRST_ORDER = Object.freeze({ monsterId: 'ella', foodId: 'orange-juice', surprise: null });
const isFirstOrder = game => (game?.orderSeq ?? 0) === 0 && game?.taught !== true;

// The surprise that comes with the next order, with everything the screens
// need to know about it. A lunch rush that has begun carries on until its
// orders are used up (or the player says "Not today": see skipRush in state.js).
function surpriseFor(game, monsterId, rng) {
  const before = game?.order?.surprise;
  if (before?.kind === 'rush' && before.left > 1) return { kind: 'rush', left: before.left - 1 };
  switch (nextSurprise(game, rng)) {
    case 'rush': return { kind: 'rush', left: RUSH_LENGTH };
    case 'mystery': return { kind: 'mystery', who: monsterId }; // the monster under the hat
    case 'big': return { kind: 'big', count: bigOrderSize(game) };
    case 'golden': return { kind: 'golden' };
    case 'critic': return { kind: 'critic' };
    default: return null;
  }
}

// Which monster sits down, what it asks for, and any surprise.
// Monsters only ever ask for foods the player has the recipe for.
// On a special day most orders are for one of the day's foods.
// The first order of a new game is always FIRST_ORDER.
// `monsterId` is always a real monster: the mystery guest is that monster in
// disguise, and the critic has that monster's tastes and prices.
// The mystery guest asks with FOODS[foodId].riddle, not the food's picture.
export function pickOrder(game, rng = Math.random) {
  if (isFirstOrder(game)) return { ...FIRST_ORDER };
  const owned = recipes(game);
  const monsterId = pick(monstersHere(game), rng);
  const dayKind = game?.day?.kind;
  const dayFoods = (Object.hasOwn(DAYS, dayKind ?? '') ? DAYS[dayKind] : DAYS.ordinary).foods.filter(f => owned.includes(f));
  const foods = dayFoods.length && rng() < DAY_FOOD_CHANCE ? dayFoods : owned;
  const foodId = pick(foods, rng);
  return { monsterId, foodId, surprise: surpriseFor(game, monsterId, rng) };
}

// What kind of day comes next: ordinary one time in three, otherwise a special
// day the player can cook for, and not the same special day twice running
// when another one is possible.
export function pickDayKind(game, rng = Math.random) {
  // The umbrella makes rainy days worth having even before the rainy-day foods are owned.
  const umbrella = Array.isArray(game.upgrades) && game.upgrades.includes('umbrella');
  const possible = SPECIAL.filter(k => DAYS[k].foods.some(f => game.owned.includes(f)) || (k === 'rainy' && umbrella));
  if (!possible.length || rng() < 1 / 3) return 'ordinary';
  const fresh = possible.filter(k => k !== game.lastSpecial);
  return pick(fresh.length ? fresh : possible, rng);
}

// The mystery sparkle grows in about one garden visit in three.
export function sparkleAppears(rng = Math.random) {
  return rng() < SPARKLE_CHANCE;
}
