// Where the adventure has got to, and what each place brings.

import { CHAPTERS, FOODS, FOOD_ORDER, MONSTERS, UPGRADES, LAST_CHAPTER } from './data.js';

// The chapter the game is in. A game with an odd chapter is in chapter 1.
export function chapterOf(game) {
  return CHAPTERS.find(c => c.id === game?.chapter) ?? CHAPTERS[0];
}

const soFar = game => CHAPTERS.filter(c => c.id <= chapterOf(game).id);
const listed = (game, key) => (Array.isArray(game?.[key]) ? game[key] : []);

export function hasUpgrade(game, id) {
  return listed(game, 'upgrades').includes(id);
}

// The monsters who can come and eat: everyone met in the chapters so far.
// Monsters travel along; they never leave.
export function monstersHere(game) {
  return soFar(game).flatMap(c => c.monsters).filter(m => Object.hasOwn(MONSTERS, m));
}

// Recipes the shop can sell: any from the chapters so far that are not owned.
// A gift food (moon cheese toast) is never for sale: it is given on arrival.
export function foodsForSale(game) {
  return soFar(game).flatMap(c => c.foods).filter(f => Object.hasOwn(FOODS, f) && !FOODS[f].gift && !listed(game, 'owned').includes(f));
}

// The recipes a game in chapter `chapterId` owns, given the list it has:
// orange juice always, a gift food once its chapter is reached (and not
// before), everything in menu order. Used on arriving and on loading a save,
// so the moon always has its own food.
export function ownedAt(owned, chapterId) {
  const has = Array.isArray(owned) ? owned : [];
  const gift = f => FOODS[f].gift === true;
  const reached = f => CHAPTERS.some(c => c.id <= chapterId && c.foods.includes(f));
  return FOOD_ORDER.filter(f => f === 'orange-juice' || (gift(f) ? reached(f) : has.includes(f)));
}

// Upgrades the shop can sell, in the same way.
export function upgradesForSale(game) {
  return soFar(game).flatMap(c => c.upgrades).filter(u => Object.hasOwn(UPGRADES, u) && !hasUpgrade(game, u));
}

const goalMet = game => Number.isFinite(game?.plates) && game.plates >= chapterOf(game).goal;

// The player may travel on once this chapter's plates are done. It is their
// choice when; staying a while loses nothing.
export function canTravel(game) {
  return goalMet(game) && chapterOf(game).id < LAST_CHAPTER;
}

// Go to the next place. Coins, plates, recipes, upgrades and monsters all come
// along. Nothing changes if travelling is not allowed.
// A screen should pass `from`, the chapter its travel button was drawn for:
// then a double tap travels only once, even with plates to spare.
// Arriving on the moon, the moon monster's gift (the moon cheese toast recipe)
// is owned at once.
export function travel(game, from = game?.chapter) {
  if (!canTravel(game) || from !== game.chapter) return game;
  const chapter = game.chapter + 1;
  return { ...game, chapter, owned: ownedAt(game.owned, chapter) };
}

// The bet is won: the last chapter, and all 80 plates. Play carries on.
export function wonBet(game) {
  return chapterOf(game).id === LAST_CHAPTER && goalMet(game);
}
// The old name from step 1, kept for the screens that use it.
export const finishedStep = wonBet;

// The place to draw ('cart', 'cafe', 'train', 'boat' or 'moon'). After the
// bet is won the player may pick any of the five on the Map (`game.visit`, a
// chapter id); until then it is always the current chapter's place.
export function placeOf(game) {
  const visiting = wonBet(game) ? CHAPTERS.find(c => c.id === game.visit) : null;
  return (visiting ?? chapterOf(game)).place;
}

// A monster's name. The moon monster goes by the name the player gave it.
// Plain text typed by the player: escape it before it reaches HTML.
export function monsterName(id, game) {
  if (typeof id !== 'string' || !Object.hasOwn(MONSTERS, id)) return '';
  const given = typeof game?.moonName === 'string' ? game.moonName.trim() : '';
  return id === 'moon' && given ? given : MONSTERS[id].name;
}
