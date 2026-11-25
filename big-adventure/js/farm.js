// The farm: where every ingredient comes from. (It used to be a magic garden.)
// Rules only; the pictures are art.js source(id, state) and the screen is
// screens/garden.js.

import { FOODS } from './data.js';

// At most this many sources the order does not need are shown beside the ones it does.
export const EXTRA_SOURCES = 2;

// Source id -> its name, the ingredient ids it gives, and the sound it makes
// when tapped (audio.js). No food needs two things from the same source, so
// one tap on a source can only ever mean one thing. The cheese crater is on
// the moon.
export const SOURCES = {
  cow: { name: 'Cow', gives: ['milk', 'cheese'], sound: 'moo' },
  wheat: { name: 'Wheat field', gives: ['flour', 'dough'], sound: 'rustle' },
  vines: { name: 'Tomato vines', gives: ['tomato'], sound: 'pluck' },
  'orange-tree': { name: 'Orange tree', gives: ['orange'], sound: 'rustle' },
  'lemon-tree': { name: 'Lemon tree', gives: ['lemon'], sound: 'rustle' },
  'mango-tree': { name: 'Mango tree', gives: ['mango'], sound: 'rustle' },
  'berry-bush': { name: 'Berry bush', gives: ['berry'], sound: 'pluck' },
  'tea-bush': { name: 'Tea bush', gives: ['tea-leaf'], sound: 'pluck' },
  'coffee-bush': { name: 'Coffee bush', gives: ['bean'], sound: 'pluck' },
  pond: { name: 'Pond', gives: ['fish'], sound: 'splash' },
  cart: { name: 'Pantry cart', gives: ['sprinkles', 'pasta', 'crust', 'boba', 'bread'], sound: 'ding' },
  crater: { name: 'Cheese crater', gives: ['moon-cheese'], sound: 'boing' },
};

const ORDER = Object.keys(SOURCES);
const idOf = need => (need !== null && typeof need === 'object' ? need.id : need);
const list = value => (Array.isArray(value) ? value : []);

// The source an ingredient comes from, or null if nothing gives it.
export function sourceOf(ingredientId) {
  return ORDER.find(s => SOURCES[s].gives.includes(ingredientId)) ?? null;
}

const sourcesFor = needs => [...new Set(list(needs).map(n => sourceOf(idOf(n))).filter(Boolean))];

// The sources to show on one visit: every one the order needs, plus up to
// EXTRA_SOURCES others that the player's own recipes use (so nothing unknown
// turns up, and the cheese crater is only seen once moon cheese toast is owned).
// `needed`: the order's ingredients (ids, or the recipe's { id, count } list).
// `owned`: the food ids the player has recipes for.
// Returned in the farm's own order, so the farm does not jump about; never
// more than five.
export function pickSources(needed, owned, rng = Math.random) {
  const must = sourcesFor(needed);
  const known = sourcesFor(list(owned).filter(f => Object.hasOwn(FOODS, f)).flatMap(f => FOODS[f].ingredients));
  const others = known.filter(s => !must.includes(s));
  const extra = [];
  while (extra.length < EXTRA_SOURCES && others.length) {
    extra.push(...others.splice(Math.min(others.length - 1, Math.floor(rng() * others.length)), 1));
  }
  return ORDER.filter(s => must.includes(s) || extra.includes(s));
}

// The golden ingredient of a golden order comes from the source of the first
// needed ingredient: that source glows gold. Null if nothing needed has a source.
export function goldenSource(needs) {
  return sourcesFor(needs)[0] ?? null;
}
