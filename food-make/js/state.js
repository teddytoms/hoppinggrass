import { FOODS, FOOD_ORDER, MONSTERS, DAYS, DAY_LENGTH, DECOR, DECOR_ORDER, STICKERS } from './data.js';

// The save keeps its first name so games saved by version 1 still load.
const KEY = 'food-make-v1';

const newDay = (n = 1, kind = 'ordinary') => ({ n, kind, served: 0, sold: {}, who: [], paid: 0, cost: 0, tips: 0 });

export function newGame() {
  return {
    money: 0, best: 0, owned: ['orange-juice'], muted: false, orderSeq: 0, lastPaidSeq: -1,
    day: newDay(),      // today: how many monsters were served and what came in
    lastSpecial: null,  // the last special kind of day, so it is not repeated at once
    bestDay: 0,         // the most money kept in one day
    decor: [],          // decorations owned
    spots: {},          // decoration id -> which of its places it hangs in
    goal: null,         // what the player is saving for (a recipe or decoration id)
    stickers: [],
    // Things counted for the sticker book.
    counts: { sold: {}, tips: 0, met: [], days: 0, flags: [] },
  };
}

const addOnce = (list, x) => (list.includes(x) ? list : [...list, x]);
const bump = (tally, key, by = 1) => ({ ...tally, [key]: (tally[key] ?? 0) + by });

// Pay for the current order. Money kept is what the monster pays (plus any
// tip) minus what the food cost to make, and the piggy bank never goes below $0.
// Each order pays only once, however many times this is called.
// extra: { tip, monsterId, kind } - kind is the monster's reaction.
export function sell(game, foodId, pays, extra = {}) {
  if (game.orderSeq === game.lastPaidSeq) return game;
  const { tip = 0, monsterId = null, kind = 'happy' } = extra;
  const cost = FOODS[foodId].cost;
  const money = Math.max(0, game.money + pays + tip - cost);
  const d = game.day, c = game.counts;
  let flags = c.flags;
  if (monsterId === 'bella' && kind === 'love') flags = addOnce(flags, 'bella-love');
  if (d.kind === 'hot' && DAYS.hot.foods.includes(foodId)) flags = addOnce(flags, 'hot-drink');
  return {
    ...game, money, best: Math.max(game.best, money), lastPaidSeq: game.orderSeq,
    day: { ...d, served: Math.min(DAY_LENGTH, d.served + 1), sold: bump(d.sold, foodId), who: monsterId ? addOnce(d.who, monsterId) : d.who, paid: d.paid + pays, cost: d.cost + cost, tips: d.tips + tip },
    counts: { ...c, sold: bump(c.sold, foodId), tips: c.tips + (tip > 0 ? 1 : 0), met: monsterId ? addOnce(c.met, monsterId) : c.met, flags },
  };
}

// Remember that something happened once, for the sticker book.
export function note(game, flag) {
  if (game.counts.flags.includes(flag)) return game;
  return { ...game, counts: { ...game.counts, flags: [...game.counts.flags, flag] } };
}

export function nextOrderSeq(game) {
  return { ...game, orderSeq: game.orderSeq + 1 };
}

/* ---------- Days ---------- */

export function dayOver(game) {
  return game.day.served >= DAY_LENGTH;
}

// What the player kept today: paid minus cost plus tips, never shown below $0.
export function dayKept(game) {
  return Math.max(0, game.day.paid + game.day.tips - game.day.cost);
}

// Close today and open tomorrow. Does nothing unless today is finished, so a
// double tap on "New day" passes only one day.
export function endDay(game, nextKind) {
  if (!dayOver(game)) return game;
  const kind = Object.hasOwn(DAYS, nextKind) ? nextKind : 'ordinary';
  return {
    ...game,
    bestDay: Math.max(game.bestDay, dayKept(game)),
    counts: { ...game.counts, days: game.counts.days + 1 },
    day: newDay(game.day.n + 1, kind),
    lastSpecial: kind === 'ordinary' ? game.lastSpecial : kind,
  };
}

/* ---------- Recipes ---------- */

// The next recipe the shop will sell: the first one not owned yet.
export function nextRecipe(game) {
  return FOOD_ORDER.find(f => !game.owned.includes(f)) ?? null;
}

export function canBuy(game, foodId) {
  return nextRecipe(game) === foodId && game.money >= FOODS[foodId].recipePrice;
}

export function buy(game, foodId) {
  if (!canBuy(game, foodId)) return game;
  return { ...game, money: game.money - FOODS[foodId].recipePrice, owned: [...game.owned, foodId] };
}

/* ---------- Decorations and the monsters they bring ---------- */

export function canBuyDecor(game, id) {
  return Object.hasOwn(DECOR, id) && !game.decor.includes(id) && game.money >= DECOR[id].price;
}

export function buyDecor(game, id) {
  if (!canBuyDecor(game, id)) return game;
  return { ...game, money: game.money - DECOR[id].price, decor: DECOR_ORDER.filter(d => d === id || game.decor.includes(d)) };
}

// Tapping a decoration moves it to its next place.
export function moveDecor(game, id) {
  if (!game.decor.includes(id)) return game;
  return { ...game, spots: { ...game.spots, [id]: ((game.spots[id] ?? 0) + 1) % DECOR[id].spots } };
}

