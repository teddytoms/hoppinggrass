// Friends: what each monster is like, its three hearts and its thank-you gift,
// and what Victoria says. Rules and words only; no drawing here.
// Every text here is plain text. A screen must escape it before it reaches
// HTML: the chef's name and the moon monster's name are typed by the player.

import { MONSTERS, FOODS, UPGRADES, PLATES_TO_WIN } from './data.js';
import { chapterOf, canTravel, wonBet, foodsForSale, upgradesForSale, monstersHere, monsterName, hasUpgrade } from './chapters.js';

// Happy visits needed for the first, second and third heart.
export const HEART_STEPS = [1, 3, 5];
// Coins that come with a monster's thank-you gift.
export const GIFT_COINS = 10;
const MOST_VISITS = 999;

// One entry per monster.
// - hello: said the first time it sits down; back: every time after that;
//   yum: said when it is happy with its food. Very short, for a six-year-old.
//   `{name}` is the chef's name: always written as ", {name}" so that the line
//   still reads well with no name (see fill).
// - fact: the fact card that opens with full hearts.
// - keepsake: the present it gives then; `id` is the picture (art.js item).
// - trait: a few words under its picture on the Friends page.
export const FRIENDS = {
  ella: {
    hello: 'Hi, {name}! I am Ella. CHOMP!',
    back: 'I am back, {name}! Chomp chomp!',
    yum: 'Yum! My teeth are so happy!',
    fact: 'Ella brushes her big teeth three times a day.',
    keepsake: { id: 'gift-ella', name: 'A daisy' },
    trait: 'Big teeth, big smile',
  },
  bella: {
    hello: 'Hello, {name}! My tag says Bella.',
    back: 'It is me again, {name}! Bella!',
    yum: 'Yummy! A big hug for you!',
    fact: 'Bella wears her name tag even in the bath.',
    keepsake: { id: 'gift-bella', name: 'A name badge' },
    trait: 'Never forgets a name',
  },
  twinkle: {
    hello: 'Good day, {name}. I am Twinkle.',
    back: 'I have returned, {name}. How fancy!',
    yum: 'Oh my! My crown did a wiggle!',
    fact: 'Twinkle made the crown at home, with glue and glitter.',
    keepsake: { id: 'gift-twinkle', name: 'A paper crown' },
    trait: 'A little bit fancy',
  },
  fife: {
    hello: 'Hi, {name}! I am Fife. Down here!',
    back: 'Peep! I came back, {name}!',
    yum: 'Tiny me, big yum!',
    fact: 'Fife is small enough to nap in a teacup.',
    keepsake: { id: 'gift-fife', name: 'A tiny bow' },
    trait: 'Tiny, with a big bow',
  },
  ghuy: {
    hello: 'HELLO, {name}! I AM GHUY! HA HA!',
    back: 'GUESS WHO, {name}! IT IS GHUY!',
    yum: 'YUM! HA HA! SO GOOD!',
    fact: 'Ghuy laughs so loudly that the birds laugh too.',
    keepsake: { id: 'gift-ghuy', name: 'A zigzag scarf' },
    trait: 'Loud and jolly',
  },
  gege: {
    hello: 'Hi, {name}! I am Gege. Splish splash!',
    back: 'Boing! Gege is here again, {name}!',
    yum: 'Yum yum in my melon tum!',
    fact: 'Gege counts watermelon seeds to fall asleep.',
    keepsake: { id: 'gift-gege', name: 'A watermelon slice' },
    trait: 'Silly as a melon',
  },
  moon: {
    hello: 'Oh! Um. Hello, {name}. Boing!',
    back: 'Boing! It is you, {name}! Hooray!',
    yum: 'So good I bounced! Boing!',
    fact: 'This shy friend can bounce right over a crater.',
    keepsake: { id: 'gift-moon', name: 'A moon rock' },
    trait: 'Shy and bouncy',
  },
};

const isFriend = id => typeof id === 'string' && Object.hasOwn(FRIENDS, id) && Object.hasOwn(MONSTERS, id);
const isObject = o => o !== null && typeof o === 'object' && !Array.isArray(o);
const listed = (game, key) => (Array.isArray(game?.[key]) ? game[key] : []);

// Put the chef's name into a line. With no name, ", {name}" is taken out and
// the line still reads well: "Hi, {name}! Got pizza?" becomes "Hi! Got pizza?".
// The result is plain text, not HTML.
export function fill(line, name) {
  const chef = typeof name === 'string' ? name.trim() : '';
  const text = typeof line === 'string' ? line : '';
  return chef ? text.replaceAll('{name}', () => chef) : text.replaceAll(', {name}', '').replaceAll('{name}', '').replace(/\s+/g, ' ').trim();
}

// How many happy visits a monster has had: a whole number, 0 to 999.
export function visits(game, id) {
  const n = isFriend(id) && isObject(game?.friends) ? game.friends[id] : 0;
  return Number.isInteger(n) && n > 0 ? Math.min(MOST_VISITS, n) : 0;
}

// Hearts filled, 0 to 3. They never go down, because visits never do.
export function hearts(game, id) {
  const n = visits(game, id);
  return HEART_STEPS.filter(step => n >= step).length;
}

// One more happy visit (two with the flag). `sell` in state.js calls this once
// per paid order; screens should not call it themselves.
export function feed(game, id) {
  if (!isFriend(id)) return game;
  const n = Math.min(MOST_VISITS, visits(game, id) + (hasUpgrade(game, 'flag') ? 2 : 1));
  return { ...game, friends: { ...(isObject(game.friends) ? game.friends : {}), [id]: n } };
}

