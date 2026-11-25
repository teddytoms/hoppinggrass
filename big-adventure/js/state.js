import { FOODS, FOOD_ORDER, MONSTERS, DAYS, DAY_LENGTH, UPGRADES, CHAPTERS, LAST_CHAPTER, RUSH_LENGTH, BIG_ORDER, BUBBLES_ORDER } from './data.js';
import { foodsForSale, upgradesForSale, ownedAt, wonBet } from './chapters.js';
import { rainBonus, costOf } from './economy.js';
import { feed } from './friends.js';
import { SURPRISES } from './surprises.js';

// This game's own save. Food Make lives on the same website and so shares the
// same storage: never read or write a `food-make` key from here.
const KEY = 'big-adventure-v1';

export const MOON_NAME_LENGTH = 12;

const newDay = (n = 1, kind = 'ordinary') => ({ n, kind, served: 0, sold: {}, who: [], paid: 0, cost: 0, tips: 0, plates: 0 });

export function newGame() {
  return {
    money: 0, best: 0, owned: ['orange-juice'], muted: false, orderSeq: 0, lastPaidSeq: -1,
    order: null,        // the order being made: { monsterId, foodId, surprise }, kept so a reload carries on
    day: newDay(),      // today: how many monsters were served and what came in
    lastSpecial: null,  // the last special kind of day, so it is not repeated at once
    bestDay: 0,         // the most money kept in one day
    chapter: 1,         // which place the adventure has reached (data.js CHAPTERS)
    plates: 0,          // happy plates served, the big counter; it only ever goes up
    upgrades: [],       // upgrade ids owned
    comicsSeen: [],     // comic ids already read
    sinceSurprise: 0,   // ordinary orders since the last surprise
    lastSurprise: null, // the last kind of surprise, so it is not repeated at once
    criticDone: [],     // chapters whose critic has already come
    moonName: '',       // the name the player gives the moon monster (chapter 5)
    counts: { sold: {}, tips: 0, met: [], days: 0, favs: [] }, // things counted over the whole game; favs: monsters whose favourite food has been found out
    friends: {},        // monster id -> happy visits (friends.js); hearts come from this and never go down
    gifts: [],          // monsters whose thank-you gift has been given
    taught: false,      // true once the first order is sold: the teaching arrows are done
    spoon: false,       // true once the Golden Spoon card has been seen (after the last comic)
    visit: null,        // after the bet is won: the chapter (1 to 5) picked on the Map, or null
  };
}

const addOnce = (list, x) => (list.includes(x) ? list : [...list, x]);
const bump = (tally, key, by = 1) => ({ ...tally, [key]: (tally[key] ?? 0) + by });

const isAmount = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const isCount = n => Number.isInteger(n) && n >= 0;
const isSeq = n => Number.isInteger(n) && n >= -1;
const isObject = o => o !== null && typeof o === 'object' && !Array.isArray(o);
const listOf = (value, allowed) => allowed.filter(x => Array.isArray(value) && value.includes(x));

/* ---------- Orders ---------- */

// An order as the rest of the game may rely on it, or null if it makes no
// sense: a real monster and a food the player can cook. A surprise that makes
// no sense is dropped and the order stays, as an ordinary one.
function cleanOrder(order, owned) {
  if (!isObject(order) || !Object.hasOwn(MONSTERS, order.monsterId ?? '') || !owned.includes(order.foodId)
    || !Object.hasOwn(FOODS, order.foodId)) return null;
  const { monsterId, foodId } = order;
  const s = isObject(order.surprise) ? order.surprise : {};
  let surprise = null;
  if (s.kind === 'rush' && Number.isInteger(s.left) && s.left >= 1 && s.left <= RUSH_LENGTH) surprise = { kind: 'rush', left: s.left };
  else if (s.kind === 'mystery' && s.who === monsterId) surprise = { kind: 'mystery', who: monsterId };
  else if (s.kind === 'big' && (s.count === BIG_ORDER || s.count === BUBBLES_ORDER)) surprise = { kind: 'big', count: s.count };
  else if (s.kind === 'golden' || s.kind === 'critic') surprise = { kind: s.kind };
  return { monsterId, foodId, surprise };
}

// The order still being made (asked for but not paid), or null when it is
// time for a new monster. After a reload this is how the game carries on.
export function orderWaiting(game) {
  return game.order && game.orderSeq !== game.lastPaidSeq ? game.order : null;
}

// A monster sits down with `order` (from pickOrder in orders.js). The order is
// remembered and its surprise, if any, is counted. While an order is still
// waiting to be paid nothing happens, so a double tap starts one order and
// one surprise.
export function startOrder(game, order) {
  if (orderWaiting(game)) return game;
  const clean = cleanOrder(order, game.owned);
  if (!clean || (order.surprise != null && !clean.surprise)) return game;
  const kind = clean.surprise?.kind ?? null;
  return {
    ...game,
    orderSeq: game.orderSeq + 1,
    order: clean,
    sinceSurprise: kind ? 0 : game.sinceSurprise + 1,
    lastSurprise: kind ?? game.lastSurprise,
    criticDone: kind === 'critic' ? [...new Set([...game.criticDone, game.chapter])].sort((a, b) => a - b) : game.criticDone,
  };
}