// The monsters who can come and eat: Ella and Bella, and anyone whose decoration is up.
export function monstersHere(game) {
  return Object.keys(MONSTERS).filter(m => !MONSTERS[m].needs || game.decor.includes(MONSTERS[m].needs));
}

/* ---------- The saving goal ---------- */

const forSale = (game, id) => id === nextRecipe(game) || (Object.hasOwn(DECOR, id) && !game.decor.includes(id));
const describe = id => (Object.hasOwn(DECOR, id)
  ? { id, kind: 'decor', name: DECOR[id].name, price: DECOR[id].price }
  : { id, kind: 'food', name: FOODS[id].name, price: FOODS[id].recipePrice });

// What the piggy bank is saving for: the player's own choice while it can
// still be bought, otherwise the next recipe, otherwise the cheapest
// decoration left. Null when everything is owned.
export function goalOf(game) {
  if (game.goal && forSale(game, game.goal)) return describe(game.goal);
  const id = nextRecipe(game) ?? DECOR_ORDER.find(d => !game.decor.includes(d));
  return id ? describe(id) : null;
}

export function setGoal(game, id) {
  return forSale(game, id) ? { ...game, goal: id } : game;
}

/* ---------- Saving ---------- */

// Even looking at localStorage can fail when the browser blocks it, so the
// default storage is fetched inside the try.
export function save(game, storage, key = KEY) {
  try {
    storage ??= globalThis.localStorage;
    storage.setItem(key, JSON.stringify(game));
  } catch {
    // Saving is blocked (for example private browsing). The game still plays.
  }
}

const isAmount = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const isCount = n => Number.isInteger(n) && n >= 0;
const isSeq = n => Number.isInteger(n) && n >= -1;
const isObject = o => o !== null && typeof o === 'object' && !Array.isArray(o);
const listOf = (value, allowed) => allowed.filter(x => Array.isArray(value) && value.includes(x));
// A tally of foods: only real foods with whole, positive counts.
const tallyOf = value => Object.fromEntries(FOOD_ORDER.filter(f => isObject(value) && isCount(value[f]) && value[f] > 0).map(f => [f, value[f]]));

function loadDay(d) {
  if (!isObject(d) || !isCount(d.n) || d.n < 1 || !Object.hasOwn(DAYS, d.kind) || !isCount(d.served)
    || !isAmount(d.paid) || !isAmount(d.cost) || !isAmount(d.tips)) return newDay();
  return { n: d.n, kind: d.kind, served: Math.min(DAY_LENGTH, d.served), sold: tallyOf(d.sold), who: listOf(d.who, Object.keys(MONSTERS)), paid: d.paid, cost: d.cost, tips: d.tips };
}

function loadCounts(c) {
  if (!isObject(c)) return newGame().counts;
  return {
    sold: tallyOf(c.sold),
    tips: isCount(c.tips) ? c.tips : 0,
    met: listOf(c.met, Object.keys(MONSTERS)),
    days: isCount(c.days) ? c.days : 0,
    flags: Array.isArray(c.flags) ? [...new Set(c.flags.filter(f => typeof f === 'string'))] : [],
  };
}

// Load the saved game. Anything missing, broken or odd gives a fresh game;
// a game saved by version 1 keeps its money and recipes and gets a fresh
// start for everything that is new.
export function load(storage, key = KEY) {
  try {
    storage ??= globalThis.localStorage;
    const g = JSON.parse(storage.getItem(key));
    const ok = g && typeof g === 'object' && isAmount(g.money) && isAmount(g.best)
      && Array.isArray(g.owned) && g.owned.includes('orange-juice')
      && g.owned.every(f => FOOD_ORDER.includes(f));
    if (!ok) return newGame();
    const fresh = newGame();
    const decor = listOf(g.decor, DECOR_ORDER);
    const spots = Object.fromEntries(decor
      .filter(d => isObject(g.spots) && isCount(g.spots[d]) && g.spots[d] > 0 && g.spots[d] < DECOR[d].spots)
      .map(d => [d, g.spots[d]]));
    const game = {
      money: g.money,
      best: Math.max(g.best, g.money),
      owned: FOOD_ORDER.filter(f => g.owned.includes(f)),
      muted: g.muted === true,
      orderSeq: isSeq(g.orderSeq) ? g.orderSeq : fresh.orderSeq,
      lastPaidSeq: isSeq(g.lastPaidSeq) ? g.lastPaidSeq : fresh.lastPaidSeq,
      day: loadDay(g.day),
      lastSpecial: Object.hasOwn(DAYS, g.lastSpecial ?? "") && g.lastSpecial !== 'ordinary' ? g.lastSpecial : null,
      bestDay: isAmount(g.bestDay) ? g.bestDay : 0,
      decor,
      spots,
      goal: null,
      stickers: listOf(g.stickers, STICKERS.map(s => s.id)),
      counts: loadCounts(g.counts),
    };
    if (typeof g.goal === 'string' && forSale(game, g.goal)) game.goal = g.goal;
    return game;
  } catch {
    return newGame();
  }
}