// Full hearts and the thank-you gift not given yet.
export function giftDue(game, id) {
  return isFriend(id) && hearts(game, id) === HEART_STEPS.length && !listed(game, 'gifts').includes(id);
}

// Give the gift: the keepsake goes on the shelf for good and GIFT_COINS are
// added. Once only: a second call (a double tap) changes nothing.
export function giveGift(game, id) {
  if (!giftDue(game, id)) return game;
  const money = (Number.isFinite(game.money) ? Math.max(0, game.money) : 0) + GIFT_COINS;
  return { ...game, money, best: Math.max(Number.isFinite(game.best) ? game.best : 0, money),
    gifts: Object.keys(FRIENDS).filter(m => m === id || listed(game, 'gifts').includes(m)) };
}

// What the monster says as it sits down: `hello` the first time, `back` once
// it has eaten here before. Plain text with the chef's name filled in.
export function greeting(game, id, name) {
  if (!isFriend(id)) return '';
  const before = visits(game, id) > 0 || (Array.isArray(game?.counts?.met) && game.counts.met.includes(id));
  return fill(before ? FRIENDS[id].back : FRIENDS[id].hello, name);
}

// True once that monster has been sold its favourite food and liked it.
// Remembered in the save as `counts.favs` (a list of monster ids), which
// `sell` in state.js fills in.
export function knowsFavourite(game, id) {
  return isFriend(id) && Array.isArray(game?.counts?.favs) && game.counts.favs.includes(id);
}

/* ---------- Victoria ---------- */

const CHEERS = [
  'You are a super chef!',
  'The monsters love your food!',
  'Look at all those happy plates!',
  'What a team we are!',
  'I love working with you!',
  'Your food makes everyone smile.',
  'Go, Chef, go! You can do it!',
];

const JOKES = [
  'Why did the orange stop? It ran out of juice!',
  'What is a cow\'s best subject? Moo-sic!',
  'Why did the cupcake see the doctor? It felt crumby!',
  'What does a pizza say? Slice to meet you!',
  'Why did the cow fly to space? To see the mooooon!',
  'What cheese is not yours? Nacho cheese!',
  'What do you call a sleepy pie? A nap-ple pie!',
];

// Tips that are true of the game at this moment.
function tips(game, order) {
  const out = [];
  const chapter = chapterOf(game);
  const plates = Number.isFinite(game?.plates) ? game.plates : null;
  if (wonBet(game)) out.push(`We won the bet! ${PLATES_TO_WIN} happy plates!`);
  else if (canTravel(game)) out.push('We did it here! Time to travel on!');
  else if (plates !== null && plates < chapter.goal) {
    const left = chapter.goal - plates;
    if (chapter.goal === PLATES_TO_WIN) out.push(left === 1 ? 'Just 1 more happy plate to win the bet!' : `${left} more happy plates to win the bet!`);
    else out.push(left === 1 ? 'Just 1 more happy plate here!' : `${left} more happy plates to go here!`);
  }

  // The friend at the table, unless it is in disguise (never give the guest away).
  const here = isFriend(order?.monsterId) && order.surprise == null ? order.monsterId : null;
  const friends = here ? [here] : order ? [] : monstersHere(game);
  const known = friends.filter(m => knowsFavourite(game, m) && Object.hasOwn(FOODS, MONSTERS[m].favourite));
  for (const m of known.slice(0, 2)) out.push(`${monsterName(m, game)} loves ${FOODS[MONSTERS[m].favourite].name.toLowerCase()} best!`);
  const nearly = friends.filter(m => visits(game, m) > 0 && hearts(feed(game, m), m) > hearts(game, m));
  for (const m of nearly.slice(0, 2)) out.push(`One more yum fills a heart for ${monsterName(m, game)}!`);

  // The cheapest thing in the shop, if the coins are there. (The shop opens
  // once the first order is sold.)
  if (game?.taught === true && Number.isFinite(game.money)) {
    const things = [
      ...foodsForSale(game).map(f => ({ price: FOODS[f].recipePrice, name: `the ${FOODS[f].name.toLowerCase()} recipe` })),
      ...upgradesForSale(game).map(u => ({ price: UPGRADES[u].price, name: `the ${UPGRADES[u].name.toLowerCase()}` })),
    ].sort((a, b) => a.price - b.price);
    if (things.length && things[0].price <= game.money) out.push(`We can buy ${things[0].name} now!`);
  }
  return out;
}

const share = (list, r) => list[Math.min(list.length - 1, Math.max(0, Math.floor(r * list.length)))];

// What Victoria says at the place: { kind: 'cheer' | 'joke' | 'tip', text }.
// About half the time it is a tip, when there is one to give.
// `order` is the order at the table (or null). Pass `last`, the text she said
// before, and she never says the same thing twice running.
// The text is plain text (it may hold the moon monster's name): escape it.
export function victoriaSays(game, order = null, rng = Math.random, last = null) {
  const fresh = list => list.filter(text => text !== last);
  const tip = fresh(tips(game, order)), cheer = fresh(CHEERS), joke = fresh(JOKES);
  const r = Math.min(1, Math.max(0, Number(rng()) || 0));
  if (tip.length && r < 0.5) return { kind: 'tip', text: share(tip, r / 0.5) };
  const rest = tip.length ? (r - 0.5) / 0.5 : r;
  return rest < 0.5 ? { kind: 'cheer', text: share(cheer, rest / 0.5) } : { kind: 'joke', text: share(joke, (rest - 0.5) / 0.5) };
}