// "Not today": the lunch rush is called off. The monster at the table stays
// and pays as normal; nothing is lost.
export function skipRush(game) {
  if (game.order?.surprise?.kind !== 'rush') return game;
  return { ...game, order: { ...game.order, surprise: null } };
}

// Kept for code that counts orders itself. Screens should use startOrder.
export function nextOrderSeq(game) {
  return { ...game, orderSeq: game.orderSeq + 1 };
}

/* ---------- Selling ---------- */

// Pay for the current order. Money kept is what the monster pays (plus any
// tip) minus what the food cost to make, and the coins never go below $0.
// Each order pays only once, however many times this is called.
// extra: { tip, monsterId, kind, plates, count }
// - kind is the monster's reaction;
// - plates (from platesFor in plates.js) are added to the big counter and to today's;
// - count is how many were sold at once (a big order: 3 or 4). `pays` is the
//   price of one: it and the food's cost are multiplied by count, the tip is not.
// With the umbrella, a rainy day adds its bonus to every sale here, so the
// caller must not add it to `pays`. The food's cost is costOf (the fishing net).
// A happy (or love) sale also, once per order like the money:
// - sets `taught` (the first order is done);
// - gives the monster one happy visit towards its hearts (friends.js feed),
//   and remembers when it has had its favourite food. A big order is one
//   visit. The mystery guest counts (pass the monster under the hat, as the
//   order's monsterId already is); the critic does not, since nobody knows
//   who the critic is.
export function sell(game, foodId, pays, extra = {}) {
  if (game.orderSeq === game.lastPaidSeq || !Object.hasOwn(FOODS, foodId)) return game;
  const { tip = 0, monsterId = null, kind = 'happy' } = extra;
  const count = Number.isInteger(extra.count) && extra.count >= 1 ? extra.count : 1;
  const plates = isCount(extra.plates) ? extra.plates : 0;
  const paid = (pays + rainBonus(game)) * count;
  const cost = costOf(foodId, game) * count;
  const money = Math.max(0, game.money + paid + tip - cost);
  const d = game.day, c = game.counts;
  const happy = kind === 'happy' || kind === 'love';
  const critic = orderWaiting(game)?.surprise?.kind === 'critic';
  const friend = happy && !critic && typeof monsterId === 'string' && Object.hasOwn(MONSTERS, monsterId) ? monsterId : null;
  const favs = Array.isArray(c.favs) ? c.favs : [];
  const paidGame = {
    ...game, money, best: Math.max(game.best, money), lastPaidSeq: game.orderSeq,
    taught: game.taught === true || happy,
    plates: game.plates + plates,
    day: { ...d, served: Math.min(DAY_LENGTH, d.served + 1), sold: bump(d.sold, foodId, count), who: monsterId ? addOnce(d.who, monsterId) : d.who,
      paid: d.paid + paid, cost: d.cost + cost, tips: d.tips + tip, plates: d.plates + plates },
    counts: { ...c, sold: bump(c.sold, foodId, count), tips: c.tips + (tip > 0 ? 1 : 0), met: monsterId ? addOnce(c.met, monsterId) : c.met,
      favs: friend && MONSTERS[friend].favourite === foodId ? addOnce(favs, friend) : favs },
  };
  return friend ? feed(paidGame, friend) : paidGame;
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

/* ---------- The shop: recipes and upgrades ---------- */

// Any recipe from the chapters so far can be bought, in any order.
export function canBuy(game, foodId) {
  return foodsForSale(game).includes(foodId) && game.money >= FOODS[foodId].recipePrice;
}

export function buy(game, foodId) {
  if (!canBuy(game, foodId)) return game;
  return { ...game, money: game.money - FOODS[foodId].recipePrice, owned: FOOD_ORDER.filter(f => f === foodId || game.owned.includes(f)) };
}

export function canBuyUpgrade(game, id) {
  return upgradesForSale(game).includes(id) && game.money >= UPGRADES[id].price;
}

export function buyUpgrade(game, id) {
  if (!canBuyUpgrade(game, id)) return game;
  return { ...game, money: game.money - UPGRADES[id].price, upgrades: Object.keys(UPGRADES).filter(u => u === id || game.upgrades.includes(u)) };
}

/* ---------- Comics and the moon monster ---------- */

const isComicId = id => typeof id === 'string' && /^[a-z0-9-]{1,30}$/.test(id);

// Remember that a comic has been read, so it is not shown again by itself.
export function seeComic(game, id) {
  if (!isComicId(id) || game.comicsSeen.includes(id)) return game;
  return { ...game, comicsSeen: [...game.comicsSeen, id] };
}

const tidyName = name => (typeof name === 'string' ? name.trim().slice(0, MOON_NAME_LENGTH).trim() : '');

export function setMoonName(game, name) {
  return { ...game, moonName: tidyName(name) };
}

/* ---------- The Map (after the bet is won) ---------- */

// Cook in any of the five places. Only once the bet is won, and only for a
// real chapter (1 to 5); anything else changes nothing.
export function setVisit(game, chapterId) {
  if (!wonBet(game) || !CHAPTERS.some(c => c.id === chapterId) || game.visit === chapterId) return game;
  return { ...game, visit: chapterId };
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

// A tally of foods: only real foods with whole, positive counts.
const tallyOf = value => Object.fromEntries(FOOD_ORDER.filter(f => isObject(value) && isCount(value[f]) && value[f] > 0).map(f => [f, value[f]]));

function loadDay(d) {
  if (!isObject(d) || !isCount(d.n) || d.n < 1 || !Object.hasOwn(DAYS, d.kind) || !isCount(d.served)
    || !isAmount(d.paid) || !isAmount(d.cost) || !isAmount(d.tips)) return newDay();
  return { n: d.n, kind: d.kind, served: Math.min(DAY_LENGTH, d.served), sold: tallyOf(d.sold), who: listOf(d.who, Object.keys(MONSTERS)),
    paid: d.paid, cost: d.cost, tips: d.tips, plates: isCount(d.plates) ? d.plates : 0 };
}

function loadCounts(c) {
  if (!isObject(c)) return newGame().counts;
  return {
    sold: tallyOf(c.sold),
    tips: isCount(c.tips) ? c.tips : 0,
    met: listOf(c.met, Object.keys(MONSTERS)),
    days: isCount(c.days) ? c.days : 0,
    favs: listOf(c.favs, Object.keys(MONSTERS)),
  };
}

// Happy visits: only real monsters, whole numbers from 1 to 999.
const MOST_VISITS = 999;
const loadFriends = f => Object.fromEntries(Object.keys(MONSTERS).filter(m => isObject(f) && isCount(f[m]) && f[m] > 0).map(m => [m, Math.min(MOST_VISITS, f[m])]));

// Load the saved game. Nothing saved, or something that is not a game at all,
// gives a fresh game. Otherwise every part is checked on its own: a part that
// is missing (an older save) or damaged gets its fresh-game value, so what
// loads is always a game that can be played.
export function load(storage, key = KEY) {
  try {
    storage ??= globalThis.localStorage;
    const g = JSON.parse(storage.getItem(key));
    if (!isObject(g)) return newGame();
    const money = isAmount(g.money) ? g.money : 0;
    const count = n => (isCount(n) ? n : typeof n === 'string' && /^\d{1,6}$/.test(n) ? Number(n) : 0);
    const fresh = newGame();
    // A chapter past the end (a damaged save) is the last one.
    const chapter = Number.isInteger(g.chapter) && g.chapter >= 1 ? Math.min(g.chapter, LAST_CHAPTER) : 1;
    // On the moon the moon monster's gift recipe is always owned.
    const owned = ownedAt(g.owned, chapter);
    const plates = count(g.plates);
    const lastPaidSeq = isSeq(g.lastPaidSeq) ? g.lastPaidSeq : fresh.lastPaidSeq;
    return {
      money,
      best: isAmount(g.best) ? Math.max(g.best, money) : money,
      owned,
      muted: g.muted === true,
      orderSeq: isSeq(g.orderSeq) ? g.orderSeq : fresh.orderSeq,
      lastPaidSeq,
      order: cleanOrder(g.order, owned),
      day: loadDay(g.day),
      lastSpecial: Object.hasOwn(DAYS, g.lastSpecial ?? '') && g.lastSpecial !== 'ordinary' ? g.lastSpecial : null,
      bestDay: isAmount(g.bestDay) ? g.bestDay : 0,
      chapter,
      plates,
      upgrades: listOf(g.upgrades, Object.keys(UPGRADES)),
      comicsSeen: Array.isArray(g.comicsSeen) ? [...new Set(g.comicsSeen.filter(isComicId))].slice(0, 60) : [],
      sinceSurprise: isCount(g.sinceSurprise) ? g.sinceSurprise : 0,
      lastSurprise: SURPRISES.includes(g.lastSurprise) ? g.lastSurprise : null,
      criticDone: listOf(g.criticDone, CHAPTERS.map(c => c.id)),
      moonName: tidyName(g.moonName),
      counts: loadCounts(g.counts),
      friends: loadFriends(g.friends),
      gifts: listOf(g.gifts, Object.keys(MONSTERS)),
      // A save from before the teaching order existed has plainly been taught.
      taught: g.taught === true || lastPaidSeq >= 0 || plates > 0 || chapter > 1,
      spoon: g.spoon === true,
      visit: wonBet({ chapter, plates }) && CHAPTERS.some(c => c.id === g.visit) ? g.visit : null,
    };
  } catch {
    return newGame();
  }
}
